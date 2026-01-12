// Converts the ESM library file to commonJS for backwards compatibility with older node.js versions and projects
// kind of dumb, but works better than all the "smarter" options I tried

import { readFileSync, writeFileSync } from "node:fs";

const inFile = "lib/set-cookie.js";
const outFile = "dist/set-cookie.cjs";

const header = `// Generated automatically from ${inFile}; see build-cjs.js\n\n`;
const cjsExports = `module.exports = parseSetCookie;\n`; // the other exports are properties on parseSetCookie

const input = readFileSync(inFile, { encoding: "utf8" });
const output = header + input.split("// EXPORTS")[0] + cjsExports;
writeFileSync(outFile, output);

console.log(`Wrote ${output.length} bytes to ${outFile}`);
