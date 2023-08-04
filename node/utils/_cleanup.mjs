import { rimrafSync } from "rimraf";
import { join } from "node:path";
import { globSync } from "glob";
import config from "../config.mjs";

rimrafSync(
  globSync([join(config.outdir, "*")]).filter(
    (source) => !source.endsWith(".html")
  )
);
