export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface RectLike {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface ClientPoint {
  readonly clientX: number;
  readonly clientY: number;
}

export type RosaryVisualKind = "bead" | "medallion" | "cross" | "transition" | "spacer";

export interface BeadGeometry extends Point {
  readonly stepId: string;
  readonly radius: number;
  readonly hitRadius: number;
  readonly large: boolean;
  readonly visualKind: RosaryVisualKind;
  readonly decade?: number;
  readonly number?: number;
  /** True for the objects threaded on the loop cord (the open ellipse). */
  readonly onLoop?: boolean;
}

export const VIEWBOX = { width: 390, height: 720 } as const;

interface ViewBoxTransform {
  readonly scale: number;
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Reproduce SVG's preserveAspectRatio="xMidYMid meet" transform.
 * The Rosary must use this transform for hit testing because the SVG can be
 * letterboxed when its rendered box is not exactly the viewBox aspect ratio.
 */
function getViewBoxTransform(bounds: RectLike): ViewBoxTransform | null {
  if (bounds.width <= 0 || bounds.height <= 0) return null;

  const scale = Math.min(
    bounds.width / VIEWBOX.width,
    bounds.height / VIEWBOX.height,
  );
  const width = VIEWBOX.width * scale;
  const height = VIEWBOX.height * scale;

  return {
    scale,
    width,
    height,
    left: bounds.left + (bounds.width - width) / 2,
    top: bounds.top + (bounds.height - height) / 2,
  };
}

/** Convert a browser pointer location into Rosary viewBox coordinates. */
export function clientPointToViewBox(
  clientX: number,
  clientY: number,
  bounds: RectLike,
): Point | null {
  const transform = getViewBoxTransform(bounds);
  if (!transform) return null;

  const x = (clientX - transform.left) / transform.scale;
  const y = (clientY - transform.top) / transform.scale;

  if (x < 0 || y < 0 || x > VIEWBOX.width || y > VIEWBOX.height) return null;
  return { x, y };
}

/** Convert a Rosary viewBox location into the browser coordinate used by a real tap. */
export function viewBoxPointToClient(
  x: number,
  y: number,
  bounds: RectLike,
): ClientPoint | null {
  if (x < 0 || y < 0 || x > VIEWBOX.width || y > VIEWBOX.height) return null;

  const transform = getViewBoxTransform(bounds);
  if (!transform) return null;

  return {
    clientX: transform.left + x * transform.scale,
    clientY: transform.top + y * transform.scale,
  };
}

interface LoopSlot {
  readonly stepId: string;
  readonly radius: number;
  readonly hitRadius: number;
  readonly large: boolean;
  readonly visualKind: RosaryVisualKind;
  readonly decade?: number;
  readonly number?: number;
  /** Cord weight of the gap from the previous loop object to this one. */
  readonly gapBefore: number;
}

export function createRosaryGeometry(): readonly BeadGeometry[] {
  const centerX = 195;
  const centerY = 218;
  const radiusX = 172;
  const radiusY = 194;

  // The loop is open: its two ends flank the centerpiece below, like a real
  // rosary, instead of closing into a ring. The gap is symmetric about straight
  // down (angle π/2), so decade 1 begins at the right end and decade 5 closes
  // at the left end.
  const gapHalfAngle = (22.5 * Math.PI) / 180;
  const startAngle = Math.PI / 2 - gapHalfAngle;
  const arcSpan = 2 * Math.PI - 2 * gapHalfAngle;

  const fatherRadius = 11;
  const hailRadius = 7;
  const connectorRadius = 3;
  const seedRadius = 2;

  const plainSpacer = (gapBefore: number): LoopSlot => ({
    stepId: "",
    radius: connectorRadius,
    hitRadius: 8,
    large: false,
    visualKind: "spacer",
    gapBefore,
  });

  const seed = (gapBefore: number): LoopSlot => ({
    stepId: "",
    radius: seedRadius,
    hitRadius: 6,
    large: false,
    visualKind: "spacer",
    gapBefore,
  });

  const slots: LoopSlot[] = [];
  const pushDecade = (decade: number, firstGap: number): void => {
    for (let number = 1; number <= 10; number += 1) {
      slots.push({
        stepId: `decade-${decade}-hail-${number}`,
        radius: hailRadius,
        hitRadius: 22,
        large: false,
        visualKind: "bead",
        decade,
        number,
        gapBefore: number === 1 ? firstGap : 0.6,
      });
      if (number < 10) slots.push(seed(0.6));
    }
  };

  // Decade 1 has no Our Father bead on the loop: the loop carries 4 large
  // Our Father beads (decades 2–5), and decade 1's Our Father rides the
  // large bead at the top of the drop — 6 large beads on the whole rosary.
  pushDecade(1, 0);

  for (let decade = 2; decade <= 5; decade += 1) {
    // A seed and a connector trio link the previous decade's last Hail Mary
    // to this Our Father; the middle connector carries the Glory Be /
    // Fatima Prayer that closes the previous decade. The trio after the Our
    // Father links it to the decade's first Hail Mary.
    slots.push(seed(0.6));
    slots.push(plainSpacer(0.5));
    slots.push({
      stepId: `decade-${decade - 1}-close`,
      radius: connectorRadius,
      hitRadius: 16,
      large: false,
      visualKind: "transition",
      decade: decade - 1,
      gapBefore: 0.55,
    });
    slots.push(plainSpacer(0.55));
    slots.push({
      stepId: `decade-${decade}-our-father`,
      radius: fatherRadius,
      hitRadius: 22,
      large: true,
      visualKind: "bead",
      decade,
      gapBefore: 1,
    });
    slots.push(plainSpacer(1), plainSpacer(0.55), plainSpacer(0.55));
    slots.push(seed(0.5));
    pushDecade(decade, 0.6);
  }

  // Gaps are weighted rather than uniform: connector and seed beads sit
  // closer to each other than to the beads they link, so each group reads
  // as one small cluster.
  const totalWeight = slots.reduce((sum, slot) => sum + slot.gapBefore, 0);
  const loop: BeadGeometry[] = [];
  let travelled = 0;
  for (const slot of slots) {
    travelled += slot.gapBefore;
    const angle = startAngle - (travelled / totalWeight) * arcSpan;
    loop.push({
      x: centerX + radiusX * Math.cos(angle),
      y: centerY + radiusY * Math.sin(angle),
      stepId: slot.stepId,
      radius: slot.radius,
      hitRadius: slot.hitRadius,
      large: slot.large,
      visualKind: slot.visualKind,
      decade: slot.decade,
      number: slot.number,
      onLoop: true,
    });
  }

  const beads: BeadGeometry[] = [...loop];
  const bail = { x: 195, y: 413 };

  // The cords from the loop ends down to the centerpiece carry connector
  // trios of their own. On the left the middle connector closes decade 5; on
  // the right the trio is decorative, leading in to decade 1.
  const placeOnCord = (from: Point, offset: number): Point => {
    const dx = bail.x - from.x;
    const dy = bail.y - from.y;
    const length = Math.hypot(dx, dy);
    return { x: from.x + (dx * offset) / length, y: from.y + (dy * offset) / length };
  };

  const cordSpacer = (from: Point, offset: number): BeadGeometry => ({
    ...placeOnCord(from, offset),
    stepId: "",
    radius: connectorRadius,
    hitRadius: 8,
    large: false,
    visualKind: "spacer",
  });

  const rightLoopEnd = loop[0]!;
  const leftLoopEnd = loop[loop.length - 1]!;

  beads.push(
    cordSpacer(rightLoopEnd, 13),
    cordSpacer(rightLoopEnd, 20),
    cordSpacer(rightLoopEnd, 27),
  );
  beads.push(cordSpacer(leftLoopEnd, 14));
  beads.push({
    ...placeOnCord(leftLoopEnd, 21),
    stepId: "decade-5-close",
    radius: connectorRadius,
    hitRadius: 16,
    large: false,
    visualKind: "transition",
    decade: 5,
  });
  beads.push(cordSpacer(leftLoopEnd, 28));

  // The junction medallion is not a prayer bead; the final prayers are
  // offered at it after the fifth decade.
  beads.push({
    x: 195,
    y: 432,
    radius: 13,
    hitRadius: 24,
    large: true,
    visualKind: "medallion",
    stepId: "",
  });

  // The large bead at the top of the drop carries the opening Glory Be and
  // decade 1's Our Father (announced before the decade begins).
  beads.push({
    x: 195,
    y: 466,
    radius: fatherRadius,
    hitRadius: 22,
    large: true,
    visualKind: "bead",
    stepId: "opening-glory",
  });

  const openingHailMaryPositions = [568, 530, 492];
  openingHailMaryPositions.forEach((y, index) => {
    beads.push({
      x: 195,
      y,
      radius: hailRadius,
      hitRadius: 22,
      large: false,
      visualKind: "bead",
      stepId: `opening-hail-${index + 1}`,
      number: index + 1,
    });
  });

  beads.push({
    x: 195,
    y: 606,
    radius: fatherRadius,
    hitRadius: 22,
    large: true,
    visualKind: "bead",
    stepId: "opening-our-father",
  });

  beads.push({
    x: 195,
    y: 675,
    radius: 0,
    hitRadius: 34,
    large: true,
    visualKind: "cross",
    stepId: "crucifix",
  });

  // Seed spacers separate the strand beads just like the loop beads.
  for (const y of [450, 481, 511, 549, 587, 621]) {
    beads.push({
      x: 195,
      y,
      radius: seedRadius,
      hitRadius: 6,
      large: false,
      visualKind: "spacer",
      stepId: "",
    });
  }

  return beads;
}

export function findNearestRosaryStepId(x: number, y: number): string | null {
  let nearest: BeadGeometry | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const bead of createRosaryGeometry()) {
    if (bead.stepId === "") continue; // connector beads carry no prayer step
    const distance = Math.hypot(x - bead.x, y - bead.y);
    if (distance <= bead.hitRadius && distance < nearestDistance) {
      nearest = bead;
      nearestDistance = distance;
    }
  }

  return nearest?.stepId ?? null;
}
