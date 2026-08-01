import test from "node:test";
import assert from "node:assert/strict";

import {
  createRosaryGeometry,
  findNearestRosaryStepId,
} from "../../dist/components/rosary-geometry.js";

test("empty center taps do not select a random bead", () => {
  assert.equal(findNearestRosaryStepId(195, 220), null);
});

test("each visual step resolves to itself at its center", () => {
  for (const point of createRosaryGeometry()) {
    assert.equal(findNearestRosaryStepId(point.x, point.y), point.stepId);
  }
});

test("crowded loop taps choose the nearest bead instead of DOM order", () => {
  const loop = createRosaryGeometry().slice(0, 55);
  const first = loop[0];
  const second = loop[1];
  const nearFirstX = first.x * 0.8 + second.x * 0.2;
  const nearFirstY = first.y * 0.8 + second.y * 0.2;

  assert.equal(findNearestRosaryStepId(nearFirstX, nearFirstY), first.stepId);
});
