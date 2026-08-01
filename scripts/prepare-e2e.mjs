import { execFileSync } from "node:child_process";
import { cp, mkdir } from "node:fs/promises";
import process from "node:process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";

execFileSync(npm, ["run", "build"], { stdio: "inherit" });

await mkdir("dist/test-fixtures", { recursive: true });
await cp("tests/fixtures/sw-v2.js", "dist/test-fixtures/sw-v2.js");
await cp("tests/fixtures/progress-v2.js", "dist/test-fixtures/progress-v2.js");

console.log("Prepared browser-only v2 upgrade fixtures in dist/test-fixtures/.");
