import { ROSARY_SEQUENCE, STEP_BY_ID } from "../data/rosary-sequence";
export function getStepIndex(id:string):number { return STEP_BY_ID.get(id)?.index ?? 0; }
export function getStep(id:string){ return STEP_BY_ID.get(id)?.step ?? ROSARY_SEQUENCE[0]!; }
export function getNextStepId(id:string):string { const i=getStepIndex(id); return ROSARY_SEQUENCE[Math.min(i+1,ROSARY_SEQUENCE.length-1)]!.id; }
export function getPreviousStepId(id:string):string { const i=getStepIndex(id); return ROSARY_SEQUENCE[Math.max(i-1,0)]!.id; }
export function getProgress(id:string):number { return (getStepIndex(id)+1)/ROSARY_SEQUENCE.length; }
