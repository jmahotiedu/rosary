import type { Mystery, MysterySetId, PrayerStep } from "../domain/prayer-step";
import { PRAYERS } from "../data/prayers";
import { MYSTERIES } from "../data/mysteries";
import { SCRIPTURE_PASSAGES } from "../data/scripture-passages";

const MYSTERY_ORDINALS = ["First", "Second", "Third", "Fourth", "Fifth"] as const;

const MYSTERY_SET_NAMES: Readonly<Record<MysterySetId, string>> = {
  joyful: "Joyful",
  sorrowful: "Sorrowful",
  glorious: "Glorious",
  luminous: "Luminous",
};

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

function renderScripturePassage(mystery: Mystery): string {
  const passage = SCRIPTURE_PASSAGES[mystery.scripture];
  if (!passage) return "";
  return `<details class="scripture-passage"><summary>Read the passage — ${mystery.scripture}</summary>${renderPrayerParagraphs(passage)}</details>`;
}

export function renderPrayerSheet(
  step: PrayerStep,
  set: MysterySetId,
  navigation: PrayerSheetNavigation,
): string {
  const cardMystery = step.mysteryIndex === undefined ? null : MYSTERIES[set][step.mysteryIndex];
  // Every decade step keeps its mystery's passage one tap away while meditating.
  const passageMystery =
    cardMystery ?? (step.decade === undefined ? null : MYSTERIES[set][step.decade - 1]);
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
      cardMystery
        ? `<aside class="mystery-card"><p>${MYSTERY_ORDINALS[step.mysteryIndex!]} ${MYSTERY_SET_NAMES[set]} Mystery</p><h3>${cardMystery.name}</h3><p class="mystery-scripture">${cardMystery.scripture}</p><span>${cardMystery.meditation}</span></aside>`
        : ""
    }
    ${passageMystery ? renderScripturePassage(passageMystery) : ""}
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
