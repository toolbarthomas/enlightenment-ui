import { basename, extname, dirname, join, resolve, sep } from 'node:path'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { globSync } from 'glob'
import imagemin from 'imagemin'
import svgstore from 'svgstore'

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

      const sprite = stream.reduce(
        (store, blob, index) => {
          const directory = dirname(blob.sourcePath).split(sep)
          const name = basename(blob.sourcePath, extname(blob.sourcePath))

          return store.add(`${directory[directory.length - 1]}--${name}`, blob.data)
        },
        svgstore({
          inline: true,
          svgAttrs: {
            xmlns: 'http://www.w3.org/2000/svg'
          }
        })
      )

      if (!sprite) {
        throw Error('Unable to generate sprite without any entries...')
      }

      return callback(sprite.toString())
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
