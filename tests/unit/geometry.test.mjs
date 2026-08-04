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
    if (point.stepId === "") continue; // connector beads carry no prayer step
    assert.equal(findNearestRosaryStepId(point.x, point.y), point.stepId);
  }
});

test("crowded loop taps choose the nearest bead instead of DOM order", () => {
  const geometry = createRosaryGeometry();
  const first = geometry.find((point) => point.stepId === "decade-1-hail-1");
  const second = geometry.find((point) => point.stepId === "decade-1-hail-2");
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
      ["opening-hail-1", 568],
      ["opening-hail-2", 530],
      ["opening-hail-3", 492],
    ],
  );
});

test("the crucifix has no decorative bead layered over it", () => {
  const crucifix = createRosaryGeometry().find((point) => point.stepId === "crucifix");

  assert.equal(crucifix?.visualKind, "cross");
  assert.equal(crucifix?.radius, 0);
});

test("the loop carries 4 large Our Father beads and the rosary 6 large beads in total", () => {
  const geometry = createRosaryGeometry();
  const largeBeads = geometry.filter((point) => point.large && point.visualKind === "bead");
  const loopLarge = largeBeads
    .filter((point) => point.stepId.startsWith("decade-"))
    .map((point) => point.stepId);

  assert.deepEqual(loopLarge, [
    "decade-2-our-father",
    "decade-3-our-father",
    "decade-4-our-father",
    "decade-5-our-father",
  ]);
  assert.equal(largeBeads.length, 6);
});

test("large beads dwarf Hail Mary beads and connector beads stay smaller", () => {
  const geometry = createRosaryGeometry();
  const hailBead = geometry.find((point) => point.stepId === "decade-1-hail-1");
  const largeBeads = geometry.filter((point) => point.large && point.visualKind === "bead");
  const connectors = geometry.filter(
    (point) => point.visualKind === "spacer" || point.visualKind === "transition",
  );

  assert.ok(largeBeads.every((point) => point.radius > hailBead.radius));
  assert.ok(connectors.length > 0);
  assert.ok(connectors.every((point) => point.radius < hailBead.radius));
});

test("decade 1's Our Father rides the large bead between the medallion and the opening Hail Marys", () => {
  const geometry = createRosaryGeometry();
  const topBead = geometry.find((point) => point.stepId === "opening-glory");
  const hail3 = geometry.find((point) => point.stepId === "opening-hail-3");
  const medallion = geometry.find((point) => point.visualKind === "medallion");

  assert.ok(topBead.large, "the bead above the opening Hail Marys is a large bead");
  assert.ok(
    medallion.y < topBead.y && topBead.y < hail3.y,
    "the double-duty bead sits between the junction medallion and the strand",
  );
  assert.equal(medallion.stepId, "", "the junction medallion carries no prayer step");
});

test("connector beads carry no prayer step of their own", () => {
  const spacerBeads = createRosaryGeometry().filter(
    (point) => point.visualKind === "spacer",
  );

  assert.ok(spacerBeads.length > 0);
  assert.ok(spacerBeads.every((point) => point.stepId === ""));
});

