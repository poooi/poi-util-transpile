#!/usr/bin/env node
import walk from 'walk'
import path from 'path'
import fs from 'fs-extra'
import yargs from 'yargs'
import chalk from 'chalk'
import cosmiconfig from 'cosmiconfig'
import _ from 'lodash'
import micromatch from 'micromatch'
import { transformFileAsync } from '@babel/core'

const explorer = cosmiconfig('poi-transpile')

const { presets, plugins } = require('./babel.config')

/* eslint-disable prefer-destructuring */
const argv = yargs
  .usage('Usage: $0 [source] [options]')
  .string('sm')
  .alias('sm', 'source-map')
  .describe(
    'sm',
    'saves sourcemap to .js.map file and/or inline. same as babel sourceMaps option, if provided with no value, it will default to true',
  )
  .boolean('replace')
  .describe('replace', 'removes .es files')
  .help('h')
  .alias('h', 'help').argv
/* eslint-enable prefer-destructuring */

export const changeExt = (srcPath, ext) => {
  const srcDir = path.dirname(srcPath)
  const srcBasename = path.basename(srcPath, path.extname(srcPath))
  return path.join(srcDir, srcBasename + ext)
}

export const defaultInclude = ['es', 'ts', 'tsx'].map(ext => `**/*.${ext}`)
export const defaultExclude = ['**/*.d.ts']

export const getMatcher = (include, exclude) => include.concat(exclude.map(glob => `!${glob}`))
export const testMatch = (target, include, exclude) => {
  return micromatch.isMatch(target, include) && !micromatch.isMatch(target, exclude)
}

const compileToJsAsync = async (appDir, replace, sm) => {
  let cosmicResult

  try {
    cosmicResult = await explorer.search()
  } catch (e) {
    console.error('Cannot read the config file.')
  }

  const options = {
    followLinks: false,
    filters: ['node_modules', '.git'],
  }

  const include = _.toArray(_.get(cosmicResult, ['config', 'include'], defaultInclude))
  const exclude = _.toArray(_.get(cosmicResult, ['config', 'exclude'], defaultExclude))

  return new Promise(resolve => {
    const tasks = []
    walk
      .walk(appDir, options)
      .on('file', (root, fileStats, next) => {
        const match = testMatch(fileStats.name, include, exclude)
        if (match) {
          tasks.push(async () => {
            const srcPath = path.join(root, fileStats.name)
            const codePath = changeExt(srcPath, '.js')
            const mapPath = changeExt(srcPath, '.js.map')
            let result
            try {
              result = await transformFileAsync(srcPath, {
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

if (require.main === module) {
  main()
}
