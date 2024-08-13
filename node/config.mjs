import { parse } from '@toolbarthomas/argumentje'

const argv = parse()

const suffix = argv.m || argv.minify ? '.min' : ''
const outExtension = {
  '.js': `${suffix}.js`
}

export default {
  outdir: 'dist',
  suffix,
  outExtension
}