test("each decade-close connector trio behaves as one touch target", () => {
  const geometry = createRosaryGeometry();
  for (let decade = 1; decade <= 5; decade += 1) {
    const close = geometry.find((point) => point.stepId === `decade-${decade}-close`);
    const neighbors = geometry.filter(
      (point) =>
        point.stepId === "" &&
        Math.hypot(point.x - close.x, point.y - close.y) <= 12,
    );
    assert.equal(
      neighbors.length,
      2,
      `decade ${decade} close is flanked by two connector beads`,
    );
    for (const neighbor of neighbors) {
      assert.equal(findNearestRosaryStepId(neighbor.x, neighbor.y), close.stepId);
    }
  }
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
  const loopCenter = { x: 195, y: 218 };
  const loop = createRosaryGeometry().filter(
    (point) => point.visualKind === "bead" && point.stepId.startsWith("decade-"),
  );
  assert.equal(loop.length, 54);

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
  const typical = [...spans].sort((a, b) => a.span - b.span)[26];

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
  const firstHail = geometry.find((point) => point.stepId === "decade-1-hail-1");
  const lastHail = geometry.find((point) => point.stepId === "decade-5-hail-10");

  assert.ok(firstHail.x > 195, "decade 1 begins right of the centerpiece");
  assert.ok(lastHail.x < 195, "decade 5 ends left of the centerpiece");
  assert.ok(
    Math.abs(firstHail.y - lastHail.y) < 1,
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

test("every decade-close connector trio hugs its decade's last Hail Mary bead", () => {
  const geometry = createRosaryGeometry();
  for (let decade = 1; decade <= 5; decade += 1) {
    const close = geometry.find((point) => point.stepId === `decade-${decade}-close`);
    const lastBead = geometry.find(
      (point) => point.stepId === `decade-${decade}-hail-10`,
    );
    // Decades 1–4 continue along the loop to the next Our Father bead; decade 5
    // continues down the cord, which meets the centerpiece at the bail ring
    // above the medal (where the cord path in the markup ends).
    const nextObject =
      decade < 5
        ? geometry.find((point) => point.stepId === `decade-${decade + 1}-our-father`)
        : { x: 195, y: 413 };

    const distance = Math.hypot(close.x - lastBead.x, close.y - lastBead.y);
    assert.ok(
      distance <= 30,
      `decade ${decade} close floats ${distance.toFixed(1)}px from its last bead`,
    );

    // The connector sits on the cord running from the decade's last bead onward.
    const segX = nextObject.x - lastBead.x;
    const segY = nextObject.y - lastBead.y;
    const segLength = Math.hypot(segX, segY);
    const drift =
      Math.abs(segX * (close.y - lastBead.y) - segY * (close.x - lastBead.x)) /
      segLength;
    assert.ok(drift <= 2, `decade ${decade} close drifts ${drift.toFixed(1)}px off the cord`);
  }
});

test("a tiny seed spacer separates every Hail Mary bead from its neighbor", () => {
  const geometry = createRosaryGeometry();
  const spacers = geometry.filter((point) => point.visualKind === "spacer");

  for (let decade = 1; decade <= 5; decade += 1) {
    for (let number = 1; number <= 9; number += 1) {
      const first = geometry.find(
        (point) => point.stepId === `decade-${decade}-hail-${number}`,
      );
      const second = geometry.find(
        (point) => point.stepId === `decade-${decade}-hail-${number + 1}`,
      );
      const midX = (first.x + second.x) / 2;
      const midY = (first.y + second.y) / 2;
      const seed = spacers.find((point) => Math.hypot(point.x - midX, point.y - midY) < 4);

      assert.ok(seed, `decade ${decade} Hail Marys ${number}/${number + 1} lack a seed spacer`);
      assert.ok(seed.radius < 3, "a seed spacer is smaller than the connector trio beads");
    }
  }
});

test("seed spacers also separate the strand beads between centerpiece and crucifix", () => {
  const strandSeeds = createRosaryGeometry().filter(
    (point) =>
      point.visualKind === "spacer" &&
      Math.abs(point.x - 195) < 1 &&
      point.y > 440 &&
      point.y < 640,
  );

  assert.equal(strandSeeds.length, 6);
});

test("the cord joins the loop ends to the centerpiece without closing the ring", () => {
  const markup = renderRosaryMap("crucifix", []);
  const cord = markup.match(/<g class="rosary-cord">([\s\S]*?)<\/g>/)[1];

  assert.equal(
    (cord.match(/<line/g) ?? []).length,
    130,
    "the cord threads all 131 loop objects: 130 segments, no closing ring segment",
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
    if (bead.stepId === "") continue; // connector beads have no step to resolve

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
