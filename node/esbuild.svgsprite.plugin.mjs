import { basename, extname, dirname, join, resolve, sep } from 'node:path'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { globSync } from 'glob'
import imagemin from 'imagemin'
import spriter from 'svg-sprite'

import { svgOptimizer } from './utils/optimizers.mjs'

/**
 * Generates a new optimized SVG sprite from the defined sources that should be
 * resolved within the build directory.
 *
 * @param {String | String[]} sources Generates the sprite from the defined
 * source(s).
 */
export const generateSVGSprite = (sources) => {
  return new Promise((callback) => {
    const entry = Array.isArray(sources) ? sources : [sources]

    if (!entry.length) {
      return callback()
    }

    imagemin(entry, { plugins: [svgOptimizer] }).then((stream) => {
      if (!stream.length) {
        throw Error(`Unable to optimize sprite, no valid Buffer has been assigned for ${this.name}`)
      }

      const compiler = new spriter({
        mode: {
          css: false,
          view: false,
          defs: false,
          symbol: {
            inline: true
          }
        }
      })

      stream.forEach((blob) => {
        const directory = dirname(blob.sourcePath).split(sep)
        const name = basename(blob.sourcePath)

        compiler.add(blob.sourcePath, name, Buffer.from(blob.data).toString())
      })

      return compiler.compileAsync().then(({ result }) => {
        const chunk = result.symbol ? result.symbol : result.defs

        if (!chunk || !chunk.sprite || !chunk.sprite.contents) {
          throw Error(`Unable to compile SVG sprite from: ${entry}...`)
        }

        return callback(chunk.sprite.contents.toString())
      })
    })
  })
}

/**
 * Additional SVG loader that resolves non-existing SVG source as optional
 * spritesheet. The spritesheet will be generated from the svg entries that are
 * relative from the defined path:
 *
 * import(images/svg/sprite.svg) // Reads entries from 'image/svg' directory.
 *
 * Keep in mind that at least 1 SVG source needs to be present within the
 * actual context directory, Esbuild does not know how to resolve the
 * defined import otherwise.
 */
export const svgspritePlugin = () => ({
  name: 'svgsprite',
  setup(build) {
    build.onResolve({ filter: /.svg$/ }, async (args) => {
      if (existsSync(args.path)) {
        return {
          path: args.path,
          namespace: 'file'
        }
      }

      return {
        path: args.path,
        namespace: 'sprite',
        pluginData: args.importer
      }

      return { external: true, namespace: 'sprite' }
    })

    // Ensure the imported svg path is resolved to the build directory.
    build.onLoad({ filter: /\.svg$/, namespace: 'sprite' }, async (args) => {
      let contents = ''

      if (!existsSync(args.path)) {
        const cwd = dirname(args.path)
        const sources = globSync(join('*', cwd, '*.svg')).filter(
          (source) => resolve(source) != resolve(args.path)
        )

        if (!sources.length) {
          console.warn(`No SVG source has been found within '${cwd}', ESbuild will throw an Error:`)
        }

        console.log(`Generate sprite "${basename(args.path)}" for: ${args.pluginData}`)
        contents = await generateSVGSprite(sources, args.path)
      }

      return {
        contents,
        loader: 'file'
      }
    })
  }
})
