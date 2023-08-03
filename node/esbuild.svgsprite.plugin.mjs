import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, dirname, join, resolve, sep } from "node:path";

import imagemin from "imagemin";
import svgstore from "svgstore";
import { globSync } from "glob";
import { mkdirpSync } from "mkdirp";
import { rimrafSync } from "rimraf";

/**
 * Generates a new optimized SVG sprite from the defined sources that should be
 * resolved within the build directory.
 * @param {String | String[]} sources Generates the sprite from the defined
 * source(s).
 */
export const generateSVGSprite = (sources, destination) => {
  return new Promise((callback) => {
    const entry = Array.isArray(sources) ? sources : [sources];

    if (!entry.length) {
      return callback();
    }

    imagemin(entry, { plugins: [] }).then((stream) => {
      if (!stream.length) {
        throw Error(
          `Unable to optimize sprite, no valid Buffer has been assigned for ${this.name}`
        );
      }

      const sprite = stream.reduce(
        (store, blob, index) => {
          const directory = dirname(blob.sourcePath).split(sep);
          const name = basename(blob.sourcePath, extname(blob.sourcePath));

          return store.add(
            `${directory[directory.length - 1]}--${name}`,
            blob.data
          );
        },
        svgstore({
          inline: true,
          svgAttrs: {
            xmlns: "http://www.w3.org/2000/svg",
          },
        })
      );

      if (!sprite) {
        throw Error("Unable to generate sprite without any entries...");
      }

      // try {
      //   existsSync(destination) && rimrafSync(destination);
      //   mkdirpSync(dirname(destination));
      //   writeFileSync(destination, sprite);
      //   console.log("write");
      // } catch (error) {
      //   if (error) {
      //     throw Error(error.toString());
      //   }
      // }

      return callback(sprite.toString());
    });
  });
};

export const svgspritePlugin = () => ({
  name: "svgsprite",
  setup(build) {
    build.onResolve({ filter: /.svg$/ }, async (args) => {
      if (existsSync(args.path)) {
        return {
          path: args.path,
          namespace: "file",
        };
      }

      return {
        path: args.path,
        namespace: "sprite",
      };

      return { external: true, namespace: "sprite" };
    });

    // Ensure the imported svg path is resolved to the build directory.
    build.onLoad({ filter: /\.svg$/, namespace: "sprite" }, async (args) => {
      let contents = "";

      if (!existsSync(args.path)) {
        const cwd = dirname(args.path);
        const sources = globSync(join("*", cwd, "*.svg")).filter(
          (source) => resolve(source) != resolve(args.path)
        );

        contents = await generateSVGSprite(sources, args.path);
      }

      return {
        contents,
        loader: "file",
      };
    });

    // // Ensure the svgsprite is generated within the build directory.
    // build.onResolve({ filter: /sprite.svg$/ }, async (args) => {
    //   const cwd = dirname(args.path);
    //   const sources = globSync(join("*", cwd, "*.svg")).filter(
    //     (source) => resolve(source) != resolve(args.path)
    //   );

    //   const sprite = await generateSVGSprite(sources);

    //   console.log("Mysprite", sprite);

    //   if (existsSync(args.path)) {
    //     return;
    //   }
    //   console.log(args);

    //   return {
    //     // path: args.path,
    //     external: true,
    //     namespace: "file",
    //   };
    // });
  },
});
