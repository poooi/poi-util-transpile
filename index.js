#!/usr/bin/env node
const walk = require('walk')
const Promise = require('bluebird')
const path = require('path')
const fs = require('fs-extra')
const yargs = require('yargs')
const babel = Promise.promisifyAll(require('@babel/core'))
const { presets, plugins } = require('./babel.config')
const chalk = require('chalk')

/* eslint-disable prefer-destructuring */
const argv = yargs.usage('Usage: $0 [source] [options]')
  .string('sm')
  .alias('sm', 'source-map')
  .describe('sm', 'saves sourcemap to .js.map file and/or inline. same as babel sourceMaps option, if provided with no value, it will default to true')
  .boolean('replace')
  .describe('replace', 'removes .es files')
  .help('h')
  .alias('h', 'help')
  .argv
/* eslint-enable prefer-destructuring */

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
            const codePath = changeExt(srcPath, '.js')
            const mapPath = changeExt(srcPath, '.js.map')
            let result
            try {
              result = await babel.transformFileAsync(srcPath, {
                presets,
                plugins,
                babelrc: false,
                sourceMap: sm || true,
              })
              console.log(chalk.green(srcPath))
            } catch (e) {
              console.log(chalk.red(`Error in processing ${srcPath}`))
              console.error(e.stack)
              process.exitCode = 1
              return
            }
            const { code, map } = result
            await fs.writeFile(codePath, code)
            if (typeof sm !== 'undefined') {
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
  if (typeof argv.sm !== 'undefined') {
    console.info('Sourcemap generation enabled.')
  }
  if (argv.replace) {
    console.info('Replacing .es files.')
  }
  await compileToJsAsync(source, argv.replace, argv.sm)
}

main()
