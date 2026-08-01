import { APP_STORAGE_KEY } from "./config";
import type { AppState } from "./state";
import { createInitialState } from "./state";
import { STEP_BY_ID } from "../data/rosary-sequence";
import { normalizeCompletedStepIds } from "../domain/progress";

const SETS = new Set(["joyful", "sorrowful", "glorious", "luminous"]);

export function loadState(storage: Storage = localStorage): AppState {
  try {
    const raw = storage.getItem(APP_STORAGE_KEY);
    if (!raw) return createInitialState();

    const saved = JSON.parse(raw) as Partial<AppState>;
    if (
      typeof saved.currentStepId !== "string" ||
      !STEP_BY_ID.has(saved.currentStepId) ||
      !SETS.has(String(saved.mysterySet)) ||
      (saved.mysterySelectionMode !== "automatic" &&
        saved.mysterySelectionMode !== "manual")
    ) {
      return createInitialState();
    }

    const inspectionReturnStepId =
      typeof saved.inspectionReturnStepId === "string" &&
      STEP_BY_ID.has(saved.inspectionReturnStepId) &&
      saved.inspectionReturnStepId !== saved.currentStepId
        ? saved.inspectionReturnStepId
        : null;

    return {
      ...createInitialState(),
      currentStepId: saved.currentStepId,
      mysterySet: saved.mysterySet as AppState["mysterySet"],
      mysterySelectionMode: saved.mysterySelectionMode,
      completedStepIds: normalizeCompletedStepIds(
        Array.isArray(saved.completedStepIds)
          ? saved.completedStepIds.filter(
              (id): id is string => typeof id === "string",
            )
          : [],
      ),
      inspectionReturnStepId,
    };
  } catch {
    return createInitialState();
  }
}

export function saveState(
  state: AppState,
  storage: Storage = localStorage,
): void {
  storage.setItem(
    APP_STORAGE_KEY,
    JSON.stringify({
      currentStepId: state.currentStepId,
      mysterySet: state.mysterySet,
      mysterySelectionMode: state.mysterySelectionMode,
      completedStepIds: normalizeCompletedStepIds(state.completedStepIds),
      inspectionReturnStepId: state.inspectionReturnStepId,
    }),
  );
}
