import { Buffer } from "node:buffer";
import isSvg from "is-svg";
import SVGO from "svgo";

/**
 * Custom Imagemin Plugin that will cleanup the unused SVG attributes to ensure
 * the SVG is rendered correclty within the DOM.
 *
 * @param {Buffer} buffer Optimizes the given Buffer entry.
 */
export const svgOptimizer = async (buffer) => {
  let b = buffer;

  if (!isSvg(b.toString())) {
    return Promise.resolve(buffer);
  }

  if (Buffer.isBuffer(buffer)) {
    b = buffer.toString();
  }

  let result;

  try {
    result = SVGO.optimize(b, {
      plugins: [
        {
          name: "preset-default",
          params: {
            overrides: {
              convertPathData: false,
              removeViewBox: false,
              convertColors: {
                currentColor: true,
              },
            },
            removeAttrs: {
              preserveCurrentColor: true,
              attrs: "-",
            },
          },
        },
      ],
    });
  } catch (exception) {
    throw Error(exception);
  }

  return result.data
    ? Buffer.from(result.data)
    : Error(`Unable to generate sprite...`);
};
