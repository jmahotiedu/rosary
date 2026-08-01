# Rosary PWA Design

Date: 2026-07-31  
Status: Approved design, pending implementation plan  
Repository: `jmahotiedu/rosary`

## 1. Purpose

Build a polished, installable Rosary progressive web app that guides a user through the complete Rosary bead by bead. The first release is mobile-first, with iPhone as the primary layout target, while remaining usable on desktop.

The page's single job is to help a person pray the Rosary correctly without losing their place. The interface must show the physical Rosary, the exact prayer for the selected bead, the repetition count, the active mystery, and progress through the full sequence.

## 2. Product direction

### Chosen interaction model

Use a Rosary-first layout:

- The complete Rosary remains visible as the main object.
- The Rosary is rendered as a connected wooden Rosary.
- Tapping a bead opens or updates a bottom prayer sheet.
- The prayer sheet shows the full prayer, bead position, count, mystery context, and previous/next controls.
- A user can jump directly to any bead or move sequentially.

### Chosen visual direction

Use warm wooden beads and a carved wooden crucifix. The object must look physically coherent rather than decorative or schematic.

The visible cord must run continuously through:

1. the five-decade loop,
2. the centerpiece,
3. the three opening Hail Mary beads,
4. the opening large bead,
5. the attached crucifix.

The crucifix must never appear detached at any viewport width.

### Quality bar

The interface must not look unfinished, generic, or assembled from unrelated design defaults. Every visual choice should support the devotional subject and the prayer flow. The final result requires rendered-screen inspection and iteration, not code-only verification.

## 3. Initial release scope

### Included

- Complete Rosary sequence
- Exact prayer text for every step
- Five decades with ten Hail Marys each
- Opening prayers
- Glory Be and Fatima Prayer after each decade
- Final prayers after the fifth decade
- Automatic mystery selection by weekday
- Manual mystery override
- Direct bead selection
- Previous and next navigation
- Progress indication
- Installable PWA behavior
- Offline use after the first successful load
- Local persistence of the current bead and selected mystery mode
- Keyboard accessibility
- Reduced-motion support
- iPhone safe-area handling

### Excluded from version 1

- Accounts or login
- Cloud synchronization
- Audio prayer playback
- Social or community features
- Reminder scheduling
- Multiple visual themes
- Multilingual support
- Analytics dashboards

These exclusions are deliberate. The first release should make one core workflow excellent before adding breadth.

## 4. Prayer content

The app must include structured data for:

- Sign of the Cross
- Apostles' Creed
- Our Father
- Hail Mary
- Glory Be
- Fatima Prayer
- Hail, Holy Queen
- Versicle and response
- Concluding Rosary Prayer

The app must include the four mystery sets:

- Joyful
- Sorrowful
- Glorious
- Luminous

Traditional weekday mapping:

- Monday: Joyful
- Tuesday: Sorrowful
- Wednesday: Glorious
- Thursday: Luminous
- Friday: Sorrowful
- Saturday: Joyful
- Sunday: Glorious

Prayer text and mystery data must be stored separately from presentation code.

## 5. Canonical Rosary sequence

The application must derive both navigation and display state from one canonical sequence. The visual map must not maintain a separate hard-coded prayer order.

The sequence is:

1. Crucifix: Sign of the Cross and Apostles' Creed
2. Opening large bead: one Our Father
3. Three opening small beads: one Hail Mary on each bead
4. Connector before the loop: one Glory Be and announcement of the first mystery
5. For each of five decades:
   1. Announce the mystery
   2. Large bead: one Our Father
   3. Ten small beads: one Hail Mary on each bead
   4. After the tenth Hail Mary: one Glory Be and one Fatima Prayer
6. After decade five:
   1. Hail, Holy Queen
   2. Versicle and response
   3. Concluding Rosary Prayer
   4. Sign of the Cross

Every displayed count and progress value must be derived from this sequence.

## 6. User experience

### Start state

On first use:

- The full connected Rosary is visible.
- The crucifix is identified as the starting point.
- The mystery set for the current weekday is selected automatically.
- The prayer sheet explains how to begin.

### Bead selection

When a user selects a bead:

- The selected bead gains a clear active state.
- The prayer sheet updates immediately.
- The sheet names the exact bead location.
- The sheet shows the prayer title and complete text.
- The sheet shows how many times the prayer is said at that location.
- For decade starts, the sheet shows the mystery name and a brief meditation.

### Sequential navigation

Previous and next controls must remain synchronized with direct bead selection. Navigating forward marks completed steps without changing the canonical sequence.

### Completion

After the fifth decade, the interface transitions to the final prayers. Completion should feel conclusive but restrained. No account, streak, score, or gamified celebration is required.

## 7. Responsive behavior

The iPhone layout is designed first rather than derived from desktop.

Requirements:

- No horizontal page overflow.
- The complete Rosary fits within the usable viewport width.
- The Rosary remains one connected object at all supported widths.
- Visible beads may be small, but each interactive target must be at least 44 by 44 CSS pixels.
- The prayer sheet must remain readable without hiding essential controls.
- Bottom padding must respect the iPhone Home indicator safe area.
- Top content must respect notch and status-bar safe areas where applicable.
- Text must not be clipped when system font scaling is increased.
- Desktop may use additional whitespace but should preserve the same interaction model.

## 8. Technical approach

### Stack

- Vite
- TypeScript
- Plain HTML, CSS, and TypeScript components
- Vitest
- Playwright
- ESLint
- Prettier
- PWA manifest and service worker support
- GitHub Actions
- GitHub Pages deployment

A heavy UI framework is not required for version 1. The app has a focused state model and benefits from a small runtime and direct control over SVG and CSS.

