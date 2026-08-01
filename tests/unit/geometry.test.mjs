import test from "node:test";
import assert from "node:assert/strict";

import {
  clientPointToViewBox,
  createRosaryGeometry,
  findNearestRosaryStepId,
  viewBoxPointToClient,
} from "../../dist/components/rosary-geometry.js";

function assertClose(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${message}: ${actual} !== ${expected}`);
}

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

test("opening Hail Mary beads follow the physical prayer direction", () => {
  const opening = createRosaryGeometry()
    .filter((point) => point.stepId.startsWith("opening-hail-"))
    .sort((left, right) => left.stepId.localeCompare(right.stepId));

  assert.deepEqual(
    opening.map((point) => [point.stepId, point.y]),
    [
      ["opening-hail-1", 560],
      ["opening-hail-2", 522],
      ["opening-hail-3", 484],
    ],
  );
});

test("the crucifix has no decorative bead layered over it", () => {
  const crucifix = createRosaryGeometry().find((point) => point.stepId === "crucifix");

  assert.equal(crucifix?.visualKind, "cross");
  assert.equal(crucifix?.radius, 0);
});

test("viewBox and browser coordinates round-trip through horizontal letterboxing", () => {
  const bounds = { left: 10, top: 20, width: 780, height: 720 };
  const browserPoint = viewBoxPointToClient(195, 675, bounds);

  assert.ok(browserPoint);
  assertClose(browserPoint.clientX, 400, "center x");
  assertClose(browserPoint.clientY, 695, "crucifix y");

  const viewBoxPoint = clientPointToViewBox(
    browserPoint.clientX,
    browserPoint.clientY,
    bounds,
  );
  assert.ok(viewBoxPoint);
  assertClose(viewBoxPoint.x, 195, "round-trip x");
  assertClose(viewBoxPoint.y, 675, "round-trip y");
});

test("viewBox and browser coordinates round-trip through vertical letterboxing", () => {
  const bounds = { left: 5, top: 10, width: 390, height: 1000 };
  const browserPoint = viewBoxPointToClient(0, 0, bounds);

  assert.ok(browserPoint);
  assertClose(browserPoint.clientX, 5, "left edge");
  assertClose(browserPoint.clientY, 150, "top letterbox offset");

  const viewBoxPoint = clientPointToViewBox(
    browserPoint.clientX,
    browserPoint.clientY,
    bounds,
  );
  assert.deepEqual(viewBoxPoint, { x: 0, y: 0 });
});

test("pointer locations inside letterbox margins are rejected", () => {
  const bounds = { left: 10, top: 20, width: 780, height: 720 };

  assert.equal(clientPointToViewBox(100, 300, bounds), null);
  assert.equal(clientPointToViewBox(700, 300, bounds), null);
});

test("every Rosary hit center survives a compact mobile SVG round-trip", () => {
  const bounds = { left: 0, top: -180, width: 360, height: 664.6153846154 };

  for (const bead of createRosaryGeometry()) {
    const browserPoint = viewBoxPointToClient(bead.x, bead.y, bounds);
    assert.ok(browserPoint, `Expected browser point for ${bead.stepId}`);

    const viewBoxPoint = clientPointToViewBox(
      browserPoint.clientX,
      browserPoint.clientY,
      bounds,
    );
    assert.ok(viewBoxPoint, `Expected viewBox point for ${bead.stepId}`);
    assert.equal(findNearestRosaryStepId(viewBoxPoint.x, viewBoxPoint.y), bead.stepId);
  }
});
