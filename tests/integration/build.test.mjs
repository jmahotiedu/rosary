import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

test("app separates inspection, completion, and backward navigation", async () => {
  const source = await readFile("src/app/app.ts", "utf8");
  assert.match(source, /selectStep/);
  assert.match(source, /advanceStep/);
  assert.match(source, /retreatStep/);
  assert.match(source, /data-rosary-stage/);
});

test("progress is session-only: no storage persistence module", async () => {
  const source = await readFile("src/app/app.ts", "utf8");
  assert.match(source, /createInitialState/);
  assert.doesNotMatch(source, /persistence|loadState|saveState|localStorage/);
  await assert.rejects(access("src/app/persistence.ts"));
});
