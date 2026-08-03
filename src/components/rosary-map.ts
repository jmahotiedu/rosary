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

function visualMarkup(bead: BeadGeometry, active: boolean, complete: boolean): string {
  const classes = stateClass(active, complete);

  if (bead.visualKind === "transition") {
    return `<circle data-domain-part="transition" class="knot-visual${classes}" cx="${bead.x}" cy="${bead.y}" r="${bead.radius}" />`;
  }

  if (bead.visualKind === "medallion") {
    return `<g data-domain-part="centerpiece"><circle class="medallion-bail" cx="195" cy="413" r="4.5" /><circle class="medallion-visual${classes}" cx="195" cy="432" r="13" /><circle class="medallion-inner" cx="195" cy="432" r="7.5" /></g>`;
  }

  if (bead.visualKind === "cross") {
    return `<path data-domain-part="crucifix" class="cross-visual${classes}" d="M188 636 H202 V651 H222 V664 H202 V710 H188 V664 H168 V651 H188 Z" />`;
  }

  return `<circle data-domain-part="bead" class="bead-visual${bead.large ? " bead-visual--large" : ""}${classes}" cx="${bead.x}" cy="${bead.y}" r="${bead.radius}" />`;
}

export function renderRosaryMap(currentStepId: string, completed: readonly string[]): string {
  const done = new Set(completed);
  const geometry = createRosaryGeometry();
  const loop = geometry.slice(0, 55);
  const finalPrayersActive = currentStepId === "final-prayers";

  const loopCord = loop
    .slice(0, 54)
    .map((bead, index) => {
      const next = loop[index + 1]!;
      return `<line x1="${bead.x}" y1="${bead.y}" x2="${next.x}" y2="${next.y}" />`;
    })
    .join("");

  // The loop does not close: both ends run down to the centerpiece bail, and
  // the strand cord runs from the medal to the crucifix.
  const rightLoopEnd = loop[0]!;
  const leftLoopEnd = loop[54]!;
  const cord = `${loopCord}<path d="M${rightLoopEnd.x} ${rightLoopEnd.y} L195 413"/><path d="M${leftLoopEnd.x} ${leftLoopEnd.y} L195 413"/><path d="M195 445 L195 636"/>`;

  const visuals = geometry
    .map((bead) => {
      const active =
        currentStepId === bead.stepId || (bead.stepId === "opening-glory" && finalPrayersActive);
      const complete =
        done.has(bead.stepId) || (bead.stepId === "opening-glory" && done.has("final-prayers"));
      return visualMarkup(bead, active, complete);
    })
    .join("");

  const targets = geometry
    .map((bead) => {
      const active =
        currentStepId === bead.stepId || (bead.stepId === "opening-glory" && finalPrayersActive);
      return targetMarkup(bead, active);
    })
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
