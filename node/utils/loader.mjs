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
  const queue = (Array.isArray(value) ? value : [value]).filter(
    (v) => typeof v === "string"
  );

  const n = typeof type === "string" ? type : "copy";

  const loader = queue.reduce((result, item) => {
    // current.defineProperty && current.defineProperty(previous);
    if (result instanceof Object) {
      result[item] = "copy";
    }

    return result;
  }, {});

  return loader || {};
};
