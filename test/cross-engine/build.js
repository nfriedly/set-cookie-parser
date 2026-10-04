// Bundles the library and its cross-engine tests into a single standalone
// script that any JavaScript engine can run from the command line - including
// Hermes and JavaScriptCore, which provide no `require`, `module`, or other
// module loader.
//
// Run via `npm run test:cross-engine:build`.

import { readFileSync, writeFileSync } from "node:fs";

const libraryFile = "lib/set-cookie.js";
const testsFile = "test/cross-engine/assertions.js";
const outFile = "test/cross-engine/bundle.js";

// Strip the ESM export section. What remains is a set of top-level function
// declarations, which become plain globals once inlined into a classic script.
const library = readFileSync(libraryFile, { encoding: "utf8" })
  .split("// EXPORTS")[0]
  .trimEnd();

const tests = readFileSync(testsFile, { encoding: "utf8" }).trimEnd();

const bundle = `// Generated automatically by test/cross-engine/build.js - do not edit.
//
// Runs the same assertions under node (V8), Hermes, and JavaScriptCore so that
// engine-specific behavior - notably how \`new Date(string)\` handles the
// HTTP-date formats RFC 6265 requires senders to produce - is covered by the
// test suite. See #35.

${library}

${tests}
`;

writeFileSync(outFile, bundle);

console.log(`Wrote ${bundle.length} bytes to ${outFile}`);
