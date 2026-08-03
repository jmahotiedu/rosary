import test from "node:test";
import assert from "node:assert/strict";

import {
  clientPointToViewBox,
  createRosaryGeometry,
  findNearestRosaryStepId,
  viewBoxPointToClient,
} from "../../dist/components/rosary-geometry.js";
import { renderRosaryMap } from "../../dist/components/rosary-map.js";

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

test("the loop is open: its widest angular gap flanks the centerpiece", () => {
  const loopCenter = { x: 195, y: 215 };
  const loop = createRosaryGeometry().filter(
    (point) => point.visualKind === "bead" && point.stepId.startsWith("decade-"),
  );
  assert.equal(loop.length, 55);

  const angles = loop
    .map((point) => Math.atan2(point.y - loopCenter.y, point.x - loopCenter.x))
    .sort((left, right) => left - right);
  const spans = angles.map((angle, index) => {
    const next = angles[(index + 1) % angles.length];
    const span =
      index === angles.length - 1 ? next + 2 * Math.PI - angle : next - angle;
    return { angle, span };
  });
  const widest = spans.reduce((a, b) => (b.span > a.span ? b : a));
  const typical = [...spans].sort((a, b) => a.span - b.span)[27];

  assert.ok(
    widest.span > typical.span * 3,
    `widest gap ${widest.span} should dwarf typical ${typical.span}`,
  );
  const straightDown = Math.PI / 2;
  assert.ok(
    widest.angle < straightDown && widest.angle + widest.span > straightDown,
    "the gap must open toward the centerpiece below the loop",
  );
});

test("decade one starts at the right loop end and decade five ends at the left", () => {
  const geometry = createRosaryGeometry();
  const firstOurFather = geometry.find(
    (point) => point.stepId === "decade-1-our-father",
  );
  const lastHail = geometry.find((point) => point.stepId === "decade-5-hail-10");

  assert.ok(firstOurFather.x > 195, "decade 1 begins right of the centerpiece");
  assert.ok(lastHail.x < 195, "decade 5 ends left of the centerpiece");
  assert.ok(
    Math.abs(firstOurFather.y - lastHail.y) < 1,
    "the two loop ends sit level",
  );
});

test("the strand runs centerpiece to crucifix in physical prayer order", () => {
  const geometry = createRosaryGeometry();
  const y = (id) => geometry.find((point) => point.stepId === id).y;

  assert.ok(y("opening-glory") < y("opening-hail-3"));
  assert.ok(y("opening-hail-3") < y("opening-hail-2"));
  assert.ok(y("opening-hail-2") < y("opening-hail-1"));
  assert.ok(y("opening-hail-1") < y("opening-our-father"));
  assert.ok(y("opening-our-father") < y("crucifix"));
});

test("every decade-close knot hugs its decade's last Hail Mary bead", () => {
  const geometry = createRosaryGeometry();
  for (let decade = 1; decade <= 5; decade += 1) {
    const knot = geometry.find((point) => point.stepId === `decade-${decade}-close`);
    const lastBead = geometry.find(
      (point) => point.stepId === `decade-${decade}-hail-10`,
    );
    const distance = Math.hypot(knot.x - lastBead.x, knot.y - lastBead.y);
    assert.ok(
      distance <= 14,
      `decade ${decade} knot floats ${distance.toFixed(1)}px from its last bead`,
    );
  }
});

test("the cord joins the loop ends to the centerpiece without closing the ring", () => {
  const markup = renderRosaryMap("crucifix", []);
  const cord = markup.match(/<g class="rosary-cord">([\s\S]*?)<\/g>/)[1];

  assert.equal(
    (cord.match(/<line/g) ?? []).length,
    54,
    "an open loop has 54 intra-loop cord segments, not a 55-segment ring",
  );
  assert.equal(
    (cord.match(/<path/g) ?? []).length,
    3,
    "two loop-end cords to the centerpiece plus one strand cord",
  );
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
