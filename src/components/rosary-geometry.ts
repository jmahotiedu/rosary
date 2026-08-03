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

export type RosaryVisualKind = "bead" | "medallion" | "cross" | "transition";

export interface BeadGeometry extends Point {
  readonly stepId: string;
  readonly radius: number;
  readonly hitRadius: number;
  readonly large: boolean;
  readonly visualKind: RosaryVisualKind;
  readonly decade?: number;
  readonly number?: number;
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

export function createRosaryGeometry(): readonly BeadGeometry[] {
  const beads: BeadGeometry[] = [];
  const loop: BeadGeometry[] = [];
  const centerX = 195;
  const centerY = 215;
  const radiusX = 160;
  const radiusY = 185;

  // The loop is open: its two ends flank the centerpiece below, like a real
  // rosary, instead of closing into a ring. The gap is symmetric about straight
  // down (angle π/2), so decade 1 begins at the right end and decade 5 closes
  // at the left end.
  const gapHalfAngle = (22.5 * Math.PI) / 180;
  const startAngle = Math.PI / 2 - gapHalfAngle;
  const arcSpan = 2 * Math.PI - 2 * gapHalfAngle;

  for (let index = 0; index < 55; index++) {
    const angle = startAngle - (index * arcSpan) / 54;
    const decade = Math.floor(index / 11) + 1;
    const position = index % 11;
    loop.push({
      x: centerX + radiusX * Math.cos(angle),
      y: centerY + radiusY * Math.sin(angle),
      radius: position === 0 ? 11 : 7,
      hitRadius: 22,
      large: position === 0,
      visualKind: "bead",
      stepId:
        position === 0
          ? `decade-${decade}-our-father`
          : `decade-${decade}-hail-${position}`,
      decade,
      number: position || undefined,
    });
  }

  beads.push(...loop);

  // Cord knots between decades mark the Glory Be / Fatima Prayer that closes
  // each decade. Decades one through four close between the last Hail Mary and
  // the next Our Father bead.
  for (let decade = 1; decade <= 4; decade++) {
    const hailTen = loop[decade * 11 - 1]!;
    const nextOurFather = loop[decade * 11]!;
    beads.push({
      x: (hailTen.x + nextOurFather.x) / 2,
      y: (hailTen.y + nextOurFather.y) / 2,
      radius: 3.5,
      hitRadius: 15,
      large: false,
      visualKind: "transition",
      stepId: `decade-${decade}-close`,
      decade,
    });
  }

  const centerpiece = { x: 195, y: 432 };
  beads.push({
    x: centerpiece.x,
    y: centerpiece.y,
    radius: 13,
    hitRadius: 24,
    large: true,
    visualKind: "medallion",
    stepId: "opening-glory",
  });

  // The fifth decade closes on the left cord running from the loop's left end
  // down to the centerpiece.
  const leftLoopEnd = loop[54]!;
  beads.push({
    x: (leftLoopEnd.x + centerpiece.x) / 2,
    y: (leftLoopEnd.y + centerpiece.y) / 2,
    radius: 3.5,
    hitRadius: 15,
    large: false,
    visualKind: "transition",
    stepId: "decade-5-close",
    decade: 5,
  });

  const openingHailMaryPositions = [560, 522, 484];
  openingHailMaryPositions.forEach((y, index) => {
    beads.push({
      x: 195,
      y,
      radius: 7,
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
    radius: 11,
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

  return beads;
}

export function findNearestRosaryStepId(x: number, y: number): string | null {
  let nearest: BeadGeometry | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const bead of createRosaryGeometry()) {
    const distance = Math.hypot(x - bead.x, y - bead.y);
    if (distance <= bead.hitRadius && distance < nearestDistance) {
      nearest = bead;
      nearestDistance = distance;
    }
  }

  return nearest?.stepId ?? null;
}
