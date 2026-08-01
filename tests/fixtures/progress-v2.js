import { ROSARY_SEQUENCE, STEP_BY_ID } from "../data/rosary-sequence.js";
import { getNextStepId, getPreviousStepId } from "./sequence.js";

// Persist a harmless marker so the upgrade journey can prove this pre-fix module was
// actually executed by an active v2-controlled client before v3 took over.
window.localStorage.setItem("rosary:test:loaded-v2-progress", "true");

function validStepId(id) {
  return STEP_BY_ID.has(id);
}

export function normalizeCompletedStepIds(ids) {
  const seen = new Set();
  const valid = ids.filter((id) => validStepId(id) && !seen.has(id) && seen.add(id));
  return valid.sort(
    (left, right) =>
      (STEP_BY_ID.get(left)?.index ?? 0) - (STEP_BY_ID.get(right)?.index ?? 0),
  );
}

export function restartNavigation() {
  return { currentStepId: ROSARY_SEQUENCE[0].id, completedStepIds: [] };
}

export function selectStep(state, stepId) {
  if (!validStepId(stepId)) return state;
  return { ...state, currentStepId: stepId };
}

export function advanceStep(state) {
  const completedStepIds = normalizeCompletedStepIds([
    ...state.completedStepIds,
    state.currentStepId,
  ]);

  return {
    currentStepId: getNextStepId(state.currentStepId),
    completedStepIds,
  };
}

export function retreatStep(state) {
  return {
    ...state,
    currentStepId: getPreviousStepId(state.currentStepId),
  };
}

export function getCompletionProgress(completedStepIds) {
  return normalizeCompletedStepIds(completedStepIds).length / ROSARY_SEQUENCE.length;
}

export function isRosaryComplete(completedStepIds) {
  return normalizeCompletedStepIds(completedStepIds).length === ROSARY_SEQUENCE.length;
}
