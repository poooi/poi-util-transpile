#!/usr/bin/env node
const walk = require('walk')
const Promise = require('bluebird')
const path = require('path')
const fs = require('fs-extra')
const yargs = require('yargs')
const babel = Promise.promisifyAll(require('babel-core'))
const { presets, plugins } = require('./babel.config')

const argv = yargs.usage('Usage: $0 [source] [options]')
  .boolean('sm')
  .alias('sm', 'source-map')
  .describe('sm', 'save sourcemap to .js.map file')
  .boolean('replace')
  .describe('replace', 'removes .es files')
  .help('h')
  .alias('h', 'help')
  .argv

const changeExt = (srcPath, ext) => {
  const srcDir = path.dirname(srcPath)
  const srcBasename = path.basename(srcPath, path.extname(srcPath))
  return path.join(srcDir, srcBasename + ext)
}

const compileToJsAsync = (appDir, replace, sm) => {
  const targetExts = ['.es']

  const options = {
    followLinks: false,
    filters: ['node_modules', 'assets'],
  }

  return new Promise((resolve) => {
    const tasks = []
    walk.walk(appDir, options)
      .on('file', (root, fileStats, next) => {
        const extname = path.extname(fileStats.name).toLowerCase()
        if (targetExts.includes(extname)) {
          tasks.push(async () => {
            const srcPath = path.join(root, fileStats.name)
            console.log(srcPath)
            const codePath = changeExt(srcPath, '.js')
            const mapPath = changeExt(srcPath, '.js.map')
            let result
            try {
              result = await babel.transformFileAsync(srcPath, {
                presets: presets.map(p => require.resolve(`babel-preset-${p}`)),
                plugins: plugins.map(p => require.resolve(`babel-plugin-${p}`)),
                sourceMap: true,
              })
            } catch (e) {
              return
            }
            const { code, map } = result
            await fs.writeFile(codePath, code)
            if (sm) {
              await fs.outputJson(mapPath, map)
            }
            if (replace) {
              await fs.remove(srcPath)
            }
          })
        }
        next()
      })
      .on('end', async () => {
        resolve(await Promise.all(tasks.map(f => f())))
      })
  })
}

const main = async () => {
  const source = path.resolve(process.cwd(), argv._[0] || process.cwd())
  console.info('compiling', source)
  if (argv.sm) {
    console.info('Sourcemap generation enabled.')
  }
  if (argv.replace) {
    console.info('Replacing .es files.')
  }
  await compileToJsAsync(source, argv.replace, argv.sm)
}

main()
