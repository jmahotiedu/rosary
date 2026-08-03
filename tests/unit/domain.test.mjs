import test from "node:test";
import assert from "node:assert/strict";

import { MYSTERIES } from "../../dist/data/mysteries.js";
import { PRAYERS } from "../../dist/data/prayers.js";
import { ROSARY_SEQUENCE } from "../../dist/data/rosary-sequence.js";

test("Fatima Prayer matches the USCCB wording", () => {
  assert.equal(
    PRAYERS["fatima-prayer"].text,
    "O my Jesus, forgive us our sins, save us from the fires of hell; lead all souls to Heaven, especially those who have most need of your mercy.",
  );
});

test("versicle and response carry liturgical V./R. leaders", () => {
  const lines = PRAYERS["versicle-response"].text.split("\n").filter(Boolean);
  assert.equal(lines[0], "V. Pray for us, O holy Mother of God.");
  assert.equal(lines[1], "R. That we may be made worthy of the promises of Christ.");
});

test("every mystery set has five complete entries with scripture", () => {
  for (const setId of ["joyful", "sorrowful", "glorious", "luminous"]) {
    const set = MYSTERIES[setId];
    assert.equal(set.length, 5, `${setId} should have five mysteries`);
    for (const mystery of set) {
      assert.ok(mystery.name.length > 0, `${setId} mystery needs a name`);
      assert.ok(mystery.meditation.length > 0, `${mystery.name} needs a meditation`);
      assert.match(mystery.scripture, /^\w+ \d+:\d+/, `${mystery.name} needs a citation`);
    }
  }
});

test("luminous mysteries use the USCCB names", () => {
  assert.deepEqual(
    MYSTERIES.luminous.map((mystery) => mystery.name),
    [
      "The Baptism of Christ in the Jordan",
      "The Wedding Feast at Cana",
      "Jesus’ Proclamation of the Coming of the Kingdom of God",
      "The Transfiguration",
      "The Institution of the Eucharist",
    ],
  );
});

test("the prayer sequence still walks a full five-decade Rosary", () => {
  assert.equal(ROSARY_SEQUENCE.length, 67);
});
