export interface Point {
  readonly x: number;
  readonly y: number;
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

export function createRosaryGeometry(): readonly BeadGeometry[] {
  const beads: BeadGeometry[] = [];
  const loop: BeadGeometry[] = [];
  const centerX = 195;
  const centerY = 220;
  const radiusX = 142;
  const radiusY = 170;

  for (let index = 0; index < 55; index++) {
    const angle = Math.PI / 2 - (index * 2 * Math.PI) / 55;
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

  for (let decade = 1; decade <= 5; decade++) {
    const hailTen = loop[(decade - 1) * 11 + 10]!;
    const nextOurFather = loop[(decade * 11) % loop.length]!;
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

  beads.push({
    x: 195,
    y: 430,
    radius: 14,
    hitRadius: 24,
    large: true,
    visualKind: "medallion",
    stepId: "opening-glory",
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
