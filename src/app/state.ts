import type { MysterySelectionMode, MysterySetId } from "../domain/prayer-step";
import { restartNavigation } from "../domain/progress";
import { getMysterySetForDate } from "../domain/weekday-mysteries";

export interface AppState {
  readonly currentStepId: string;
  readonly mysterySet: MysterySetId;
  readonly mysterySelectionMode: MysterySelectionMode;
  readonly completedStepIds: readonly string[];
  readonly returnStepId: string | null;
}

export function createInitialState(date = new Date()): AppState {
  const navigation = restartNavigation();
  return {
    ...navigation,
    mysterySet: getMysterySetForDate(date),
    mysterySelectionMode: "automatic",
  };
}
