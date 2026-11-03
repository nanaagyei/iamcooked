import { build } from "esbuild";
import { readFileSync, chmodSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  outfile: "dist/iamcooked.mjs",
  // CJS deps (yaml) call require() for node builtins; give the ESM bundle a real require.
  banner: { js: "#!/usr/bin/env node\nimport { createRequire as __cr } from \"node:module\"; const require = __cr(import.meta.url);" },
  define: { __IAMCOOKED_VERSION__: JSON.stringify(pkg.version) },
  // `yaml` (pnpm-lock parsing) is bundled so the published CLI has zero runtime deps.
  legalComments: "none",
  logLevel: "info",
});
chmodSync("dist/iamcooked.mjs", 0o755);
