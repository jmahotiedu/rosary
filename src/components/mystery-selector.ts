import type { MysterySetId } from "../domain/prayer-step";

export function renderMysterySelector(value: MysterySetId): string {
  return `<label class="mystery-select"><span>Mysteries</span><select data-action="mystery"><option value="joyful"${value === "joyful" ? " selected" : ""}>Joyful</option><option value="sorrowful"${value === "sorrowful" ? " selected" : ""}>Sorrowful</option><option value="glorious"${value === "glorious" ? " selected" : ""}>Glorious</option><option value="luminous"${value === "luminous" ? " selected" : ""}>Luminous</option></select></label>`;
}
