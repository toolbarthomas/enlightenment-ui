import esbuild from "esbuild";
import { stylePlugin } from "@toolbarthomas/enlightenment/node/esbuild.style.plugin.mjs";
import { resolvePlugin } from "@toolbarthomas/enlightenment/node/esbuild.resolve.plugin.mjs";
import { argv } from "@toolbarthomas/enlightenment/node/argv.mjs";

(async () => {
  const format = argv.f || argv.format || "esm";
  const suffix = argv.m || argv.minify ? ".min" : "";
  const outExtension = {
    ".js": `${suffix}${format === "cjs" ? ".cjs" : ".js"}`,
  };

  esbuild
    .build({
      bundle: true,
      entryPoints: ["./src/index.ts"],
      format: "esm",
      keepNames: true,
      outdir: "dist",
      outExtension,
      plugins: [
        resolvePlugin({
          destination: `./enlightenment${suffix}.js`,
          minify: argv.m || argv.minify || false,
        }),
        stylePlugin(),
      ],
    })
    .then(() => {
      console.log("Done");
    });
})();
