import esbuild from 'esbuild'
import { stylePlugin } from '@toolbarthomas/enlightenment/node/esbuild.style.plugin.mjs'
import { resolvePlugin } from '@toolbarthomas/enlightenment/node/esbuild.resolve.plugin.mjs'
import { argv } from '@toolbarthomas/enlightenment/node/argv.mjs'
import { globSync } from 'glob'

import config from './config.mjs'
import { svgspritePlugin } from './esbuild.svgsprite.plugin.mjs'

import { defaultLoader } from './utils/loader.mjs'
;(async () => {
  const options = {
    bundle: true,
    entryPoints: [...globSync('./src/components/*.ts'), ...globSync('./src/plugins/*.ts')],
    format: argv.format || 'esm',
    keepNames: true,
    loader: { ...defaultLoader },
    minify: argv.m || argv.minify || false,
    outdir: config.outdir,
    outExtension: config.outExtension,
    platform: argv.platform || 'browser',
    plugins: [
      resolvePlugin({
        destination: `${argv.d ? './' : '../'}${argv.name || 'Enlightenment'}${
          config.outExtension['.js']
        }`,
        excludeFramework: !argv.d,
        extension: config.outExtension['.js']
      }),
      stylePlugin(),
      svgspritePlugin()
    ]
  }

  if (argv.d || argv.devmode) {
    const context = await esbuild.context(options)
    context.serve({ servedir: options.outdir }).then((result) => {
      console.log(
        `Enlightenment UI test server starter: ${result.host}:${result.port} => ${config.outdir}`
      )
    })
  } else {
    esbuild.build(options).then(() => {
      console.log(`Enlightenment UI library created: ${options.outdir}/*${config.suffix}.js`)
    })
  }
})()
