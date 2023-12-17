import { Enlightenment } from '@toolbarthomas/enlightenment/index.mjs'

/**
 * Esbuild utility reducer to define a valid loader configuration to use within the
 * builder context.
 *
 * @param {String | String[]} value = One or more values to assign as loader.
 *
 * @param {String} type Use the optional loader type or use 'copy' as default
 * loader behaviour.
 */
export const staticLoader = (value, type) => {
  const queue = (Array.isArray(value) ? value : [value]).filter((v) => typeof v === 'string')

  const n = typeof type === 'string' ? type : 'copy'

  const loader = queue.reduce((result, item) => {
    // current.defineProperty && current.defineProperty(previous);
    if (result instanceof Object) {
      result[item] = 'copy'
    }

    return result
  }, {})

  return loader || {}
}

/**
 * Defines the default extensions that are used to generate the UI package
 * correctly. We assume that the following extensions can be requested within
 * the component context:
 *   1. The imported asset from the script context: JS => import(foo.scss)
 *   2. Any imported asset from the script's imported assets: SCSS => @import(bar.png)
 */
export const defaultLoader = {
  ...staticLoader(Enlightenment.imageExtensions, 'copy'),
  ...staticLoader(Enlightenment.webfontExtensions, 'copy')
}
