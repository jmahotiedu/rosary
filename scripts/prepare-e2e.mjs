import { execFileSync } from "node:child_process";
import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const buildScript = path.join(root, "scripts", "build.mjs");

execFileSync(process.execPath, [buildScript], {
  stdio: "inherit",
  cwd: root,
});

await mkdir("dist/test-fixtures", { recursive: true });
// A worker can only claim scopes at or below its own directory unless the server adds a
// Service-Worker-Allowed header. Place the browser-only v2 worker at the app root so it can
// accurately control /rosary/. The stale app modules remain under a test-only source directory
// and are inserted into the v2 cache under their historical production URLs by Playwright.
await cp("tests/fixtures/sw-v2.js", "dist/sw-v2-fixture.js");
await cp("tests/fixtures/main-v2.js", "dist/test-fixtures/main-v2.js");
await cp("tests/fixtures/progress-v2.js", "dist/test-fixtures/progress-v2.js");

console.log("Prepared browser-only active-v2 upgrade fixtures in dist/.");
