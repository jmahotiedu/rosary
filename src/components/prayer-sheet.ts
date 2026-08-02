import type { MysterySetId, PrayerStep } from "../domain/prayer-step";
import { PRAYERS } from "../data/prayers";
import { MYSTERIES } from "../data/mysteries";

interface PrayerSheetNavigation {
  readonly atStart: boolean;
  readonly atEnd: boolean;
  readonly rosaryComplete: boolean;
}

function renderPrayerParagraphs(text: string): string {
  return text
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");
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

  return `<section class="prayer-sheet">
    <div class="step-status" aria-live="polite">
      <p class="step-location">${step.location}</p>
      <h2>${step.label}</h2>
    </div>
    ${
      mystery
        ? `<aside class="mystery-card"><p>${set} mystery ${step.mysteryIndex! + 1}</p><h3>${mystery.name}</h3><span>${mystery.meditation}</span></aside>`
        : ""
    }
    <div class="prayer-list">
      ${step.prayerIds
        .map((id) => {
          const prayer = PRAYERS[id];
          return `<article class="prayer"><div class="prayer-heading"><h3>${prayer.title}</h3><span>Say once</span></div>${renderPrayerParagraphs(prayer.text)}</article>`;
        })
        .join("")}
    </div>
    <div class="sheet-actions">
      <button type="button" data-action="previous" ${navigation.atStart ? "disabled" : ""}>Previous</button>
      <button type="button" class="primary" data-action="next" ${completedAtEnd ? "disabled" : ""}>${nextLabel}</button>
    </div>
  </section>`;
}
