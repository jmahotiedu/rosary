import { STEP_BY_ID } from "../data/rosary-sequence";
import { createRosaryGeometry, VIEWBOX, type BeadGeometry } from "./rosary-geometry";

function stateClass(active: boolean, complete: boolean): string {
  return `${active ? " is-active" : ""}${complete ? " is-complete" : ""}`;
}

function targetMarkup(bead: BeadGeometry, active: boolean): string {
  const step = STEP_BY_ID.get(bead.stepId)?.step;
  const label = step ? `${step.location}: ${step.label}` : bead.stepId.replaceAll("-", " ");
  return `<button
    class="bead-target"
    type="button"
    data-step-id="${bead.stepId}"
    aria-label="${label}"
    aria-current="${active ? "step" : "false"}"
    tabindex="${active ? "0" : "-1"}"
    style="--x:${bead.x};--y:${bead.y};--hit:${bead.hitRadius}"
  ><span class="sr-only">${label}</span></button>`;
}

/** Petal grooves carved around the core of an Our Father bead. */
function carvedGrooves(cx: number, cy: number): string {
  return Array.from({ length: 8 }, (_, index) => {
    const angle = ((22.5 + index * 45) * Math.PI) / 180;
    const x1 = cx + 3.2 * Math.cos(angle);
    const y1 = cy + 3.2 * Math.sin(angle);
    const x2 = cx + 6.8 * Math.cos(angle);
    const y2 = cy + 6.8 * Math.sin(angle);
    return `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" />`;
  }).join("");
}

function fatherMarkup(bead: BeadGeometry, classes: string): string {
  return `<circle data-domain-part="bead" class="bead-visual bead-visual--father${classes}" cx="${bead.x}" cy="${bead.y}" r="${bead.radius}" /><g class="bead-ornate" aria-hidden="true">${carvedGrooves(bead.x, bead.y)}<circle class="bead-ornate-ring" cx="${bead.x}" cy="${bead.y}" r="7.6" /><circle class="bead-ornate-core" cx="${bead.x}" cy="${bead.y}" r="2.5" /></g>`;
}

function medallionMarkup(classes: string): string {
  const rays = Array.from({ length: 12 }, (_, index) => {
    const angle = ((index * 30 + 15) * Math.PI) / 180;
    const x1 = 195 + 4.4 * Math.cos(angle);
    const y1 = 432 + 4.4 * Math.sin(angle);
    const x2 = 195 + 8.6 * Math.cos(angle);
    const y2 = 432 + 8.6 * Math.sin(angle);
    return `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" />`;
  }).join("");
  return `<g data-domain-part="centerpiece"><circle class="medallion-bail" cx="195" cy="413" r="4.5" /><circle class="medallion-visual${classes}" cx="195" cy="432" r="13" /><g class="medallion-relief" aria-hidden="true">${rays}<path class="medallion-figure" d="M195 427.5 V436.5 M191.5 430.5 H198.5" /><circle class="medallion-rim" cx="195" cy="432" r="11" /></g></g>`;
}

function visualMarkup(bead: BeadGeometry, active: boolean, complete: boolean): string {
  const classes = stateClass(active, complete);

  if (bead.visualKind === "transition") {
    return `<circle data-domain-part="transition" class="spacer-visual spacer-visual--close${classes}" cx="${bead.x}" cy="${bead.y}" r="${bead.radius}" />`;
  }

  if (bead.visualKind === "spacer") {
    return `<circle data-domain-part="spacer" class="spacer-visual${classes}" cx="${bead.x}" cy="${bead.y}" r="${bead.radius}" />`;
  }

  if (bead.visualKind === "medallion") {
    return medallionMarkup(classes);
  }

  if (bead.visualKind === "cross") {
    return `<path data-domain-part="crucifix" class="cross-visual${classes}" d="M188 636 H202 V651 H222 V664 H202 V710 H188 V664 H168 V651 H188 Z" />`;
  }

  if (bead.large) {
    return fatherMarkup(bead, classes);
  }

  return `<circle data-domain-part="bead" class="bead-visual${classes}" cx="${bead.x}" cy="${bead.y}" r="${bead.radius}" />`;
}

