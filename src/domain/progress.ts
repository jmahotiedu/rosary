import { ROSARY_SEQUENCE, STEP_BY_ID } from "../data/rosary-sequence";
import { getNextStepId, getPreviousStepId } from "./sequence";

export interface NavigationState {
  readonly currentStepId: string;
  readonly completedStepIds: readonly string[];
  readonly returnStepId: string | null;
}

function validStepId(id: string): boolean {
  return STEP_BY_ID.has(id);
}

export function normalizeCompletedStepIds(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  const valid = ids.filter((id) => validStepId(id) && !seen.has(id) && seen.add(id));
  return valid.sort(
    (left, right) =>
      (STEP_BY_ID.get(left)?.index ?? 0) - (STEP_BY_ID.get(right)?.index ?? 0),
  );
}

export function restartNavigation(): NavigationState {
  return {
    currentStepId: ROSARY_SEQUENCE[0]!.id,
    completedStepIds: [],
    returnStepId: null,
  };
}

export function selectStep(state: NavigationState, stepId: string): NavigationState {
  if (!validStepId(stepId) || stepId === state.currentStepId) return state;
  return {
    ...state,
    currentStepId: stepId,
    returnStepId: state.currentStepId,
  };
}

export function advanceStep(state: NavigationState): NavigationState {
  const completedStepIds = normalizeCompletedStepIds([
    ...state.completedStepIds,
    state.currentStepId,
  ]);

  return {
    currentStepId: getNextStepId(state.currentStepId),
    completedStepIds,
    returnStepId: null,
  };
}

export function retreatStep(state: NavigationState): NavigationState {
  if (state.returnStepId && validStepId(state.returnStepId)) {
    return {
      ...state,
      currentStepId: state.returnStepId,
      returnStepId: null,
    };
  }

  return {
    ...state,
    currentStepId: getPreviousStepId(state.currentStepId),
    returnStepId: null,
  };
}

export function getCompletionProgress(completedStepIds: readonly string[]): number {
  return normalizeCompletedStepIds(completedStepIds).length / ROSARY_SEQUENCE.length;
}

export function isRosaryComplete(completedStepIds: readonly string[]): boolean {
  return normalizeCompletedStepIds(completedStepIds).length === ROSARY_SEQUENCE.length;
}