### Repository structure

```text
rosary/
├─ .github/
│  ├─ workflows/
│  │  ├─ ci.yml
│  │  └─ deploy-pages.yml
│  └─ pull_request_template.md
├─ docs/
│  └─ superpowers/
│     └─ specs/
├─ public/
│  ├─ icons/
│  ├─ manifest.webmanifest
│  └─ favicon.svg
├─ src/
│  ├─ app/
│  │  ├─ app.ts
│  │  ├─ state.ts
│  │  └─ persistence.ts
│  ├─ components/
│  │  ├─ rosary-map.ts
│  │  ├─ prayer-sheet.ts
│  │  ├─ mystery-selector.ts
│  │  ├─ progress-header.ts
│  │  └─ install-prompt.ts
│  ├─ data/
│  │  ├─ prayers.ts
│  │  ├─ mysteries.ts
│  │  └─ rosary-sequence.ts
│  ├─ domain/
│  │  ├─ prayer-step.ts
│  │  ├─ sequence.ts
│  │  └─ weekday-mysteries.ts
│  ├─ styles/
│  │  ├─ tokens.css
│  │  ├─ base.css
│  │  ├─ rosary.css
│  │  └─ prayer-sheet.css
│  ├─ main.ts
│  └─ index.html
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ e2e/
├─ eslint.config.js
├─ playwright.config.ts
├─ vite.config.ts
├─ vitest.config.ts
├─ package.json
├─ README.md
├─ CONTRIBUTING.md
├─ LICENSE
└─ .gitignore
```

## 9. Component boundaries

### `rosary-sequence.ts`

Defines the canonical order of every prayer step and its bead association. It is the source of truth for navigation, counts, and progress.

### `rosary-map.ts`

Responsible only for:

- connected cord geometry,
- wooden beads,
- centerpiece,
- attached crucifix,
- selected and completed states,
- pointer and keyboard interaction.

It must not own prayer text or decide the next prayer.

### `prayer-sheet.ts`

Receives the current step and renders:

- exact bead location,
- prayer title,
- complete prayer text,
- repetition count,
- mystery context,
- previous and next actions.

### `mystery-selector.ts`

Handles automatic weekday selection and explicit manual override.

### State and persistence

Persist only:

```ts
{
  currentStepId: string;
  mysterySet: "joyful" | "sorrowful" | "glorious" | "luminous";
  mysterySelectionMode: "automatic" | "manual";
}
```

Malformed, obsolete, or impossible saved state must be rejected and replaced with safe defaults.

## 10. Accessibility

- Every bead must be reachable by keyboard.
- Every interactive bead must have an accessible name that includes its location and prayer role.
- Active and completed states must not rely on color alone.
- Focus indicators must remain visible against the wooden-bead design.
- Buttons and selectors require clear labels.
- The prayer sheet must announce meaningful updates to assistive technology without repeatedly reading the entire page.
- Motion must be reduced when the user requests reduced motion.
- Minimum contrast must meet WCAG AA for text and interactive controls.

## 11. PWA behavior

- Provide a valid web app manifest.
- Provide appropriate application icons.
- Use standalone display mode.
- Cache the application shell and prayer data for offline use.
- After the first successful load, the Rosary must remain usable without a network connection.
- Service-worker updates must not corrupt saved progress.
- The app must remain usable in Safari even when installation is unavailable or declined.

## 12. Testing strategy

### Unit tests

Verify:

- exactly five decades exist,
- each decade contains exactly ten Hail Mary steps,
- opening prayers occur once and in the correct order,
- after-decade prayers occur five times in the correct locations,
- final prayers occur only after decade five,
- weekday-to-mystery mapping is correct,
- direct bead IDs resolve to the correct sequence steps,
- malformed saved state is rejected.

### Integration tests

Verify:

- selecting a bead displays the matching prayer,
- previous and next controls remain synchronized with the selected bead,
- changing the mystery set updates all mystery displays,
- completed state advances correctly,
- valid progress is restored after reload,
- final prayers appear after the fifth decade.

### Playwright mobile tests

Use representative iPhone viewports and verify:

- no horizontal overflow,
- all beads have usable tap targets,
- the full Rosary fits within the usable width,
- the cross remains visually attached,
- the centerpiece and opening strand remain connected,
- the prayer sheet controls remain visible,
- portrait layouts work at the smallest supported width,
- offline reload succeeds after caching,
- install-related metadata is present.

### Visual regression checks

Capture stable screenshots for:

- first launch,
- crucifix selected,
- opening Our Father,
- opening Hail Marys,
- middle of a decade,
- decade transition,
- final prayers,
- smallest supported iPhone viewport,
- larger iPhone viewport,
- desktop viewport.

Rendered screenshots must be inspected before completion. A passing build alone is insufficient.

## 13. Continuous integration and deployment

Every pull request must run:

1. formatting checks,
2. linting,
3. TypeScript checks,
4. unit tests,
5. integration tests,
6. Playwright mobile tests,
7. production build.

GitHub Pages deployment runs only from `main` after required checks pass.

## 14. Completion criteria

Version 1 is complete only when:

- all prayer content is present,
- the canonical sequence is verified by tests,
- every bead maps to the correct prayer,
- the wooden Rosary appears complete and physically connected,
- the crucifix remains attached at every tested viewport,
- no supported mobile viewport has horizontal overflow,
- touch targets are usable,
- offline mode works after the first load,
- saved progress restores safely,
- accessibility checks pass,
- CI passes,
- final screenshots have been reviewed and iterated upon.

## 15. Implementation constraint

Implementation must follow a written plan and test-first workflow. No feature should be considered complete without direct verification of both behavior and rendered output.
