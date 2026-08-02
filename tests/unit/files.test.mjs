import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

test("PWA files exist", async () => {
  for (const path of [
    "public/manifest.webmanifest",
    "public/sw.js",
    "public/icons/icon-192.png",
    "public/icons/icon-512.png",
    "public/fonts/source-sans-3-400.woff2",
    "public/fonts/source-serif-4-400.woff2",
    "DESIGN.md",
  ]) {
    await access(path);
  }
});

test("design contract bans AI-slop chrome tells", async () => {
  const tokens = await readFile("src/styles/tokens.css", "utf8");
  const rosary = await readFile("src/styles/rosary.css", "utf8");
  const sheet = await readFile("src/styles/prayer-sheet.css", "utf8");
  const header = await readFile("src/components/progress-header.ts", "utf8");
  const prayer = await readFile("src/components/prayer-sheet.ts", "utf8");

  assert.doesNotMatch(tokens, /Inter/);
  assert.doesNotMatch(tokens, /#f5efe4/);
  assert.doesNotMatch(rosary, /progress-ring/);
  assert.doesNotMatch(rosary, /eyebrow/);
  assert.doesNotMatch(rosary, /box-shadow:\s*0\s+22px/);
  assert.doesNotMatch(sheet, /sheet-handle/);
  assert.doesNotMatch(sheet, /border-left:\s*4px\s+solid/);
  assert.doesNotMatch(header, /Interactive prayer guide/);
  assert.doesNotMatch(header, /progress-ring/);
  assert.match(header, /of \$\{totalSteps\} prayers/);
  assert.match(prayer, /split\(\/\\n\\n\+\//);
});

test("touch targets are at least 44px", async () => {
  const css = await readFile("src/styles/rosary.css", "utf8");
  assert.match(css, /min-width:\s*44px/);
  assert.match(css, /min-height:\s*44px/);
});

test("decade-close markers render as cord knots, not gold diamonds or mini beads", async () => {
  const map = await readFile("src/components/rosary-map.ts", "utf8");
  assert.match(map, /data-domain-part="transition"/);
  assert.match(map, /knot-visual/);
  assert.doesNotMatch(map, /rotate\(45/);
  assert.doesNotMatch(map, /transition-visual/);
  assert.doesNotMatch(map, /bead-visual--spacer/);

  const css = await readFile("src/styles/rosary.css", "utf8");
  assert.match(css, /\.knot-visual\s*\{\s*fill:\s*var\(--cord\)/);
});
