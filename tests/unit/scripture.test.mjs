import test from "node:test";
import assert from "node:assert/strict";

import { MYSTERIES } from "../../dist/data/mysteries.js";
import { SCRIPTURE_PASSAGES } from "../../dist/data/scripture-passages.js";
import { renderPrayerSheet } from "../../dist/components/prayer-sheet.js";
import { getStep } from "../../dist/domain/sequence.js";

const NAV = { atStart: false, atEnd: false, rosaryComplete: false };

test("every mystery scripture citation has its full passage text", () => {
  for (const set of Object.values(MYSTERIES)) {
    for (const mystery of set) {
      const passage = SCRIPTURE_PASSAGES[mystery.scripture];
      assert.ok(passage, `missing passage for ${mystery.scripture}`);
      assert.ok(
        passage.length > 40,
        `passage for ${mystery.scripture} looks truncated (${passage?.length ?? 0} chars)`,
      );
    }
  }
});

test("decade steps offer the mystery's full passage in a dropdown", () => {
  const html = renderPrayerSheet(getStep("decade-1-hail-4"), "joyful", NAV);

  assert.match(html, /<details class="scripture-passage">/);
  assert.match(html, /Luke 1:26–38/);
  assert.match(html, /Gabriel/);
});

test("every decade step offers the passage, from the Our Father through the close", () => {
  for (const id of ["decade-3-our-father", "decade-3-hail-10", "decade-3-close"]) {
    const html = renderPrayerSheet(getStep(id), "sorrowful", NAV);
    assert.match(html, /<details class="scripture-passage">/, `${id} lacks the passage dropdown`);
    assert.match(html, /Matthew 27:27–31/, `${id} shows the wrong passage`);
  }
});

test("steps without a mystery context show no passage dropdown", () => {
  const html = renderPrayerSheet(getStep("crucifix"), "joyful", NAV);
  assert.doesNotMatch(html, /scripture-passage/);
});
