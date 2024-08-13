import esbuild from 'esbuild'
import { stylePlugin } from '@toolbarthomas/enlightenment/stylePlugin'

import { parse } from '@toolbarthomas/argumentje'

import config from './config.mjs'
import { defaultLoader } from './utils/loader.mjs'
;(async () => {
  const argv = parse()

  const options = {
    bundle: true,
    entryPoints: ['src/index.ts'],
    format: argv.format || 'esm',
    keepNames: true,
    loader: { ...defaultLoader },
    minify: argv.m || argv.minify || false,
    outdir: config.outdir,
    outExtension: config.outExtension,
    platform: argv.platform || 'browser',
    // We don't need the Enlightenment resolvePlugin since we only want to
    // include global assets within this builder context.
    plugins: [stylePlugin()]
  }

  if (argv.d || argv.devmode) {
    const context = await esbuild.context(options)
    await context.watch()
    console.log(`Watching for changes from: ${options.entryPoints.join(', ')}`)
  } else {
    esbuild.build(options).then(() => {
      console.log(`Enlightenment assets generated: ${options.outdir}/*${config.suffix}.js`)
    })
  }
})()
