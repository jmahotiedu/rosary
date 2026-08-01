import { APP_STORAGE_KEY } from "./config";
import type { AppState } from "./state";
import { createInitialState } from "./state";
import { STEP_BY_ID } from "../data/rosary-sequence";
const SETS=new Set(["joyful","sorrowful","glorious","luminous"]);
export function loadState(storage:Storage=localStorage):AppState { try { const raw=storage.getItem(APP_STORAGE_KEY); if(!raw)return createInitialState(); const x=JSON.parse(raw) as Partial<AppState>; if(typeof x.currentStepId!=="string"||!STEP_BY_ID.has(x.currentStepId)||!SETS.has(String(x.mysterySet))||(x.mysterySelectionMode!=="automatic"&&x.mysterySelectionMode!=="manual")) return createInitialState(); return {...createInitialState(),currentStepId:x.currentStepId,mysterySet:x.mysterySet as AppState["mysterySet"],mysterySelectionMode:x.mysterySelectionMode}; } catch { return createInitialState(); } }
export function saveState(state:AppState,storage:Storage=localStorage):void { storage.setItem(APP_STORAGE_KEY,JSON.stringify({currentStepId:state.currentStepId,mysterySet:state.mysterySet,mysterySelectionMode:state.mysterySelectionMode})); }
