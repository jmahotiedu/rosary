import type { MysterySetId, PrayerStep } from "../domain/prayer-step";
import { PRAYERS } from "../data/prayers";
import { MYSTERIES } from "../data/mysteries";

interface PrayerSheetNavigation {
  readonly atStart: boolean;
  readonly atEnd: boolean;
  readonly rosaryComplete: boolean;
}

export function renderPrayerSheet(
  step: PrayerStep,
  set: MysterySetId,
  navigation: PrayerSheetNavigation,
): string {
  const mystery = step.mysteryIndex === undefined ? null : MYSTERIES[set][step.mysteryIndex];
  const completedAtEnd = navigation.atEnd && navigation.rosaryComplete;
  const nextLabel = navigation.atEnd
    ? completedAtEnd
      ? "Rosary complete"
      : "Finish Rosary"
    : "Next prayer";

  return `<section class="prayer-sheet" aria-live="polite">
    <div class="sheet-handle" aria-hidden="true"></div>
    <p class="step-location">${step.location}</p>
    <h2>${step.label}</h2>
    ${
      mystery
        ? `<aside class="mystery-card"><p>${set} mystery ${step.mysteryIndex! + 1}</p><h3>${mystery.name}</h3><span>${mystery.meditation}</span></aside>`
        : ""
    }
    <div class="prayer-list">
      ${step.prayerIds
        .map((id) => {
          const prayer = PRAYERS[id];
          return `<article class="prayer"><div class="prayer-heading"><h3>${prayer.title}</h3><span>Say once</span></div><p>${prayer.text.replaceAll("\n\n", "</p><p>")}</p></article>`;
        })
        .join("")}
    </div>
    <div class="sheet-actions">
      <button type="button" data-action="previous" ${navigation.atStart ? "disabled" : ""}>Previous</button>
      <button type="button" class="primary" data-action="next" ${completedAtEnd ? "disabled" : ""}>${nextLabel}</button>
    </div>
  </section>`;
}
