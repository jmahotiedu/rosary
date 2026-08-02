import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("service worker invalidates pre-recovery assets and refreshes navigation", async () => {
  const source = await readFile("public/sw.js", "utf8");

  assert.match(source, /const CACHE_NAME = "rosary-v5"/);
  assert.doesNotMatch(source, /const CACHE_NAME = "rosary-v4"/);
  assert.match(source, /keys\.filter\(\(key\) => key !== CACHE_NAME\)/);
  assert.match(source, /networkFirst/);
  assert.match(source, /staleWhileRevalidate/);
  assert.match(source, /SKIP_WAITING/);
});

test("registration bypasses cached service-worker scripts and reloads once", async () => {
  const source = await readFile("src/app/register-service-worker.ts", "utf8");

  assert.match(source, /updateViaCache:\s*"none"/);
  assert.match(source, /controllerchange/);
  assert.match(source, /registration\.update\(\)/);
});
