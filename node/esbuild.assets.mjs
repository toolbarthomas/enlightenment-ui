import esbuild from "esbuild";
import { stylePlugin } from "@toolbarthomas/enlightenment/node/esbuild.style.plugin.mjs";
import { resolvePlugin } from "@toolbarthomas/enlightenment/node/esbuild.resolve.plugin.mjs";
import { argv } from "@toolbarthomas/enlightenment/node/argv.mjs";

import { Enlightenment } from "@toolbarthomas/enlightenment/index.mjs";
import { defaultLoader, staticLoader } from "./utils/loader.mjs";

(async () => {
  const suffix = argv.m || argv.minify ? ".min" : "";
  const outdir = "dist";
  const outExtension = {
    ".js": `${suffix}.js`,
  };

  const config = {
    bundle: true,
    entryPoints: ["src/index.ts"],
    format: "esm",
    keepNames: true,
    loader: { ...defaultLoader },
    minify: argv.m || argv.minify || false,
    outdir,
    outExtension,
    platform: "browser",
    plugins: [stylePlugin()],
  };

  if (argv.d || argv.devmode) {
    (await esbuild.context(config)).watch();
  } else {
    esbuild.build(config).then(() => {
      console.log(`Enlightenment assets generated: ${outdir}/*${suffix}.js`);
    });
  }
})();
