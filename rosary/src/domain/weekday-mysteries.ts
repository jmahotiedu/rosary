import type { MysterySetId } from "./prayer-step";
const BY_DAY: readonly MysterySetId[] = ["glorious","joyful","sorrowful","glorious","luminous","sorrowful","joyful"];
export function getMysterySetForDate(date: Date): MysterySetId { return BY_DAY[date.getDay()] ?? "joyful"; }