export function renderRosaryMap(currentStepId: string, completed: readonly string[]): string {
  const done = new Set(completed);
  const geometry = createRosaryGeometry();
  const loop = geometry.filter((bead) => bead.onLoop);
  const finalPrayersActive = currentStepId === "final-prayers";
  const firstFatherActive = currentStepId === "decade-1-our-father";

  // Two steps share physical objects: the large bead at the top of the drop
  // carries decade 1's Our Father as well as the opening Glory Be, and the
  // junction medallion carries the final prayers.
  const isActive = (bead: BeadGeometry): boolean =>
    currentStepId === bead.stepId ||
    (bead.stepId === "opening-glory" && firstFatherActive) ||
    (bead.visualKind === "medallion" && finalPrayersActive);
  const isComplete = (bead: BeadGeometry): boolean =>
    done.has(bead.stepId) ||
    (bead.stepId === "opening-glory" && done.has("decade-1-our-father")) ||
    (bead.visualKind === "medallion" && done.has("final-prayers"));

  const loopCord = loop
    .slice(0, -1)
    .map((bead, index) => {
      const next = loop[index + 1]!;
      return `<line x1="${bead.x}" y1="${bead.y}" x2="${next.x}" y2="${next.y}" />`;
    })
    .join("");

  // The loop does not close: both ends run down to the centerpiece bail, and
  // the strand cord runs from the medal to the crucifix.
  const rightLoopEnd = loop[0]!;
  const leftLoopEnd = loop[loop.length - 1]!;
  const cord = `${loopCord}<path d="M${rightLoopEnd.x} ${rightLoopEnd.y} L195 413"/><path d="M${leftLoopEnd.x} ${leftLoopEnd.y} L195 413"/><path d="M195 445 L195 636"/>`;

  const visuals = geometry
    .map((bead) => visualMarkup(bead, isActive(bead), isComplete(bead)))
    .join("");

  const targets = geometry
    .filter((bead) => bead.stepId !== "")
    .map((bead) => targetMarkup(bead, isActive(bead)))
    .join("");

  return `<section class="rosary-stage" data-rosary-stage aria-label="Interactive wooden Rosary">
    <svg class="rosary-visual" viewBox="0 0 ${VIEWBOX.width} ${VIEWBOX.height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <radialGradient id="wood-bead" cx="34%" cy="28%" r="72%">
          <stop offset="0%" stop-color="#d7a575"/>
          <stop offset="32%" stop-color="#b77b49"/>
          <stop offset="70%" stop-color="#8b572f"/>
          <stop offset="100%" stop-color="#5a341f"/>
        </radialGradient>
        <radialGradient id="wood-father" cx="34%" cy="28%" r="72%">
          <stop offset="0%" stop-color="#9c6034"/>
          <stop offset="35%" stop-color="#6b3d21"/>
          <stop offset="75%" stop-color="#452515"/>
          <stop offset="100%" stop-color="#2b190d"/>
        </radialGradient>
        <radialGradient id="gold-spacer" cx="34%" cy="28%" r="72%">
          <stop offset="0%" stop-color="#f6e2a8"/>
          <stop offset="35%" stop-color="#ddb95f"/>
          <stop offset="75%" stop-color="#b3872f"/>
          <stop offset="100%" stop-color="#7d5a1d"/>
        </radialGradient>
        <linearGradient id="wood-dark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#8a5532"/>
          <stop offset="55%" stop-color="#5d3622"/>
          <stop offset="100%" stop-color="#3d2418"/>
        </linearGradient>
      </defs>
      <g class="rosary-cord">${cord}</g>
      ${visuals}
    </svg>
    ${targets}
  </section>`;
}
