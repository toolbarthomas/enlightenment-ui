import esbuild from "esbuild";
import { stylePlugin } from "@toolbarthomas/enlightenment/node/esbuild.style.plugin.mjs";
import { resolvePlugin } from "@toolbarthomas/enlightenment/node/esbuild.resolve.plugin.mjs";
import { argv } from "@toolbarthomas/enlightenment/node/argv.mjs";
import { globSync } from "glob";

import { svgspritePlugin } from "./esbuild.svgsprite.plugin.mjs";

(async () => {
  const format = argv.f || argv.format || "esm";
  const suffix = argv.m || argv.minify ? ".min" : "";
  const outdir = "dist";
  const outExtension = {
    ".js": `${suffix}${format === "cjs" ? ".cjs" : ".js"}`,
  };

  const config = {
    bundle: true,
    entryPoints: [...globSync("./src/components/*.ts")],
    format: "esm",
    keepNames: true,
    outdir,
    outExtension,
    platform: "browser",
    plugins: [
      resolvePlugin({
        destination: `./enlightenment${suffix}.js`,
        minify: argv.m || argv.minify || false,
      }),
      stylePlugin(),
      svgspritePlugin(),
    ],
  };

  if (argv.s || argv.serve) {
    (await esbuild.context(config))
      .serve({ servedir: "dist" })
      .then((result) => {
        console.log(
          `Enlightenment UI test server starter: ${result.host}:${result.port}`
        );
      });
  } else {
    esbuild.build(config).then(() => {
      console.log(`Enlightenment UI library created: ${outdir}/*${suffix}.js`);
    });
  }
})();
