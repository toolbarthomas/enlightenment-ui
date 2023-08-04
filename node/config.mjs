import { argv } from "@toolbarthomas/enlightenment/node/argv.mjs";

const suffix = argv.m || argv.minify ? ".min" : "";
const outExtension = {
  ".js": `${suffix}.js`,
};

export default {
  outdir: "dist",
  suffix,
  outExtension,
};
