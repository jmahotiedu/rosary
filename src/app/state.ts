import type { MysterySelectionMode, MysterySetId } from "../domain/prayer-step";
import { getMysterySetForDate } from "../domain/weekday-mysteries";
export interface AppState { currentStepId:string; mysterySet:MysterySetId; mysterySelectionMode:MysterySelectionMode; completedStepIds:readonly string[]; }
export function createInitialState(date=new Date()):AppState { return {currentStepId:"crucifix",mysterySet:getMysterySetForDate(date),mysterySelectionMode:"automatic",completedStepIds:[]}; }
