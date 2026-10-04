// Runs the cross-engine test bundle under every JavaScript engine available on
// this machine: node (V8), plus Hermes and JavaScriptCore if jsvu has installed
// them (see .github/workflows/cross-engine.yml).
//
// Engines are skipped with a notice when their binary is absent, so this is
// safe to run locally without jsvu. Pass a single engine name to run only that
// one, e.g. `node test/cross-engine/run.js hermes`.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const bundle = "test/cross-engine/bundle.js";
const jsvuBin = join(homedir(), ".jsvu", "bin");
const path = [jsvuBin, process.env.PATH].filter(Boolean).join(":");

const engines = [
  { name: "node", cmd: process.execPath },
  { name: "hermes", cmd: "hermes" },
  { name: "javascriptcore", cmd: "javascriptcore" },
];

const requested = process.argv[2];
const selected = requested
  ? engines.filter((engine) => engine.name === requested)
  : engines;

if (requested && selected.length === 0) {
  console.error(`Unknown engine "${requested}"`);
  process.exit(1);
}

let failed = false;

for (const engine of selected) {
  if (
    engine.cmd !== process.execPath &&
    !existsSync(join(jsvuBin, engine.cmd))
  ) {
    console.log(
      `SKIP: ${engine.name} is not installed. Install it with \`npx jsvu --os=linux64 --engines=${engine.name}\`.`
    );
    continue;
  }

  const env = Object.assign({}, process.env, { PATH: path });
  const result = spawnSync(engine.cmd, [bundle], { stdio: "inherit", env });

  if (result.error) {
    console.error(
      `FAIL: could not run ${engine.name}: ${result.error.message}\n`
    );
    failed = true;
  } else if (result.status !== 0) {
    console.error(`FAIL: ${engine.name} exited with code ${result.status}\n`);
    failed = true;
  }
}

if (failed) {
  console.error("Cross-engine tests failed.\n");
  process.exit(1);
}

console.log("\nAll available engines passed.\n");
