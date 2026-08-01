import { ROSARY_SEQUENCE } from "../data/rosary-sequence";
import { getStep, getStepIndex } from "../domain/sequence";
import {
  advanceStep,
  getCompletionProgress,
  isRosaryComplete,
  restartNavigation,
  retreatStep,
  selectStep,
  type NavigationState,
} from "../domain/progress";
import type { MysterySetId } from "../domain/prayer-step";
import { loadState, saveState } from "./persistence";
import { renderRosaryMap } from "../components/rosary-map";
import {
  findNearestRosaryStepId,
  VIEWBOX,
} from "../components/rosary-geometry";
import { renderPrayerSheet } from "../components/prayer-sheet";
import { renderMysterySelector } from "../components/mystery-selector";
import { renderProgressHeader } from "../components/progress-header";
import { renderInstallPrompt } from "../components/install-prompt";

export function mountApp(root: HTMLElement): void {
  let state = loadState();
  let deferredPrompt: Event | null = null;

  const navigationState = (): NavigationState => ({
    currentStepId: state.currentStepId,
    completedStepIds: state.completedStepIds,
  });

  const applyNavigation = (navigation: NavigationState): void => {
    state = { ...state, ...navigation };
    saveState(state);
    render();
  };

  const render = (): void => {
    const step = getStep(state.currentStepId);
    const currentIndex = getStepIndex(state.currentStepId);
    const completion = getCompletionProgress(state.completedStepIds);
    const complete = isRosaryComplete(state.completedStepIds);

    root.innerHTML = `<div class="app-shell">
      <div class="top-panel">
        ${renderProgressHeader(completion, currentIndex + 1, ROSARY_SEQUENCE.length)}
        ${renderMysterySelector(state.mysterySet)}
        ${renderInstallPrompt()}
        <p class="instruction">Tap a bead to inspect it. Only the Next prayer button marks a prayer complete.</p>
        ${renderRosaryMap(state.currentStepId, state.completedStepIds)}
      </div>
      ${renderPrayerSheet(step, state.mysterySet, {
        atStart: currentIndex === 0,
        atEnd: currentIndex === ROSARY_SEQUENCE.length - 1,
        rosaryComplete: complete,
      })}
    </div>`;

    wire();
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

      const bounds = stage.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;

      const x = ((event.clientX - bounds.left) / bounds.width) * VIEWBOX.width;
      const y = ((event.clientY - bounds.top) / bounds.height) * VIEWBOX.height;
      const stepId = findNearestRosaryStepId(x, y);
      if (stepId) applyNavigation(selectStep(navigationState(), stepId));
    });

    root.querySelector('[data-action="previous"]')?.addEventListener("click", () => {
      applyNavigation(retreatStep(navigationState()));
    });

    root.querySelector('[data-action="next"]')?.addEventListener("click", () => {
      applyNavigation(advanceStep(navigationState()));
    });

    root.querySelector('[data-action="restart"]')?.addEventListener("click", () => {
      const confirmed = window.confirm("Start the Rosary over and clear completed prayers?");
      if (confirmed) applyNavigation(restartNavigation());
    });

    root
      .querySelector<HTMLSelectElement>('[data-action="mystery"]')
      ?.addEventListener("change", (event) => {
        state = {
          ...state,
          mysterySet: (event.currentTarget as HTMLSelectElement).value as MysterySetId,
          mysterySelectionMode: "manual",
        };
        saveState(state);
        render();
      });

    const install = root.querySelector<HTMLButtonElement>('[data-action="install"]');
    if (deferredPrompt && install) {
      install.hidden = false;
      install.addEventListener("click", async () => {
        const promptEvent = deferredPrompt as Event & { prompt: () => Promise<void> };
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
