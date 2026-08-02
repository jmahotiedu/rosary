import { ROSARY_SEQUENCE } from "../data/rosary-sequence";
import { getStep, getStepIndex } from "../domain/sequence";
import {
  advanceStep,
  isRosaryComplete,
  normalizeCompletedStepIds,
  restartNavigation,
  retreatStep,
  selectStep,
  type NavigationState,
} from "../domain/progress";
import type { MysterySetId } from "../domain/prayer-step";
import { createInitialState } from "./state";
import { renderRosaryMap } from "../components/rosary-map";
import {
  clientPointToViewBox,
  findNearestRosaryStepId,
} from "../components/rosary-geometry";
import { renderPrayerSheet } from "../components/prayer-sheet";
import { renderMysterySelector } from "../components/mystery-selector";
import { renderProgressHeader } from "../components/progress-header";
import { renderInstallPrompt } from "../components/install-prompt";

export function mountApp(root: HTMLElement): void {
  let state = createInitialState();
  let deferredPrompt: Event | null = null;
  let restartPending = false;
  let restoreFocusAction: string | null = null;

  const navigationState = (): NavigationState => ({
    currentStepId: state.currentStepId,
    completedStepIds: state.completedStepIds,
    inspectionReturnStepId: state.inspectionReturnStepId,
  });

  const applyNavigation = (navigation: NavigationState): void => {
    restartPending = false;
    state = { ...state, ...navigation };
    render();
  };

  const rememberFocus = (): void => {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || !root.contains(active)) {
      restoreFocusAction = null;
      return;
    }
    restoreFocusAction = active.dataset.action ?? null;
  };

  const restoreFocus = (): void => {
    if (!restoreFocusAction) return;
    const target = root.querySelector<HTMLElement>(
      `[data-action="${restoreFocusAction}"]`,
    );
    target?.focus();
    restoreFocusAction = null;
  };

  const render = (): void => {
    rememberFocus();
    const step = getStep(state.currentStepId);
    const currentIndex = getStepIndex(state.currentStepId);
    const completedCount = normalizeCompletedStepIds(state.completedStepIds).length;
    const complete = isRosaryComplete(state.completedStepIds);

    root.innerHTML = `<div class="app-shell">
      ${renderProgressHeader(
        completedCount,
        ROSARY_SEQUENCE.length,
        restartPending,
        renderMysterySelector(state.mysterySet),
      )}
      <div class="top-panel">
        ${renderInstallPrompt(Boolean(deferredPrompt))}
        ${renderRosaryMap(state.currentStepId, state.completedStepIds)}
        <p class="instruction">Tap a bead to inspect. Previous recovers; Next marks the prayer complete.</p>
      </div>
      ${renderPrayerSheet(step, state.mysterySet, {
        atStart: currentIndex === 0 && state.inspectionReturnStepId === null,
        atEnd: currentIndex === ROSARY_SEQUENCE.length - 1,
        rosaryComplete: complete,
      })}
    </div>`;

    wire();
    restoreFocus();
  };

  const wire = (): void => {
    root.querySelectorAll<HTMLElement>("[data-step-id]").forEach((element) => {
      element.addEventListener("click", () => {
        applyNavigation(selectStep(navigationState(), element.dataset.stepId!));
      });
    });

    const stage = root.querySelector<HTMLElement>("[data-rosary-stage]");
    stage?.addEventListener("click", (event) => {
      if (event.target instanceof HTMLButtonElement) return;

      const visual = stage.querySelector<SVGSVGElement>(".rosary-visual");
      const bounds = (visual ?? stage).getBoundingClientRect();
      const point = clientPointToViewBox(event.clientX, event.clientY, bounds);
      if (!point) return;

      const stepId = findNearestRosaryStepId(point.x, point.y);
      if (stepId) applyNavigation(selectStep(navigationState(), stepId));
    });

    root.querySelector('[data-action="previous"]')?.addEventListener("click", () => {
      applyNavigation(retreatStep(navigationState()));
    });

    root.querySelector('[data-action="next"]')?.addEventListener("click", () => {
      applyNavigation(advanceStep(navigationState()));
    });

    root.querySelector('[data-action="restart"]')?.addEventListener("click", () => {
      restartPending = true;
      render();
      root.querySelector<HTMLElement>('[data-action="restart-confirm"]')?.focus();
    });

    root.querySelector('[data-action="restart-cancel"]')?.addEventListener("click", () => {
      restartPending = false;
      render();
      root.querySelector<HTMLElement>('[data-action="restart"]')?.focus();
    });

    root.querySelector('[data-action="restart-confirm"]')?.addEventListener("click", () => {
      applyNavigation(restartNavigation());
    });

    root
      .querySelector<HTMLSelectElement>('[data-action="mystery"]')
      ?.addEventListener("change", (event) => {
        state = {
          ...state,
          mysterySet: (event.currentTarget as HTMLSelectElement)
            .value as MysterySetId,
          mysterySelectionMode: "manual",
        };
        render();
      });

    const install = root.querySelector<HTMLButtonElement>(
      '[data-action="install"]',
    );
    if (deferredPrompt && install) {
      install.addEventListener("click", async () => {
        const promptEvent = deferredPrompt as Event & {
          prompt: () => Promise<void>;
        };
        await promptEvent.prompt();
        deferredPrompt = null;
        render();
      });
    }
  };

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    render();
  });

  render();
}
