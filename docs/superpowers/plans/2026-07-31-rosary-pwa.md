# Rosary PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, installable, offline-capable Rosary PWA whose complete connected wooden Rosary remains visible on iPhone while each bead opens the exact prayer, count, and mystery context.

**Architecture:** A single canonical sequence drives navigation, progress, bead mapping, and prayer display. Domain data and state are independent of the UI; the Rosary map is a decorative SVG plus native HTML button hit targets; the prayer sheet renders a view model derived from the current sequence step and selected mystery set.

**Tech Stack:** Vite, TypeScript, plain HTML/CSS/TypeScript, Vitest with jsdom, Playwright, ESLint, Prettier, a web app manifest, a hand-written service worker, GitHub Actions, and GitHub Pages.

## Global Constraints

- iPhone is the primary layout target; desktop uses the same interaction model with additional space.
- Use no heavy UI framework in version 1.
- Keep the complete Rosary visible as one physically connected object.
- Use warm wooden beads, a wooden centerpiece, a continuous visible cord, and an attached carved wooden crucifix.
- The cord must run continuously from the five-decade loop through the centerpiece, opening beads, opening large bead, and crucifix.
- No supported viewport may have horizontal page overflow.
- Every interactive bead target must be at least 44 by 44 CSS pixels.
- Respect iPhone top and bottom safe areas.
- Do not clip prayer text when system text size is increased.
- Keep prayer data separate from presentation code.
- Derive navigation, counts, completion, and bead mapping from one canonical sequence.
- Persist only `currentStepId`, `mysterySet`, and `mysterySelectionMode`.
- Reject malformed or obsolete persisted state and replace it with safe defaults.
- Meet WCAG AA contrast for text and controls.
- Do not rely on color alone for selected or completed states.
- Support keyboard navigation and visible focus.
- Respect `prefers-reduced-motion`.
- Remain usable in Safari when installation is unavailable or declined.
- Work offline after one successful online load.
- Run formatting, linting, type checks, unit tests, integration tests, Playwright mobile tests, and a production build in CI.
- Deploy GitHub Pages only from `main` after CI passes.
- Inspect rendered screenshots before completion; a passing build alone is insufficient.
- Version 1 excludes accounts, cloud sync, audio, social features, reminders, multiple themes, multilingual support, and analytics dashboards.

---

## File Map

The implementation creates these focused units:

```text
rosary/
├─ .github/
│  ├─ workflows/
│  │  ├─ ci.yml
│  │  └─ deploy-pages.yml
│  └─ pull_request_template.md
├─ docs/
│  ├─ qa/
│  │  └─ v1-release-checklist.md
│  └─ superpowers/
│     ├─ plans/
│     │  └─ 2026-07-31-rosary-pwa.md
│     └─ specs/
│        └─ 2026-07-31-rosary-pwa-design.md
├─ public/
│  ├─ icons/
│  │  ├─ icon-192.png
│  │  ├─ icon-512.png
│  │  └─ icon-maskable-512.png
│  ├─ favicon.svg
│  ├─ manifest.webmanifest
│  └─ sw.js
├─ scripts/
│  ├─ generate-icons.mjs
│  └─ validate-repository.mjs
├─ src/
│  ├─ app/
│  │  ├─ app.ts
│  │  ├─ config.ts
│  │  ├─ persistence.ts
│  │  ├─ register-service-worker.ts
│  │  └─ state.ts
│  ├─ components/
│  │  ├─ install-prompt.ts
│  │  ├─ mystery-selector.ts
│  │  ├─ prayer-sheet.ts
│  │  ├─ progress-header.ts
│  │  ├─ rosary-geometry.ts
│  │  └─ rosary-map.ts
│  ├─ data/
│  │  ├─ mysteries.ts
│  │  ├─ prayers.ts
│  │  └─ rosary-sequence.ts
│  ├─ domain/
│  │  ├─ prayer-step.ts
│  │  ├─ sequence.ts
│  │  └─ weekday-mysteries.ts
│  ├─ styles/
│  │  ├─ base.css
│  │  ├─ prayer-sheet.css
│  │  ├─ rosary.css
│  │  └─ tokens.css
│  ├─ index.html
│  └─ main.ts
├─ tests/
│  ├─ e2e/
│  │  ├─ accessibility.spec.ts
│  │  ├─ mobile-layout.spec.ts
│  │  ├─ offline.spec.ts
│  │  └─ rosary-flow.spec.ts
│  ├─ integration/
│  │  ├─ app-navigation.test.ts
│  │  ├─ install-prompt.test.ts
│  │  ├─ prayer-sheet.test.ts
│  │  └─ rosary-map.test.ts
│  └─ unit/
│     ├─ bootstrap.test.ts
│     ├─ persistence.test.ts
│     ├─ prayer-data.test.ts
│     ├─ repository-files.test.ts
│     ├─ rosary-geometry.test.ts
│     ├─ rosary-sequence.test.ts
│     └─ weekday-mysteries.test.ts
├─ .gitignore
├─ .prettierignore
├─ .prettierrc.json
├─ CONTRIBUTING.md
├─ LICENSE
├─ README.md
├─ eslint.config.js
├─ package-lock.json
├─ package.json
├─ playwright.config.ts
├─ tsconfig.json
├─ vite.config.ts
└─ vitest.config.ts
```

---

### Task 1: Bootstrap the tested Vite and TypeScript foundation

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `eslint.config.js`
- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Create: `.gitignore`
- Create: `src/index.html`
- Create: `src/app/config.ts`
- Create: `src/main.ts`
- Create: `src/styles/tokens.css`
- Create: `src/styles/base.css`
- Test: `tests/unit/bootstrap.test.ts`

**Interfaces:**
- Produces: `APP_NAME: "Rosary"` and `APP_STORAGE_KEY: "rosary:pwa:v1"` from `src/app/config.ts`.
- Produces: a Vite app rooted at `src/` and built to `dist/`.
- Produces: scripts `dev`, `build`, `preview`, `typecheck`, `lint`, `format`, `format:check`, `test:unit`, `test:e2e`, `test`, `validate:repo`, and `check`.

- [ ] **Step 1: Initialize npm and install the exact tool categories**

Run:

```bash
npm init -y
npm install --save-dev vite typescript @types/node vitest jsdom @vitest/coverage-v8 @playwright/test @axe-core/playwright eslint @eslint/js typescript-eslint globals prettier sharp
```

Expected: `package.json` and `package-lock.json` exist and `npm audit` completes without an install failure.

- [ ] **Step 2: Write the failing bootstrap test**

Create `tests/unit/bootstrap.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { APP_NAME, APP_STORAGE_KEY } from "../../src/app/config";

describe("application configuration", () => {
  it("uses stable public identifiers", () => {
    expect(APP_NAME).toBe("Rosary");
    expect(APP_STORAGE_KEY).toBe("rosary:pwa:v1");
  });
});
```

- [ ] **Step 3: Add the Vitest configuration and verify the test fails for the intended reason**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
```

Run:

```bash
npx vitest run tests/unit/bootstrap.test.ts
```

Expected: FAIL because `src/app/config.ts` does not exist.

- [ ] **Step 4: Create the minimal configuration module**

Create `src/app/config.ts`:

```ts
export const APP_NAME = "Rosary" as const;
export const APP_STORAGE_KEY = "rosary:pwa:v1" as const;
```

Run:

```bash
npx vitest run tests/unit/bootstrap.test.ts
```

Expected: PASS.

- [ ] **Step 5: Configure TypeScript, Vite, Playwright, linting, and formatting**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable", "WebWorker"],
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noEmit": true,
    "types": ["vitest/globals", "node"]
  },
  "include": ["src", "tests", "*.ts", "scripts"]
}
```

Create `vite.config.ts`:

```ts
import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  base: "/rosary/",
  publicDir: "../public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: {
    host: "127.0.0.1",
    port: 4173,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
  },
});
```

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4173/rosary/",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "iphone-se",
      use: {
        browserName: "webkit",
        viewport: { width: 320, height: 568 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "iphone-14",
      use: {
        browserName: "webkit",
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://127.0.0.1:4173/rosary/",
    reuseExistingServer: !process.env.CI,
  },
});
```

Create `eslint.config.js`:

```js
import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist", "coverage", "playwright-report", "test-results"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
    },
  },
  {
    files: ["tests/**/*.ts", "*.config.ts"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["scripts/**/*.mjs", "*.config.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["public/sw.js"],
    languageOptions: {
      globals: globals.serviceworker,
    },
  },
);
```

Create `.prettierrc.json`:

```json
{
  "printWidth": 100,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all"
}
```

Create `.prettierignore`:

```text
dist
coverage
playwright-report
test-results
package-lock.json
```

Create `.gitignore`:

```text
node_modules/
dist/
coverage/
playwright-report/
test-results/
.DS_Store
.env
.env.*
!.env.example
```

Set package metadata and scripts without replacing npm’s generated dependency blocks:

```bash
npm pkg set name=rosary
npm pkg set private=true --json
npm pkg set version=0.1.0
npm pkg set type=module
npm pkg set description="A mobile-first, installable Rosary prayer guide."
npm pkg set scripts.dev=vite
npm pkg set scripts.build="tsc --noEmit && vite build"
npm pkg set scripts.preview="vite preview"
npm pkg set scripts.typecheck="tsc --noEmit"
npm pkg set scripts.lint="eslint ."
npm pkg set scripts.format="prettier --write ."
npm pkg set scripts.format:check="prettier --check ."
npm pkg set scripts.test:unit="vitest run"
npm pkg set scripts.test:e2e="playwright test"
npm pkg set scripts.test="npm run test:unit && npm run test:e2e"
npm pkg set scripts.validate:repo="node scripts/validate-repository.mjs"
npm pkg set scripts.check="npm run format:check && npm run lint && npm run typecheck && npm run test:unit && npm run build"
```

- [ ] **Step 6: Create the minimal page shell and design tokens**

Create `src/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#2f2118" />
    <meta
      name="description"
      content="Pray the Rosary bead by bead with complete prayers and mysteries."
    />
    <link rel="icon" href="/rosary/favicon.svg" type="image/svg+xml" />
    <link rel="manifest" href="/rosary/manifest.webmanifest" />
    <title>Rosary</title>
  </head>
  <body>
    <main id="app" aria-label="Rosary prayer guide"></main>
    <noscript>This Rosary guide requires JavaScript to show the selected prayer.</noscript>
    <script type="module" src="/main.ts"></script>
  </body>
</html>
```

Create `src/styles/tokens.css`:

```css
:root {
  color-scheme: light;
  --color-ink: #221b16;
  --color-muted: #6f6258;
  --color-surface: #fffdf8;
  --color-canvas: #f4efe5;
  --color-canvas-deep: #e8ddcd;
  --color-wood-light: #bd8555;
  --color-wood: #855532;
  --color-wood-dark: #4f301f;
  --color-cord: #6d4b34;
  --color-gold: #b58a3a;
  --color-gold-soft: #eadbb4;
  --color-focus: #1f6fa0;
  --color-complete: #5f735d;
  --shadow-card: 0 18px 48px rgb(49 34 23 / 14%);
  --radius-sheet: 1.5rem;
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}
```

Create `src/styles/base.css`:

```css
@import "./tokens.css";

* {
  box-sizing: border-box;
}

html {
  min-width: 320px;
  background: var(--color-canvas);
  -webkit-text-size-adjust: 100%;
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
  overflow-x: hidden;
  color: var(--color-ink);
  background:
    radial-gradient(circle at 50% 0%, rgb(181 138 58 / 10%), transparent 32rem),
    linear-gradient(180deg, var(--color-canvas), var(--color-canvas-deep));
}

button,
select {
  font: inherit;
}

button {
  touch-action: manipulation;
}

:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

Create `src/main.ts`:

```ts
import "./styles/base.css";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Missing #app root element");
}

root.innerHTML = `
  <section class="app-loading" aria-live="polite">
    <h1>Rosary</h1>
    <p>Preparing the prayer guide…</p>
  </section>
`;
```

- [ ] **Step 7: Run the foundation checks**

Run:

```bash
npm run format
npm run lint
npm run typecheck
npm run test:unit
npm run build
```

Expected: all commands exit 0 and `dist/index.html` exists.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts vitest.config.ts playwright.config.ts eslint.config.js .prettierrc.json .prettierignore .gitignore src tests/unit/bootstrap.test.ts
git commit -m "chore: bootstrap Rosary PWA"
```

---

### Task 2: Add exact prayer and mystery domain data

**Files:**
- Create: `src/domain/prayer-step.ts`
- Create: `src/data/prayers.ts`
- Create: `src/data/mysteries.ts`
- Create: `src/domain/weekday-mysteries.ts`
- Test: `tests/unit/prayer-data.test.ts`
- Test: `tests/unit/weekday-mysteries.test.ts`

**Interfaces:**
- Produces: `PrayerId`, `Prayer`, `MysterySetId`, `Mystery`, and `MysterySelectionMode`.
- Produces: `PRAYERS: Readonly<Record<PrayerId, Prayer>>`.
- Produces: `MYSTERIES: Readonly<Record<MysterySetId, readonly Mystery[]>>`.
- Produces: `getMysterySetForDate(date: Date): MysterySetId`.

- [ ] **Step 1: Write failing data-shape and weekday tests**

Create `tests/unit/prayer-data.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { MYSTERIES } from "../../src/data/mysteries";
import { PRAYERS } from "../../src/data/prayers";

describe("prayer data", () => {
  it("contains every prayer required by the complete Rosary", () => {
    expect(Object.keys(PRAYERS).sort()).toEqual(
      [
        "apostles-creed",
        "concluding-prayer",
        "fatima-prayer",
        "glory-be",
        "hail-holy-queen",
        "hail-mary",
        "our-father",
        "sign-of-cross",
        "versicle-response",
      ].sort(),
    );
  });

  it("contains four mystery sets with five mysteries each", () => {
    expect(Object.keys(MYSTERIES).sort()).toEqual(
      ["glorious", "joyful", "luminous", "sorrowful"].sort(),
    );

    for (const mysteries of Object.values(MYSTERIES)) {
      expect(mysteries).toHaveLength(5);
      for (const mystery of mysteries) {
        expect(mystery.name.length).toBeGreaterThan(3);
        expect(mystery.meditation.length).toBeGreaterThan(20);
      }
    }
  });

  it("does not contain abbreviated prayer copy", () => {
    for (const prayer of Object.values(PRAYERS)) {
      expect(prayer.text).not.toContain("…");
      expect(prayer.text).not.toContain("...");
      expect(prayer.text.length).toBeGreaterThan(20);
    }
  });
});
```

Create `tests/unit/weekday-mysteries.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getMysterySetForDate } from "../../src/domain/weekday-mysteries";

describe("getMysterySetForDate", () => {
  it.each([
    ["2026-08-03T12:00:00", "joyful"],
    ["2026-08-04T12:00:00", "sorrowful"],
    ["2026-08-05T12:00:00", "glorious"],
    ["2026-08-06T12:00:00", "luminous"],
    ["2026-08-07T12:00:00", "sorrowful"],
    ["2026-08-08T12:00:00", "joyful"],
    ["2026-08-09T12:00:00", "glorious"],
  ] as const)("maps %s to %s", (iso, expected) => {
    expect(getMysterySetForDate(new Date(iso))).toBe(expected);
  });
});
```

- [ ] **Step 2: Run tests and confirm missing-module failures**

Run:

```bash
npx vitest run tests/unit/prayer-data.test.ts tests/unit/weekday-mysteries.test.ts
```

Expected: FAIL because the imported modules do not exist.

- [ ] **Step 3: Define stable domain types**

Create `src/domain/prayer-step.ts`:

```ts
export type PrayerId =
  | "sign-of-cross"
  | "apostles-creed"
  | "our-father"
  | "hail-mary"
  | "glory-be"
  | "fatima-prayer"
  | "hail-holy-queen"
  | "versicle-response"
  | "concluding-prayer";

export type MysterySetId = "joyful" | "sorrowful" | "glorious" | "luminous";

export type MysterySelectionMode = "automatic" | "manual";

export interface Prayer {
  readonly id: PrayerId;
  readonly title: string;
  readonly text: string;
}

export interface Mystery {
  readonly name: string;
  readonly meditation: string;
}
```

- [ ] **Step 4: Add complete prayer copy**

Create `src/data/prayers.ts`:

```ts
import type { Prayer, PrayerId } from "../domain/prayer-step";

export const PRAYERS: Readonly<Record<PrayerId, Prayer>> = {
  "sign-of-cross": {
    id: "sign-of-cross",
    title: "Sign of the Cross",
    text: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
  },
  "apostles-creed": {
    id: "apostles-creed",
    title: "Apostles’ Creed",
    text:
      "I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried. He descended into hell; on the third day He rose again from the dead; He ascended into heaven, and is seated at the right hand of God the Father almighty; from there He will come to judge the living and the dead.\n\n" +
      "I believe in the Holy Spirit, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
  },
  "our-father": {
    id: "our-father",
    title: "Our Father",
    text:
      "Our Father, who art in heaven, hallowed be Thy name. Thy kingdom come, Thy will be done, on earth as it is in heaven.\n\n" +
      "Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
  },
  "hail-mary": {
    id: "hail-mary",
    title: "Hail Mary",
    text:
      "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus.\n\n" +
      "Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
  },
  "glory-be": {
    id: "glory-be",
    title: "Glory Be",
    text:
      "Glory be to the Father, and to the Son, and to the Holy Spirit.\n\n" +
      "As it was in the beginning, is now, and ever shall be, world without end. Amen.",
  },
  "fatima-prayer": {
    id: "fatima-prayer",
    title: "Fatima Prayer",
    text:
      "O my Jesus, forgive us our sins, save us from the fires of hell. Lead all souls to Heaven, especially those most in need of Thy mercy.",
  },
  "hail-holy-queen": {
    id: "hail-holy-queen",
    title: "Hail, Holy Queen",
    text:
      "Hail, Holy Queen, Mother of Mercy, our life, our sweetness, and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears.\n\n" +
      "Turn then, most gracious Advocate, thine eyes of mercy toward us, and after this our exile show unto us the blessed fruit of thy womb, Jesus.\n\n" +
      "O clement, O loving, O sweet Virgin Mary.",
  },
  "versicle-response": {
    id: "versicle-response",
    title: "Versicle and Response",
    text:
      "Pray for us, O Holy Mother of God.\n\n" +
      "Response: That we may be made worthy of the promises of Christ.",
  },
  "concluding-prayer": {
    id: "concluding-prayer",
    title: "Concluding Rosary Prayer",
    text:
      "Let us pray.\n\n" +
      "O God, whose Only Begotten Son, by His life, death, and Resurrection, has purchased for us the rewards of eternal life, grant, we beseech Thee, that by meditating upon these mysteries of the Most Holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ our Lord. Amen.",
  },
};
```

- [ ] **Step 5: Add the four mystery sets**

Create `src/data/mysteries.ts`:

```ts
import type { Mystery, MysterySetId } from "../domain/prayer-step";

export const MYSTERIES: Readonly<Record<MysterySetId, readonly Mystery[]>> = {
  joyful: [
    {
      name: "The Annunciation",
      meditation:
        "Mary receives the angel Gabriel’s message and gives her faithful yes to God.",
    },
    {
      name: "The Visitation",
      meditation:
        "Mary visits Elizabeth, and Christ’s presence brings joy before His birth.",
    },
    {
      name: "The Nativity",
      meditation: "Jesus is born in Bethlehem in humility and poverty.",
    },
    {
      name: "The Presentation",
      meditation: "Mary and Joseph present Jesus in the Temple.",
    },
    {
      name: "The Finding of Jesus in the Temple",
      meditation: "Mary and Joseph find the young Jesus teaching in the Temple.",
    },
  ],
  sorrowful: [
    {
      name: "The Agony in the Garden",
      meditation: "Jesus prays in Gethsemane and accepts the Father’s will.",
    },
    {
      name: "The Scourging at the Pillar",
      meditation: "Jesus is cruelly scourged.",
    },
    {
      name: "The Crowning with Thorns",
      meditation: "Jesus is mocked and crowned with thorns.",
    },
    {
      name: "The Carrying of the Cross",
      meditation: "Jesus carries the Cross toward Calvary.",
    },
    {
      name: "The Crucifixion",
      meditation: "Jesus dies on the Cross for the salvation of the world.",
    },
  ],
  glorious: [
    {
      name: "The Resurrection",
      meditation: "Jesus rises from the dead, conquering sin and death.",
    },
    {
      name: "The Ascension",
      meditation: "Jesus ascends into Heaven.",
    },
    {
      name: "The Descent of the Holy Spirit",
      meditation: "The Holy Spirit descends upon Mary and the Apostles.",
    },
    {
      name: "The Assumption of Mary",
      meditation: "Mary is taken body and soul into Heaven.",
    },
    {
      name: "The Coronation of Mary",
      meditation: "Mary is crowned Queen of Heaven and Earth.",
    },
  ],
  luminous: [
    {
      name: "The Baptism of Jesus in the Jordan",
      meditation: "The Father reveals Jesus as His beloved Son.",
    },
    {
      name: "The Wedding at Cana",
      meditation: "Jesus performs His first public sign at Mary’s request.",
    },
    {
      name: "The Proclamation of the Kingdom",
      meditation: "Jesus calls all people to repentance and faith.",
    },
    {
      name: "The Transfiguration",
      meditation: "Jesus reveals His glory to Peter, James, and John.",
    },
    {
      name: "The Institution of the Eucharist",
      meditation: "Jesus gives His Body and Blood at the Last Supper.",
    },
  ],
};
```

- [ ] **Step 6: Implement weekday mapping**

Create `src/domain/weekday-mysteries.ts`:

```ts
import type { MysterySetId } from "./prayer-step";

const MYSTERY_SET_BY_WEEKDAY: readonly MysterySetId[] = [
  "glorious",
  "joyful",
  "sorrowful",
  "glorious",
  "luminous",
  "sorrowful",
  "joyful",
];

export function getMysterySetForDate(date: Date): MysterySetId {
  const mysterySet = MYSTERY_SET_BY_WEEKDAY[date.getDay()];

  if (!mysterySet) {
    throw new RangeError(`Unsupported weekday index: ${date.getDay()}`);
  }

  return mysterySet;
}
```

- [ ] **Step 7: Run data tests**

Run:

```bash
npx vitest run tests/unit/prayer-data.test.ts tests/unit/weekday-mysteries.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/domain/prayer-step.ts src/domain/weekday-mysteries.ts src/data/prayers.ts src/data/mysteries.ts tests/unit/prayer-data.test.ts tests/unit/weekday-mysteries.test.ts
git commit -m "feat: add Rosary prayers and mysteries"
```

---

### Task 3: Build the canonical Rosary sequence and invariants

**Files:**
- Create: `src/domain/sequence.ts`
- Create: `src/data/rosary-sequence.ts`
- Test: `tests/unit/rosary-sequence.test.ts`

**Interfaces:**
- Produces: `RosaryStepKind`, `RosaryStep`, `DecadeNumber`, and `HailMaryNumber`.
- Produces: `ROSARY_SEQUENCE: readonly RosaryStep[]`.
- Produces: `getStepById(stepId: string): RosaryStep | undefined`.
- Produces: `getStepIndex(stepId: string): number`.
- Produces: `getPreviousStep(stepId: string): RosaryStep | undefined`.
- Produces: `getNextStep(stepId: string): RosaryStep | undefined`.

- [ ] **Step 1: Write failing sequence invariant tests**

Create `tests/unit/rosary-sequence.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  ROSARY_SEQUENCE,
  getNextStep,
  getPreviousStep,
  getStepById,
  getStepIndex,
} from "../../src/data/rosary-sequence";

describe("ROSARY_SEQUENCE", () => {
  it("contains the complete 70-step Rosary in stable order", () => {
    expect(ROSARY_SEQUENCE).toHaveLength(70);
    expect(ROSARY_SEQUENCE[0]?.id).toBe("crucifix");
    expect(ROSARY_SEQUENCE.at(-1)?.id).toBe("final-sign-of-cross");
    expect(ROSARY_SEQUENCE.map((step) => step.order)).toEqual(
      Array.from({ length: 70 }, (_, index) => index),
    );
  });

  it("contains exactly five decades with ten Hail Mary beads each", () => {
    for (const decade of [1, 2, 3, 4, 5] as const) {
      const large = ROSARY_SEQUENCE.filter(
        (step) => step.kind === "decade-large" && step.decade === decade,
      );
      const small = ROSARY_SEQUENCE.filter(
        (step) => step.kind === "decade-small" && step.decade === decade,
      );
      const after = ROSARY_SEQUENCE.filter(
        (step) => step.kind === "after-decade" && step.decade === decade,
      );

      expect(large).toHaveLength(1);
      expect(small).toHaveLength(10);
      expect(after).toHaveLength(1);
      expect(small.map((step) => step.beadNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }
  });

  it("maps every physical Rosary target to a stable visual target id", () => {
    const physicalSteps = ROSARY_SEQUENCE.filter((step) => step.visualTargetId !== undefined);
    expect(new Set(physicalSteps.map((step) => step.visualTargetId)).size).toBe(
      physicalSteps.length,
    );
  });

  it("navigates previous and next without wrapping", () => {
    expect(getPreviousStep("crucifix")).toBeUndefined();
    expect(getNextStep("crucifix")?.id).toBe("opening-our-father");
    expect(getPreviousStep("final-sign-of-cross")?.id).toBe("final-concluding-prayer");
    expect(getNextStep("final-sign-of-cross")).toBeUndefined();
    expect(getStepIndex("decade-3-hail-7")).toBeGreaterThan(0);
    expect(getStepById("decade-3-hail-7")?.prayerIds).toEqual(["hail-mary"]);
  });
});
```

- [ ] **Step 2: Run the test and confirm missing-module failure**

Run:

```bash
npx vitest run tests/unit/rosary-sequence.test.ts
```

Expected: FAIL because the sequence modules do not exist.

- [ ] **Step 3: Define sequence types**

Create `src/domain/sequence.ts`:

```ts
import type { PrayerId } from "./prayer-step";

export type DecadeNumber = 1 | 2 | 3 | 4 | 5;
export type HailMaryNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type RosaryStepKind =
  | "crucifix"
  | "opening-large"
  | "opening-small"
  | "connector"
  | "decade-large"
  | "decade-small"
  | "after-decade"
  | "final";

export interface RosaryStep {
  readonly id: string;
  readonly order: number;
  readonly kind: RosaryStepKind;
  readonly label: string;
  readonly location: string;
  readonly repetition: string;
  readonly prayerIds: readonly PrayerId[];
  readonly visualTargetId?: string;
  readonly decade?: DecadeNumber;
  readonly beadNumber?: HailMaryNumber | 1 | 2 | 3;
  readonly mysteryIndex?: 0 | 1 | 2 | 3 | 4;
}
```

- [ ] **Step 4: Implement the sequence builder**

Create `src/data/rosary-sequence.ts`:

```ts
import type { PrayerId } from "../domain/prayer-step";
import type {
  DecadeNumber,
  HailMaryNumber,
  RosaryStep,
  RosaryStepKind,
} from "../domain/sequence";

const steps: RosaryStep[] = [];

function addStep(input: {
  id: string;
  kind: RosaryStepKind;
  label: string;
  location: string;
  repetition: string;
  prayerIds: readonly PrayerId[];
  visualTargetId?: string;
  decade?: DecadeNumber;
  beadNumber?: HailMaryNumber | 1 | 2 | 3;
  mysteryIndex?: 0 | 1 | 2 | 3 | 4;
}): void {
  steps.push({
    ...input,
    order: steps.length,
  });
}

addStep({
  id: "crucifix",
  kind: "crucifix",
  label: "Begin the Rosary",
  location: "Crucifix",
  repetition: "Say each prayer once.",
  prayerIds: ["sign-of-cross", "apostles-creed"],
  visualTargetId: "crucifix",
});

addStep({
  id: "opening-our-father",
  kind: "opening-large",
  label: "Opening Our Father",
  location: "Large bead above the crucifix",
  repetition: "Say once.",
  prayerIds: ["our-father"],
  visualTargetId: "opening-large",
});

for (const beadNumber of [1, 2, 3] as const) {
  addStep({
    id: `opening-hail-${beadNumber}`,
    kind: "opening-small",
    label: `Opening Hail Mary ${beadNumber} of 3`,
    location: `Opening small bead ${beadNumber} of 3`,
    repetition: `Say once on this bead. This is ${beadNumber} of 3.`,
    prayerIds: ["hail-mary"],
    visualTargetId: `opening-small-${beadNumber}`,
    beadNumber,
  });
}

addStep({
  id: "opening-glory",
  kind: "connector",
  label: "Before the first decade",
  location: "Centerpiece below the five-decade loop",
  repetition: "Say once, then announce the first mystery.",
  prayerIds: ["glory-be"],
  visualTargetId: "centerpiece",
  mysteryIndex: 0,
});

for (const decade of [1, 2, 3, 4, 5] as const) {
  const mysteryIndex = (decade - 1) as 0 | 1 | 2 | 3 | 4;

  addStep({
    id: `decade-${decade}-our-father`,
    kind: "decade-large",
    label: `Begin decade ${decade}`,
    location: `Large bead for decade ${decade}`,
    repetition: "Announce the mystery, then say one Our Father.",
    prayerIds: ["our-father"],
    visualTargetId: `decade-${decade}-large`,
    decade,
    mysteryIndex,
  });

  for (const beadNumber of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const) {
    addStep({
      id: `decade-${decade}-hail-${beadNumber}`,
      kind: "decade-small",
      label: `Hail Mary ${beadNumber} of 10`,
      location: `Small bead ${beadNumber} in decade ${decade}`,
      repetition: `Say once on this bead. This is ${beadNumber} of 10.`,
      prayerIds: ["hail-mary"],
      visualTargetId: `decade-${decade}-small-${beadNumber}`,
      decade,
      beadNumber,
    });
  }

  addStep({
    id: `decade-${decade}-complete`,
    kind: "after-decade",
    label: `Complete decade ${decade}`,
    location: `After the tenth Hail Mary of decade ${decade}`,
    repetition: "Say each prayer once.",
    prayerIds: ["glory-be", "fatima-prayer"],
    visualTargetId: `decade-${decade}-after`,
    decade,
  });
}

addStep({
  id: "final-hail-holy-queen",
  kind: "final",
  label: "Hail, Holy Queen",
  location: "After the fifth decade",
  repetition: "Say once.",
  prayerIds: ["hail-holy-queen"],
});

addStep({
  id: "final-versicle-response",
  kind: "final",
  label: "Versicle and Response",
  location: "After the Hail, Holy Queen",
  repetition: "Say once.",
  prayerIds: ["versicle-response"],
});

addStep({
  id: "final-concluding-prayer",
  kind: "final",
  label: "Concluding Rosary Prayer",
  location: "At the conclusion of the Rosary",
  repetition: "Say once.",
  prayerIds: ["concluding-prayer"],
});

addStep({
  id: "final-sign-of-cross",
  kind: "final",
  label: "Finish with the Sign of the Cross",
  location: "Crucifix",
  repetition: "Say once.",
  prayerIds: ["sign-of-cross"],
});

export const ROSARY_SEQUENCE: readonly RosaryStep[] = Object.freeze(steps);

const stepIndexById = new Map(ROSARY_SEQUENCE.map((step, index) => [step.id, index]));

export function getStepById(stepId: string): RosaryStep | undefined {
  const index = stepIndexById.get(stepId);
  return index === undefined ? undefined : ROSARY_SEQUENCE[index];
}

export function getStepIndex(stepId: string): number {
  return stepIndexById.get(stepId) ?? -1;
}

export function getPreviousStep(stepId: string): RosaryStep | undefined {
  const index = getStepIndex(stepId);
  return index <= 0 ? undefined : ROSARY_SEQUENCE[index - 1];
}

export function getNextStep(stepId: string): RosaryStep | undefined {
  const index = getStepIndex(stepId);
  return index < 0 || index >= ROSARY_SEQUENCE.length - 1
    ? undefined
    : ROSARY_SEQUENCE[index + 1];
}
```

- [ ] **Step 5: Run sequence tests**

Run:

```bash
npx vitest run tests/unit/rosary-sequence.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/domain/sequence.ts src/data/rosary-sequence.ts tests/unit/rosary-sequence.test.ts
git commit -m "feat: define canonical Rosary sequence"
```

---

### Task 4: Add safe state transitions and persistence

**Files:**
- Create: `src/app/state.ts`
- Create: `src/app/persistence.ts`
- Test: `tests/unit/persistence.test.ts`

**Interfaces:**
- Produces: `AppState`.
- Produces: `createDefaultState(date: Date): AppState`.
- Produces: `selectStep(state: AppState, stepId: string): AppState`.
- Produces: `selectMysterySet(state: AppState, mysterySet: MysterySetId): AppState`.
- Produces: `useAutomaticMysteries(state: AppState, date: Date): AppState`.
- Produces: `loadState(storage: Storage, date: Date): AppState`.
- Produces: `saveState(storage: Storage, state: AppState): void`.

- [ ] **Step 1: Write failing persistence tests**

Create `tests/unit/persistence.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { APP_STORAGE_KEY } from "../../src/app/config";
import { loadState, saveState } from "../../src/app/persistence";
import {
  createDefaultState,
  selectMysterySet,
  selectStep,
  useAutomaticMysteries,
} from "../../src/app/state";

describe("application state", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates weekday-aware safe defaults", () => {
    expect(createDefaultState(new Date("2026-08-06T12:00:00"))).toEqual({
      currentStepId: "crucifix",
      mysterySet: "luminous",
      mysterySelectionMode: "automatic",
    });
  });

  it("rejects unknown step ids", () => {
    const state = createDefaultState(new Date("2026-08-06T12:00:00"));
    expect(() => selectStep(state, "missing-step")).toThrow("Unknown Rosary step");
  });

  it("switches to manual mode when a mystery set is chosen", () => {
    const state = selectMysterySet(
      createDefaultState(new Date("2026-08-06T12:00:00")),
      "joyful",
    );
    expect(state.mysterySet).toBe("joyful");
    expect(state.mysterySelectionMode).toBe("manual");
  });

  it("returns to weekday-aware automatic mode", () => {
    const manual = selectMysterySet(
      createDefaultState(new Date("2026-08-06T12:00:00")),
      "joyful",
    );
    expect(useAutomaticMysteries(manual, new Date("2026-08-07T12:00:00"))).toEqual({
      ...manual,
      mysterySet: "sorrowful",
      mysterySelectionMode: "automatic",
    });
  });

  it("round-trips only the approved persisted fields", () => {
    const state = selectStep(
      selectMysterySet(createDefaultState(new Date("2026-08-06T12:00:00")), "glorious"),
      "decade-2-hail-4",
    );

    saveState(localStorage, state);

    expect(JSON.parse(localStorage.getItem(APP_STORAGE_KEY) ?? "{}")).toEqual(state);
    expect(loadState(localStorage, new Date("2026-08-06T12:00:00"))).toEqual(state);
  });

  it.each([
    "{",
    "null",
    "[]",
    '{"currentStepId":"missing","mysterySet":"joyful","mysterySelectionMode":"manual"}',
    '{"currentStepId":"crucifix","mysterySet":"invalid","mysterySelectionMode":"manual"}',
    '{"currentStepId":"crucifix","mysterySet":"joyful","mysterySelectionMode":"invalid"}',
  ])("replaces malformed persisted state: %s", (stored) => {
    localStorage.setItem(APP_STORAGE_KEY, stored);

    expect(loadState(localStorage, new Date("2026-08-06T12:00:00"))).toEqual({
      currentStepId: "crucifix",
      mysterySet: "luminous",
      mysterySelectionMode: "automatic",
    });
  });

  it("remains usable when browser storage is unavailable", () => {
    const unavailableStorage: Storage = {
      get length() {
        return 0;
      },
      clear() {
        throw new DOMException("Storage blocked");
      },
      getItem() {
        throw new DOMException("Storage blocked");
      },
      key() {
        throw new DOMException("Storage blocked");
      },
      removeItem() {
        throw new DOMException("Storage blocked");
      },
      setItem() {
        throw new DOMException("Storage blocked");
      },
    };

    expect(loadState(unavailableStorage, new Date("2026-08-06T12:00:00"))).toEqual({
      currentStepId: "crucifix",
      mysterySet: "luminous",
      mysterySelectionMode: "automatic",
    });
    expect(() =>
      saveState(
        unavailableStorage,
        createDefaultState(new Date("2026-08-06T12:00:00")),
      ),
    ).not.toThrow();
  });
});
```

- [ ] **Step 2: Run and confirm missing-module failures**

Run:

```bash
npx vitest run tests/unit/persistence.test.ts
```

Expected: FAIL because `state.ts` and `persistence.ts` do not exist.

- [ ] **Step 3: Implement pure state transitions**

Create `src/app/state.ts`:

```ts
import { getStepById } from "../data/rosary-sequence";
import type { MysterySelectionMode, MysterySetId } from "../domain/prayer-step";
import { getMysterySetForDate } from "../domain/weekday-mysteries";

export interface AppState {
  readonly currentStepId: string;
  readonly mysterySet: MysterySetId;
  readonly mysterySelectionMode: MysterySelectionMode;
}

export function createDefaultState(date: Date): AppState {
  return {
    currentStepId: "crucifix",
    mysterySet: getMysterySetForDate(date),
    mysterySelectionMode: "automatic",
  };
}

export function selectStep(state: AppState, stepId: string): AppState {
  if (!getStepById(stepId)) {
    throw new RangeError(`Unknown Rosary step: ${stepId}`);
  }

  return {
    ...state,
    currentStepId: stepId,
  };
}

export function selectMysterySet(state: AppState, mysterySet: MysterySetId): AppState {
  return {
    ...state,
    mysterySet,
    mysterySelectionMode: "manual",
  };
}

export function useAutomaticMysteries(state: AppState, date: Date): AppState {
  return {
    ...state,
    mysterySet: getMysterySetForDate(date),
    mysterySelectionMode: "automatic",
  };
}
```

- [ ] **Step 4: Implement strict persistence validation**

Create `src/app/persistence.ts`:

```ts
import { APP_STORAGE_KEY } from "./config";
import { createDefaultState, type AppState } from "./state";
import { getStepById } from "../data/rosary-sequence";
import type { MysterySelectionMode, MysterySetId } from "../domain/prayer-step";
import { getMysterySetForDate } from "../domain/weekday-mysteries";

const MYSTERY_SETS = new Set<MysterySetId>(["joyful", "sorrowful", "glorious", "luminous"]);
const SELECTION_MODES = new Set<MysterySelectionMode>(["automatic", "manual"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseState(value: unknown, date: Date): AppState | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const currentStepId = value.currentStepId;
  const mysterySet = value.mysterySet;
  const mysterySelectionMode = value.mysterySelectionMode;

  if (
    typeof currentStepId !== "string" ||
    !getStepById(currentStepId) ||
    typeof mysterySet !== "string" ||
    !MYSTERY_SETS.has(mysterySet as MysterySetId) ||
    typeof mysterySelectionMode !== "string" ||
    !SELECTION_MODES.has(mysterySelectionMode as MysterySelectionMode)
  ) {
    return undefined;
  }

  return {
    currentStepId,
    mysterySet:
      mysterySelectionMode === "automatic"
        ? getMysterySetForDate(date)
        : (mysterySet as MysterySetId),
    mysterySelectionMode: mysterySelectionMode as MysterySelectionMode,
  };
}

export function loadState(storage: Storage, date: Date): AppState {
  try {
    const stored = storage.getItem(APP_STORAGE_KEY);

    if (!stored) {
      return createDefaultState(date);
    }

    return parseState(JSON.parse(stored), date) ?? createDefaultState(date);
  } catch {
    return createDefaultState(date);
  }
}

export function saveState(storage: Storage, state: AppState): void {
  try {
    storage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Prayer remains usable when private browsing or policy blocks storage.
  }
}
```

- [ ] **Step 5: Run persistence tests**

Run:

```bash
npx vitest run tests/unit/persistence.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/state.ts src/app/persistence.ts tests/unit/persistence.test.ts
git commit -m "feat: add safe Rosary progress state"
```

---

### Task 5: Define connected Rosary geometry and minimum hit targets

**Files:**
- Create: `src/components/rosary-geometry.ts`
- Test: `tests/unit/rosary-geometry.test.ts`

**Interfaces:**
- Produces: `Point`, `VisibleBead`, `SequenceMarker`, `InteractiveTarget`, and `RosaryGeometry`.
- Produces: `createRosaryGeometry(): RosaryGeometry`.
- Geometry uses a `390 × 700` view box and a `44` unit minimum target size.
- `target.stepId` maps directly to a physical `RosaryStep.id`.
- Final prayers are sequential controls rather than extra physical beads, so they intentionally have no direct map target.

- [ ] **Step 1: Write failing geometry tests**

Create `tests/unit/rosary-geometry.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ROSARY_SEQUENCE } from "../../src/data/rosary-sequence";
import { createRosaryGeometry } from "../../src/components/rosary-geometry";

describe("createRosaryGeometry", () => {
  it("maps every physical sequence step to exactly one interactive target", () => {
    const geometry = createRosaryGeometry();
    const expected = ROSARY_SEQUENCE.filter((step) => step.visualTargetId !== undefined);

    expect(geometry.targets).toHaveLength(expected.length);

    for (const step of expected) {
      expect(
        geometry.targets.filter((target) => target.stepId === step.id),
      ).toHaveLength(1);
    }
  });

  it("provides at least a 44 by 44 hit target for every bead and sequence marker", () => {
    const geometry = createRosaryGeometry();

    for (const target of geometry.targets) {
      expect(target.hitSize).toBeGreaterThanOrEqual(44);
    }
  });

  it("keeps the lower strand physically continuous into the crucifix", () => {
    const geometry = createRosaryGeometry();

    expect(geometry.loopBottom).toEqual(geometry.strandStart);
    expect(geometry.centerpieceExit).toEqual(geometry.openingCordStart);
    expect(geometry.openingCordEnd).toEqual(geometry.crossAttachment);
  });

  it("contains 55 loop beads and five after-decade markers", () => {
    const geometry = createRosaryGeometry();
    expect(geometry.loopBeads).toHaveLength(55);
    expect(geometry.afterMarkers).toHaveLength(5);
  });

  it("keeps all coordinates inside the view box", () => {
    const geometry = createRosaryGeometry();

    for (const item of [
      ...geometry.loopBeads,
      ...geometry.openingBeads,
      ...geometry.afterMarkers,
      ...geometry.targets,
    ]) {
      expect(item.x).toBeGreaterThanOrEqual(0);
      expect(item.x).toBeLessThanOrEqual(390);
      expect(item.y).toBeGreaterThanOrEqual(0);
      expect(item.y).toBeLessThanOrEqual(700);
    }
  });
});
```

- [ ] **Step 2: Run and confirm missing-module failure**

Run:

```bash
npx vitest run tests/unit/rosary-geometry.test.ts
```

Expected: FAIL because `rosary-geometry.ts` does not exist.

- [ ] **Step 3: Implement deterministic connected geometry**

Create `src/components/rosary-geometry.ts`:

```ts
import { ROSARY_SEQUENCE } from "../data/rosary-sequence";

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface VisibleBead extends Point {
  readonly visualTargetId: string;
  readonly radius: number;
  readonly size: "small" | "large";
}

export interface SequenceMarker extends Point {
  readonly visualTargetId: string;
  readonly radius: number;
}

export interface InteractiveTarget extends Point {
  readonly id: string;
  readonly stepId: string;
  readonly visualTargetId: string;
  readonly hitSize: number;
  readonly shape: "circle" | "after" | "centerpiece" | "cross";
}

export interface RosaryGeometry {
  readonly viewBox: "0 0 390 700";
  readonly loopCenter: Point;
  readonly loopRadiusX: number;
  readonly loopRadiusY: number;
  readonly loopBottom: Point;
  readonly strandStart: Point;
  readonly centerpieceCenter: Point;
  readonly centerpieceExit: Point;
  readonly openingCordStart: Point;
  readonly openingCordEnd: Point;
  readonly crossAttachment: Point;
  readonly loopBeads: readonly VisibleBead[];
  readonly openingBeads: readonly VisibleBead[];
  readonly afterMarkers: readonly SequenceMarker[];
  readonly targets: readonly InteractiveTarget[];
}

const LOOP_CENTER: Point = { x: 195, y: 225 };
const LOOP_RADIUS_X = 132;
const LOOP_RADIUS_Y = 160;
const HIT_SIZE = 44;

function stepIdForVisualTarget(visualTargetId: string): string {
  const matches = ROSARY_SEQUENCE.filter(
    (candidate) => candidate.visualTargetId === visualTargetId,
  );

  if (matches.length !== 1) {
    throw new Error(
      `Expected one Rosary step for visual target ${visualTargetId}; found ${matches.length}`,
    );
  }

  const step = matches[0];

  if (!step) {
    throw new Error(`No Rosary step maps to visual target: ${visualTargetId}`);
  }

  return step.id;
}

export function createRosaryGeometry(): RosaryGeometry {
  const loopBeads: VisibleBead[] = Array.from({ length: 55 }, (_, index) => {
    const angle = Math.PI / 2 - index * ((Math.PI * 2) / 55);
    const decade = Math.floor(index / 11) + 1;
    const withinDecade = index % 11;
    const isLarge = withinDecade === 0;
    const visualTargetId = isLarge
      ? `decade-${decade}-large`
      : `decade-${decade}-small-${withinDecade}`;

    return {
      x: LOOP_CENTER.x + LOOP_RADIUS_X * Math.cos(angle),
      y: LOOP_CENTER.y + LOOP_RADIUS_Y * Math.sin(angle),
      visualTargetId,
      radius: isLarge ? 11 : 6.5,
      size: isLarge ? "large" : "small",
    };
  });

  const afterMarkers: SequenceMarker[] = [1, 2, 3, 4, 5].map((decade) => {
    const nextLargeIndex = (decade * 11) % 55;
    const angle = Math.PI / 2 - nextLargeIndex * ((Math.PI * 2) / 55);

    return {
      x: LOOP_CENTER.x + (LOOP_RADIUS_X - 34) * Math.cos(angle),
      y: LOOP_CENTER.y + (LOOP_RADIUS_Y - 42) * Math.sin(angle),
      visualTargetId: `decade-${decade}-after`,
      radius: 7,
    };
  });

  const openingBeads: VisibleBead[] = [
    {
      x: 195,
      y: 492,
      visualTargetId: "opening-small-3",
      radius: 6.5,
      size: "small",
    },
    {
      x: 195,
      y: 522,
      visualTargetId: "opening-small-2",
      radius: 6.5,
      size: "small",
    },
    {
      x: 195,
      y: 552,
      visualTargetId: "opening-small-1",
      radius: 6.5,
      size: "small",
    },
    {
      x: 195,
      y: 594,
      visualTargetId: "opening-large",
      radius: 11,
      size: "large",
    },
  ];

  const beadTargets: InteractiveTarget[] = [...loopBeads, ...openingBeads].map(
    (bead) => ({
      id: `target-${bead.visualTargetId}`,
      stepId: stepIdForVisualTarget(bead.visualTargetId),
      visualTargetId: bead.visualTargetId,
      x: bead.x,
      y: bead.y,
      hitSize: HIT_SIZE,
      shape: "circle",
    }),
  );

  const markerTargets: InteractiveTarget[] = afterMarkers.map((marker) => ({
    id: `target-${marker.visualTargetId}`,
    stepId: stepIdForVisualTarget(marker.visualTargetId),
    visualTargetId: marker.visualTargetId,
    x: marker.x,
    y: marker.y,
    hitSize: HIT_SIZE,
    shape: "after",
  }));

  const targets: InteractiveTarget[] = [
    ...beadTargets,
    ...markerTargets,
    {
      id: "target-centerpiece",
      stepId: stepIdForVisualTarget("centerpiece"),
      visualTargetId: "centerpiece",
      x: 195,
      y: 438,
      hitSize: 52,
      shape: "centerpiece",
    },
    {
      id: "target-crucifix",
      stepId: stepIdForVisualTarget("crucifix"),
      visualTargetId: "crucifix",
      x: 195,
      y: 650,
      hitSize: 72,
      shape: "cross",
    },
  ];

  return {
    viewBox: "0 0 390 700",
    loopCenter: LOOP_CENTER,
    loopRadiusX: LOOP_RADIUS_X,
    loopRadiusY: LOOP_RADIUS_Y,
    loopBottom: { x: 195, y: 385 },
    strandStart: { x: 195, y: 385 },
    centerpieceCenter: { x: 195, y: 438 },
    centerpieceExit: { x: 195, y: 462 },
    openingCordStart: { x: 195, y: 462 },
    openingCordEnd: { x: 195, y: 606 },
    crossAttachment: { x: 195, y: 606 },
    loopBeads,
    openingBeads,
    afterMarkers,
    targets,
  };
}
```

- [ ] **Step 4: Run geometry tests**

Run:

```bash
npx vitest run tests/unit/rosary-geometry.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/rosary-geometry.ts tests/unit/rosary-geometry.test.ts
git commit -m "feat: define connected Rosary geometry"
```

---

### Task 6: Render the accessible wooden Rosary map

**Files:**
- Create: `src/components/rosary-map.ts`
- Create: `src/styles/rosary.css`
- Test: `tests/integration/rosary-map.test.ts`

**Interfaces:**
- Consumes: `ROSARY_SEQUENCE`, `createRosaryGeometry()`.
- Produces: `createRosaryMap(options: RosaryMapOptions): HTMLElement`.
- Produces: `updateRosaryMap(element: HTMLElement, state: RosaryMapState): void`.
- `RosaryMapOptions.onSelect(stepId: string): void`.
- `RosaryMapState` contains `currentStepId` and `completedThroughIndex`.
- Pointer taps are resolved to the nearest geometry target so overlapping 44px hit areas never make a neighboring bead capture the wrong tap.
- Pointer movement greater than 8 CSS pixels is treated as scrolling rather than bead selection.

- [ ] **Step 1: Write failing map interaction tests**

Create `tests/integration/rosary-map.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { createRosaryGeometry } from "../../src/components/rosary-geometry";
import { createRosaryMap, updateRosaryMap } from "../../src/components/rosary-map";

describe("Rosary map", () => {
  it("renders every physical step as a native button with a minimum 44px hit area", () => {
    const map = createRosaryMap({
      onSelect: vi.fn(),
      currentStepId: "crucifix",
      completedThroughIndex: 0,
    });

    const buttons = Array.from(map.querySelectorAll<HTMLButtonElement>("button[data-step-id]"));

    expect(buttons).toHaveLength(66);
    expect(
      buttons.find((button) => button.dataset.stepId === "decade-1-hail-4")?.ariaLabel,
    ).toContain("Hail Mary 4 of 10");
    expect(
      buttons.find((button) => button.dataset.stepId === "decade-5-complete")?.ariaLabel,
    ).toContain("Complete decade 5");

    for (const button of buttons) {
      expect(Number.parseFloat(button.style.width)).toBeGreaterThanOrEqual(44);
      expect(Number.parseFloat(button.style.height)).toBeGreaterThanOrEqual(44);
    }
  });

  it("emits the selected step id", () => {
    const onSelect = vi.fn();
    const map = createRosaryMap({
      onSelect,
      currentStepId: "crucifix",
      completedThroughIndex: 0,
    });

    map
      .querySelector<HTMLButtonElement>('button[data-step-id="decade-2-hail-6"]')
      ?.click();

    expect(onSelect).toHaveBeenCalledWith("decade-2-hail-6");
  });

  it("updates active and completed states without rebuilding the map", () => {
    const map = createRosaryMap({
      onSelect: vi.fn(),
      currentStepId: "crucifix",
      completedThroughIndex: 0,
    });
    const originalButton = map.querySelector<HTMLButtonElement>(
      'button[data-step-id="decade-1-hail-1"]',
    );

    updateRosaryMap(map, {
      currentStepId: "decade-1-hail-1",
      completedThroughIndex: 8,
    });

    expect(
      map.querySelector('[data-step-id="decade-1-hail-1"]')?.getAttribute("aria-current"),
    ).toBe("step");
    expect(map.querySelector('[data-step-id="crucifix"]')?.dataset.status).toBe("complete");
    expect(
      map.querySelector<HTMLButtonElement>('button[data-step-id="decade-1-hail-1"]'),
    ).toBe(originalButton);
  });

  it("renders the connected cord, centerpiece, and cross as one decorative SVG", () => {
    const map = createRosaryMap({
      onSelect: vi.fn(),
      currentStepId: "crucifix",
      completedThroughIndex: 0,
    });

    expect(map.querySelector('[data-part="loop-to-centerpiece-cord"]')).not.toBeNull();
    expect(map.querySelector('[data-part="centerpiece"]')).not.toBeNull();
    expect(map.querySelector('[data-part="opening-cord"]')).not.toBeNull();
    expect(map.querySelector('[data-part="cross"]')).not.toBeNull();
    expect(map.querySelectorAll(".rosary-after-marker")).toHaveLength(5);
  });

  it("resolves a crowded pointer tap to the nearest bead and ignores a drag", () => {
    const onSelect = vi.fn();
    const map = createRosaryMap({
      onSelect,
      currentStepId: "crucifix",
      completedThroughIndex: 0,
    });

    vi.spyOn(map, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 390, 700));
    const target = createRosaryGeometry().targets.find(
      (candidate) => candidate.stepId === "decade-2-hail-3",
    );

    if (!target) {
      throw new Error("Expected crowded-map target");
    }

    map.dispatchEvent(
      new MouseEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        clientX: target.x,
        clientY: target.y,
      }),
    );
    map.dispatchEvent(
      new MouseEvent("pointerup", {
        bubbles: true,
        cancelable: true,
        clientX: target.x,
        clientY: target.y,
      }),
    );

    expect(onSelect).toHaveBeenCalledWith("decade-2-hail-3");

    onSelect.mockClear();
    map.dispatchEvent(
      new MouseEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        clientX: 195,
        clientY: 385,
      }),
    );
    map.dispatchEvent(
      new MouseEvent("pointerup", {
        bubbles: true,
        cancelable: true,
        clientX: 195,
        clientY: 410,
      }),
    );

    expect(onSelect).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run and confirm missing-module failure**

Run:

```bash
npx vitest run tests/integration/rosary-map.test.ts
```

Expected: FAIL because `rosary-map.ts` does not exist.

- [ ] **Step 3: Implement the map component**

Create `src/components/rosary-map.ts`:

```ts
import { ROSARY_SEQUENCE, getStepById } from "../data/rosary-sequence";
import { createRosaryGeometry, type InteractiveTarget } from "./rosary-geometry";
import "../styles/rosary.css";

export interface RosaryMapState {
  readonly currentStepId: string;
  readonly completedThroughIndex: number;
}

export interface RosaryMapOptions extends RosaryMapState {
  readonly onSelect: (stepId: string) => void;
}

function targetLabel(target: InteractiveTarget): string {
  const step = getStepById(target.stepId);

  if (!step) {
    throw new Error(`Unknown step for target: ${target.stepId}`);
  }

  return `${step.location}. ${step.label}. ${step.repetition}`;
}

function visibleStatus(stepId: string, state: RosaryMapState): "current" | "complete" | "upcoming" {
  const index = ROSARY_SEQUENCE.findIndex((step) => step.id === stepId);

  if (stepId === state.currentStepId) {
    return "current";
  }

  return index >= 0 && index <= state.completedThroughIndex ? "complete" : "upcoming";
}

function renderDecorativeSvg(): string {
  const geometry = createRosaryGeometry();

  const loopBeads = geometry.loopBeads
    .map(
      (bead) => `
        <circle
          class="rosary-bead rosary-bead--${bead.size}"
          data-visual-target="${bead.visualTargetId}"
          cx="${bead.x}"
          cy="${bead.y}"
          r="${bead.radius}"
        />
      `,
    )
    .join("");

  const openingBeads = geometry.openingBeads
    .map(
      (bead) => `
        <circle
          class="rosary-bead rosary-bead--${bead.size}"
          data-visual-target="${bead.visualTargetId}"
          cx="${bead.x}"
          cy="${bead.y}"
          r="${bead.radius}"
        />
      `,
    )
    .join("");

  const afterMarkers = geometry.afterMarkers
    .map(
      (marker) => `
        <g
          class="rosary-after-marker"
          data-visual-target="${marker.visualTargetId}"
          transform="translate(${marker.x} ${marker.y})"
        >
          <circle r="${marker.radius}" />
          <path d="M-3.5 0H3.5M0-3.5V3.5" />
        </g>
      `,
    )
    .join("");

  return `
    <svg
      class="rosary-illustration"
      viewBox="${geometry.viewBox}"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="wood-small" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#c18a58" />
          <stop offset="58%" stop-color="#865330" />
          <stop offset="100%" stop-color="#55331f" />
        </radialGradient>
        <radialGradient id="wood-large" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stop-color="#b87947" />
          <stop offset="60%" stop-color="#704528" />
          <stop offset="100%" stop-color="#472a1a" />
        </radialGradient>
        <linearGradient id="cross-wood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#9d6840" />
          <stop offset="50%" stop-color="#70452a" />
          <stop offset="100%" stop-color="#482a19" />
        </linearGradient>
        <filter id="wood-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="2.2"
            flood-color="#25180f"
            flood-opacity="0.28"
          />
        </filter>
      </defs>

      <ellipse
        class="rosary-cord"
        cx="${geometry.loopCenter.x}"
        cy="${geometry.loopCenter.y}"
        rx="${geometry.loopRadiusX}"
        ry="${geometry.loopRadiusY}"
      />
      <line
        class="rosary-cord"
        data-part="loop-to-centerpiece-cord"
        x1="195"
        y1="385"
        x2="195"
        y2="414"
      />
      <ellipse
        class="rosary-centerpiece"
        data-part="centerpiece"
        cx="195"
        cy="438"
        rx="18"
        ry="24"
      />
      <path class="rosary-centerpiece-mark" d="M195 423V453M184 438H206" />
      <line
        class="rosary-cord"
        data-part="opening-cord"
        x1="195"
        y1="462"
        x2="195"
        y2="606"
      />
      ${loopBeads}
      ${openingBeads}
      ${afterMarkers}
      <g class="rosary-cross" data-part="cross">
        <rect x="188" y="606" width="14" height="76" rx="3.5" />
        <rect x="165" y="625" width="60" height="13" rx="3.5" />
        <path d="M192 610H198V678H192Z" />
      </g>
    </svg>
  `;
}

function nearestTargetAtPoint(
  targets: readonly InteractiveTarget[],
  rect: DOMRect,
  clientX: number,
  clientY: number,
): InteractiveTarget | undefined {
  let nearest: { target: InteractiveTarget; distance: number } | undefined;

  for (const target of targets) {
    const targetX = rect.left + (target.x / 390) * rect.width;
    const targetY = rect.top + (target.y / 700) * rect.height;
    const distance = Math.hypot(clientX - targetX, clientY - targetY);

    if (!nearest || distance < nearest.distance) {
      nearest = { target, distance };
    }
  }

  return nearest && nearest.distance <= nearest.target.hitSize / 2
    ? nearest.target
    : undefined;
}

export function createRosaryMap(options: RosaryMapOptions): HTMLElement {
  const geometry = createRosaryGeometry();
  const map = document.createElement("section");
  map.className = "rosary-map";
  map.setAttribute("aria-label", "Clickable Rosary");
  map.innerHTML = `
    ${renderDecorativeSvg()}
    <div class="rosary-targets" aria-label="Rosary beads and prayer transitions"></div>
  `;

  const targets = map.querySelector<HTMLElement>(".rosary-targets");

  if (!targets) {
    throw new Error("Rosary target layer was not created");
  }

  for (const target of geometry.targets) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `rosary-target rosary-target--${target.shape}`;
    button.dataset.stepId = target.stepId;
    button.dataset.visualTarget = target.visualTargetId;
    button.ariaLabel = targetLabel(target);
    button.style.left = `${(target.x / 390) * 100}%`;
    button.style.top = `${(target.y / 700) * 100}%`;
    button.style.width = `${target.hitSize}px`;
    button.style.height = `${target.hitSize}px`;
    button.addEventListener("click", () => options.onSelect(target.stepId));
    targets.append(button);
  }

  let pointerStart: { readonly x: number; readonly y: number } | undefined;
  let suppressSyntheticClick = false;
  let suppressTimer: number | undefined;

  map.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0) {
        return;
      }

      pointerStart = { x: event.clientX, y: event.clientY };
    },
    { capture: true },
  );

  map.addEventListener(
    "pointerup",
    (event) => {
      if (!pointerStart) {
        return;
      }

      const movement = Math.hypot(
        event.clientX - pointerStart.x,
        event.clientY - pointerStart.y,
      );
      pointerStart = undefined;

      if (movement > 8) {
        return;
      }

      const nearest = nearestTargetAtPoint(
        geometry.targets,
        map.getBoundingClientRect(),
        event.clientX,
        event.clientY,
      );

      if (!nearest) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      suppressSyntheticClick = true;
      if (suppressTimer !== undefined) {
        window.clearTimeout(suppressTimer);
      }
      suppressTimer = window.setTimeout(() => {
        suppressSyntheticClick = false;
      }, 500);
      options.onSelect(nearest.stepId);
    },
    { capture: true },
  );

  map.addEventListener(
    "pointercancel",
    () => {
      pointerStart = undefined;
    },
    { capture: true },
  );

  map.addEventListener(
    "click",
    (event) => {
      if (!suppressSyntheticClick) {
        return;
      }

      suppressSyntheticClick = false;
      event.preventDefault();
      event.stopPropagation();
    },
    { capture: true },
  );

  updateRosaryMap(map, options);
  return map;
}

export function updateRosaryMap(element: HTMLElement, state: RosaryMapState): void {
  for (const button of element.querySelectorAll<HTMLButtonElement>("button[data-step-id]")) {
    const stepId = button.dataset.stepId;

    if (!stepId) {
      continue;
    }

    const status = visibleStatus(stepId, state);
    button.dataset.status = status;

    if (status === "current") {
      button.setAttribute("aria-current", "step");
    } else {
      button.removeAttribute("aria-current");
    }
  }
}
```

- [ ] **Step 4: Style the map as a complete wooden object**

Create `src/styles/rosary.css`:

```css
.rosary-map {
  position: relative;
  width: min(100%, 24rem);
  aspect-ratio: 390 / 700;
  margin-inline: auto;
  overflow: visible;
  isolation: isolate;
}

.rosary-illustration,
.rosary-targets {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.rosary-illustration {
  display: block;
  overflow: visible;
}

.rosary-cord {
  fill: none;
  stroke: var(--color-cord);
  stroke-width: 4;
  stroke-linecap: round;
}

.rosary-bead {
  filter: url("#wood-shadow");
  stroke: #d1a174;
  stroke-width: 1.1;
}

.rosary-bead--small {
  fill: url("#wood-small");
}

.rosary-bead--large {
  fill: url("#wood-large");
}

.rosary-centerpiece {
  fill: url("#wood-large");
  stroke: #d1a174;
  stroke-width: 1.2;
  filter: url("#wood-shadow");
}

.rosary-centerpiece-mark {
  fill: none;
  stroke: #e1bb93;
  stroke-width: 2.2;
  stroke-linecap: round;
}

.rosary-after-marker circle {
  fill: #f7edcf;
  stroke: var(--color-gold);
  stroke-width: 1.5;
}

.rosary-after-marker path {
  fill: none;
  stroke: #72551f;
  stroke-width: 1.5;
  stroke-linecap: round;
}

.rosary-cross {
  fill: url("#cross-wood");
  filter: url("#wood-shadow");
}

.rosary-cross path {
  fill: #b27b4f;
  opacity: 0.35;
}

.rosary-targets {
  pointer-events: none;
}

.rosary-target {
  position: absolute;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 999px;
  color: transparent;
  background: transparent;
  transform: translate(-50%, -50%);
  pointer-events: auto;
}

.rosary-target::after {
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-radius: 999px;
  content: "";
}

.rosary-target[data-status="current"]::after {
  border-color: var(--color-focus);
  box-shadow:
    0 0 0 3px var(--color-surface),
    0 0 0 6px var(--color-focus);
}

.rosary-target[data-status="complete"]::before {
  position: absolute;
  right: 2px;
  bottom: 2px;
  display: grid;
  width: 1rem;
  height: 1rem;
  place-items: center;
  border-radius: 999px;
  color: white;
  background: var(--color-complete);
  content: "✓";
  font-size: 0.7rem;
  font-weight: 800;
}

.rosary-target--after::after {
  width: 16px;
  height: 16px;
}

.rosary-target--cross,
.rosary-target--centerpiece {
  border-radius: 0.75rem;
}

@media (max-width: 380px) {
  .rosary-map {
    width: min(100%, 21.5rem);
  }
}
```

- [ ] **Step 5: Run map tests**

Run:

```bash
npx vitest run tests/integration/rosary-map.test.ts
npm run typecheck
npm run lint
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/rosary-map.ts src/styles/rosary.css tests/integration/rosary-map.test.ts
git commit -m "feat: render accessible wooden Rosary map"
```

---

### Task 7: Build the prayer sheet, mystery selector, and progress header

**Files:**
- Create: `src/components/prayer-sheet.ts`
- Create: `src/components/mystery-selector.ts`
- Create: `src/components/progress-header.ts`
- Create: `src/styles/prayer-sheet.css`
- Test: `tests/integration/prayer-sheet.test.ts`

**Interfaces:**
- Produces: `PrayerSheetViewModel`.
- Produces: `buildPrayerSheetViewModel(step: RosaryStep, mysterySet: MysterySetId): PrayerSheetViewModel`.
- Produces: `createPrayerSheet(options: PrayerSheetOptions): HTMLElement`.
- Produces: `updatePrayerSheet(element: HTMLElement, viewModel: PrayerSheetViewModel): void`.
- Produces: `createMysterySelector(options: MysterySelectorOptions): HTMLSelectElement`.
- Produces: `createProgressHeader(): HTMLElement`.
- Produces: `updateProgressHeader(element: HTMLElement, currentIndex: number, total: number): void`.

- [ ] **Step 1: Write failing prayer-sheet tests**

Create `tests/integration/prayer-sheet.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { getStepById } from "../../src/data/rosary-sequence";
import {
  buildPrayerSheetViewModel,
  createPrayerSheet,
} from "../../src/components/prayer-sheet";

describe("prayer sheet", () => {
  it("renders the complete prayer, exact count, and mystery context", () => {
    const step = getStepById("decade-1-our-father");

    if (!step) {
      throw new Error("Expected sequence step");
    }

    const viewModel = buildPrayerSheetViewModel(step, "joyful");
    const sheet = createPrayerSheet({
      viewModel,
      canGoPrevious: true,
      canGoNext: true,
      onPrevious: vi.fn(),
      onNext: vi.fn(),
    });

    expect(sheet.textContent).toContain("Large bead for decade 1");
    expect(sheet.textContent).toContain("Announce the mystery, then say one Our Father.");
    expect(sheet.textContent).toContain("The Annunciation");
    expect(sheet.textContent).toContain(
      "Our Father, who art in heaven, hallowed be Thy name.",
    );
    expect(sheet.textContent).not.toContain("…");
    expect(sheet.querySelector("[data-announcement]")?.textContent).toBe(
      "Begin decade 1. Large bead for decade 1.",
    );
  });

  it("renders multiple prayers in the correct order", () => {
    const step = getStepById("decade-2-complete");

    if (!step) {
      throw new Error("Expected sequence step");
    }

    const viewModel = buildPrayerSheetViewModel(step, "sorrowful");
    expect(viewModel.prayers.map((prayer) => prayer.title)).toEqual([
      "Glory Be",
      "Fatima Prayer",
    ]);
  });
});
```

- [ ] **Step 2: Run and confirm missing-module failure**

Run:

```bash
npx vitest run tests/integration/prayer-sheet.test.ts
```

Expected: FAIL because `prayer-sheet.ts` does not exist.

- [ ] **Step 3: Implement the prayer sheet view model and component**

Create `src/components/prayer-sheet.ts`:

```ts
import { MYSTERIES } from "../data/mysteries";
import { PRAYERS } from "../data/prayers";
import type { MysterySetId, Prayer } from "../domain/prayer-step";
import type { RosaryStep } from "../domain/sequence";
import "../styles/prayer-sheet.css";

export interface PrayerSheetViewModel {
  readonly stepId: string;
  readonly label: string;
  readonly location: string;
  readonly repetition: string;
  readonly prayers: readonly Prayer[];
  readonly mystery?: {
    readonly set: MysterySetId;
    readonly ordinal: number;
    readonly name: string;
    readonly meditation: string;
  };
}

export interface PrayerSheetOptions {
  readonly viewModel: PrayerSheetViewModel;
  readonly canGoPrevious: boolean;
  readonly canGoNext: boolean;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
}

export function buildPrayerSheetViewModel(
  step: RosaryStep,
  mysterySet: MysterySetId,
): PrayerSheetViewModel {
  const mystery =
    step.mysteryIndex === undefined
      ? undefined
      : MYSTERIES[mysterySet][step.mysteryIndex];

  if (step.mysteryIndex !== undefined && !mystery) {
    throw new RangeError(`Missing mystery ${step.mysteryIndex} for ${mysterySet}`);
  }

  return {
    stepId: step.id,
    label: step.label,
    location: step.location,
    repetition: step.repetition,
    prayers: step.prayerIds.map((prayerId) => PRAYERS[prayerId]),
    mystery:
      mystery && step.mysteryIndex !== undefined
        ? {
            set: mysterySet,
            ordinal: step.mysteryIndex + 1,
            name: mystery.name,
            meditation: mystery.meditation,
          }
        : undefined,
  };
}

function prayerMarkup(prayer: Prayer): string {
  return `
    <article class="prayer-copy">
      <h3>${prayer.title}</h3>
      <p>${prayer.text.replaceAll("\n", "<br />")}</p>
    </article>
  `;
}

export function createPrayerSheet(options: PrayerSheetOptions): HTMLElement {
  const sheet = document.createElement("section");
  sheet.className = "prayer-sheet";
  sheet.innerHTML = `
    <p class="sr-only" data-announcement aria-live="polite" aria-atomic="true"></p>
    <div class="prayer-sheet__handle" aria-hidden="true"></div>
    <div class="prayer-sheet__content"></div>
    <div class="prayer-sheet__actions">
      <button type="button" data-action="previous">Previous</button>
      <button type="button" data-action="next">Next bead</button>
    </div>
  `;

  sheet
    .querySelector<HTMLButtonElement>('[data-action="previous"]')
    ?.addEventListener("click", options.onPrevious);
  sheet
    .querySelector<HTMLButtonElement>('[data-action="next"]')
    ?.addEventListener("click", options.onNext);

  updatePrayerSheet(sheet, options.viewModel);
  updatePrayerSheetNavigation(sheet, options.canGoPrevious, options.canGoNext);
  return sheet;
}

export function updatePrayerSheet(
  element: HTMLElement,
  viewModel: PrayerSheetViewModel,
): void {
  const content = element.querySelector<HTMLElement>(".prayer-sheet__content");
  const announcement = element.querySelector<HTMLElement>("[data-announcement]");

  if (!content || !announcement) {
    throw new Error("Prayer sheet content or announcement element is missing");
  }

  announcement.textContent = `${viewModel.label}. ${viewModel.location}.`;
  content.innerHTML = `
    <p class="prayer-sheet__location">${viewModel.location}</p>
    <h2>${viewModel.label}</h2>
    <p class="prayer-sheet__repetition">${viewModel.repetition}</p>
    ${
      viewModel.mystery
        ? `
          <aside class="mystery-card">
            <p>${viewModel.mystery.set} mystery ${viewModel.mystery.ordinal}</p>
            <h3>${viewModel.mystery.name}</h3>
            <p>${viewModel.mystery.meditation}</p>
          </aside>
        `
        : ""
    }
    <div class="prayer-list">
      ${viewModel.prayers.map(prayerMarkup).join("")}
    </div>
  `;
  element.dataset.stepId = viewModel.stepId;
}

export function updatePrayerSheetNavigation(
  element: HTMLElement,
  canGoPrevious: boolean,
  canGoNext: boolean,
): void {
  const previous = element.querySelector<HTMLButtonElement>('[data-action="previous"]');
  const next = element.querySelector<HTMLButtonElement>('[data-action="next"]');

  if (!previous || !next) {
    throw new Error("Prayer sheet navigation controls are missing");
  }

  previous.disabled = !canGoPrevious;
  next.disabled = !canGoNext;
  next.textContent = canGoNext ? "Next bead" : "Rosary complete";
}
```

- [ ] **Step 4: Implement selector and progress components**

Create `src/components/mystery-selector.ts`:

```ts
import type { MysterySelectionMode, MysterySetId } from "../domain/prayer-step";

export interface MysterySelectorOptions {
  readonly mysterySet: MysterySetId;
  readonly mode: MysterySelectionMode;
  readonly onSelect: (mysterySet: MysterySetId) => void;
  readonly onAutomatic: () => void;
}

const LABELS: Readonly<Record<MysterySetId, string>> = {
  joyful: "Joyful Mysteries",
  sorrowful: "Sorrowful Mysteries",
  glorious: "Glorious Mysteries",
  luminous: "Luminous Mysteries",
};

export function createMysterySelector(options: MysterySelectorOptions): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "mystery-selector";
  wrapper.innerHTML = `
    <label for="mystery-set">Mysteries</label>
    <select id="mystery-set">
      ${Object.entries(LABELS)
        .map(([value, label]) => `<option value="${value}">${label}</option>`)
        .join("")}
    </select>
    <button type="button" data-action="automatic">Use today</button>
  `;

  const select = wrapper.querySelector<HTMLSelectElement>("#mystery-set");
  const automatic = wrapper.querySelector<HTMLButtonElement>('[data-action="automatic"]');

  if (!select || !automatic) {
    throw new Error("Mystery selector controls are missing");
  }

  select.value = options.mysterySet;
  select.addEventListener("change", () => options.onSelect(select.value as MysterySetId));
  automatic.addEventListener("click", options.onAutomatic);
  automatic.hidden = options.mode === "automatic";
  return wrapper;
}
```

Create `src/components/progress-header.ts`:

```ts
export function createProgressHeader(): HTMLElement {
  const header = document.createElement("header");
  header.className = "progress-header";
  header.innerHTML = `
    <div>
      <p class="progress-header__eyebrow">Interactive prayer guide</p>
      <h1>Rosary</h1>
    </div>
    <p class="progress-header__count" aria-live="polite"></p>
    <div
      class="progress-header__track"
      role="progressbar"
      aria-label="Rosary progress"
      aria-valuemin="1"
    >
      <span></span>
    </div>
  `;
  return header;
}

export function updateProgressHeader(
  element: HTMLElement,
  currentIndex: number,
  total: number,
): void {
  const count = element.querySelector<HTMLElement>(".progress-header__count");
  const track = element.querySelector<HTMLElement>('[role="progressbar"]');
  const fill = track?.querySelector<HTMLElement>("span");

  if (!count || !track || !fill) {
    throw new Error("Progress header elements are missing");
  }

  const position = currentIndex + 1;
  count.textContent = `Step ${position} of ${total}`;
  track.setAttribute("aria-valuemax", String(total));
  track.setAttribute("aria-valuenow", String(position));
  fill.style.width = `${(position / total) * 100}%`;
}
```

- [ ] **Step 5: Style the prayer sheet for readable iPhone text**

Create `src/styles/prayer-sheet.css`:

```css
.prayer-sheet {
  position: relative;
  z-index: 4;
  width: 100%;
  max-height: min(48vh, 34rem);
  padding: 0.5rem 1rem calc(1rem + var(--safe-bottom));
  overflow-y: auto;
  border: 1px solid rgb(79 48 31 / 14%);
  border-radius: var(--radius-sheet) var(--radius-sheet) 0 0;
  background: rgb(255 253 248 / 97%);
  box-shadow: 0 -1rem 2.5rem rgb(49 34 23 / 16%);
  overscroll-behavior: contain;
}

.prayer-sheet__handle {
  width: 2.75rem;
  height: 0.3rem;
  margin: 0.15rem auto 0.85rem;
  border-radius: 999px;
  background: rgb(111 98 88 / 30%);
}

.prayer-sheet__location,
.prayer-sheet__repetition,
.mystery-card > p:first-child {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.78rem;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.prayer-sheet h2,
.prayer-copy h3,
.mystery-card h3 {
  font-family: Georgia, "Times New Roman", serif;
}

.prayer-sheet h2 {
  margin: 0.35rem 0;
  font-size: clamp(1.55rem, 7vw, 2.25rem);
  line-height: 1.05;
}

.prayer-sheet__repetition {
  letter-spacing: 0;
  text-transform: none;
}

.mystery-card {
  margin: 1rem 0;
  padding: 0.9rem 1rem;
  border-left: 0.25rem solid var(--color-gold);
  border-radius: 0.8rem;
  background: var(--color-gold-soft);
}

.mystery-card h3 {
  margin: 0.25rem 0 0.35rem;
}

.mystery-card p:last-child {
  margin: 0;
  line-height: 1.5;
}

.prayer-copy {
  padding-block: 0.85rem;
  border-top: 1px solid rgb(111 98 88 / 18%);
}

.prayer-copy h3 {
  margin: 0 0 0.45rem;
  font-size: 1.3rem;
}

.prayer-copy p {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.05rem, 4.6vw, 1.2rem);
  line-height: 1.65;
}

.prayer-sheet__actions {
  position: sticky;
  bottom: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  padding-top: 0.75rem;
  background: linear-gradient(transparent, var(--color-surface) 22%);
}

.prayer-sheet__actions button,
.mystery-selector button,
.mystery-selector select {
  min-height: 44px;
  border-radius: 0.8rem;
}

.prayer-sheet__actions button {
  border: 1px solid rgb(79 48 31 / 18%);
  color: var(--color-ink);
  background: #f0ebe3;
  font-weight: 750;
}

.prayer-sheet__actions button:last-child {
  color: white;
  background: var(--color-wood-dark);
}

.prayer-sheet__actions button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (min-width: 800px) {
  .prayer-sheet {
    max-height: calc(100vh - 3rem);
    border-radius: var(--radius-sheet);
  }
}
```

- [ ] **Step 6: Run component tests**

Run:

```bash
npx vitest run tests/integration/prayer-sheet.test.ts
npm run typecheck
npm run lint
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/prayer-sheet.ts src/components/mystery-selector.ts src/components/progress-header.ts src/styles/prayer-sheet.css tests/integration/prayer-sheet.test.ts
git commit -m "feat: add prayer and mystery controls"
```

---

### Task 8: Orchestrate direct bead selection, sequential navigation, and saved progress

**Files:**
- Create: `src/app/app.ts`
- Modify: `src/main.ts`
- Modify: `src/styles/base.css`
- Test: `tests/integration/app-navigation.test.ts`

**Interfaces:**
- Consumes: state, persistence, canonical sequence, Rosary map, prayer sheet, mystery selector, progress header.
- Produces: `createRosaryApp(root: HTMLElement, options?: RosaryAppOptions): RosaryApp`.
- `RosaryApp.destroy(): void`.
- Optional dependencies: `date`, `storage`.

- [ ] **Step 1: Write failing end-to-end DOM integration tests**

Create `tests/integration/app-navigation.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { APP_STORAGE_KEY } from "../../src/app/config";
import { createRosaryApp } from "../../src/app/app";

describe("Rosary application navigation", () => {
  beforeEach(() => {
    document.body.innerHTML = '<main id="app"></main>';
    localStorage.clear();
  });

  it("starts at the crucifix and advances in canonical order", () => {
    const root = document.querySelector<HTMLElement>("#app");

    if (!root) {
      throw new Error("Missing test root");
    }

    createRosaryApp(root, {
      date: new Date("2026-08-03T12:00:00"),
      storage: localStorage,
    });

    expect(root.textContent).toContain("Begin the Rosary");
    root.querySelector<HTMLButtonElement>('[data-action="next"]')?.click();
    expect(root.textContent).toContain("Opening Our Father");
  });

  it("keeps direct bead selection and next navigation synchronized", () => {
    const root = document.querySelector<HTMLElement>("#app");

    if (!root) {
      throw new Error("Missing test root");
    }

    createRosaryApp(root, {
      date: new Date("2026-08-03T12:00:00"),
      storage: localStorage,
    });

    root.querySelector<HTMLButtonElement>(
      'button[data-step-id="decade-3-hail-7"]',
    )?.click();

    expect(root.textContent).toContain("Small bead 7 in decade 3");
    expect(root.querySelector('[aria-current="step"]')?.getAttribute("data-step-id")).toBe(
      "decade-3-hail-7",
    );

    root.querySelector<HTMLButtonElement>('[data-action="next"]')?.click();
    expect(root.textContent).toContain("Small bead 8 in decade 3");
  });

  it("restores valid persisted progress", () => {
    localStorage.setItem(
      APP_STORAGE_KEY,
      JSON.stringify({
        currentStepId: "decade-4-hail-2",
        mysterySet: "glorious",
        mysterySelectionMode: "manual",
      }),
    );

    const root = document.querySelector<HTMLElement>("#app");

    if (!root) {
      throw new Error("Missing test root");
    }

    createRosaryApp(root, {
      date: new Date("2026-08-03T12:00:00"),
      storage: localStorage,
    });

    expect(root.textContent).toContain("Small bead 2 in decade 4");
    expect(
      root.querySelector<HTMLSelectElement>("#mystery-set")?.value,
    ).toBe("glorious");
  });

  it("updates the visible mystery when the selector changes", () => {
    const root = document.querySelector<HTMLElement>("#app");

    if (!root) {
      throw new Error("Missing test root");
    }

    createRosaryApp(root, {
      date: new Date("2026-08-03T12:00:00"),
      storage: localStorage,
    });

    root
      .querySelector<HTMLButtonElement>('button[data-step-id="decade-1-our-father"]')
      ?.click();

    const select = root.querySelector<HTMLSelectElement>("#mystery-set");

    if (!select) {
      throw new Error("Missing mystery selector");
    }

    select.value = "sorrowful";
    select.dispatchEvent(new Event("change"));

    expect(root.textContent).toContain("The Agony in the Garden");
  });
});
```

- [ ] **Step 2: Run and confirm missing-module failure**

Run:

```bash
npx vitest run tests/integration/app-navigation.test.ts
```

Expected: FAIL because `src/app/app.ts` does not exist.

- [ ] **Step 3: Implement the application controller**

Create `src/app/app.ts`:

```ts
import {
  ROSARY_SEQUENCE,
  getNextStep,
  getPreviousStep,
  getStepById,
  getStepIndex,
} from "../data/rosary-sequence";
import { createMysterySelector } from "../components/mystery-selector";
import {
  buildPrayerSheetViewModel,
  createPrayerSheet,
  updatePrayerSheet,
  updatePrayerSheetNavigation,
} from "../components/prayer-sheet";
import {
  createProgressHeader,
  updateProgressHeader,
} from "../components/progress-header";
import {
  createRosaryMap,
  updateRosaryMap,
} from "../components/rosary-map";
import { loadState, saveState } from "./persistence";
import {
  selectMysterySet,
  selectStep,
  useAutomaticMysteries,
  type AppState,
} from "./state";

export interface RosaryAppOptions {
  readonly date?: Date;
  readonly storage?: Storage;
}

export interface RosaryApp {
  destroy(): void;
}

export function createRosaryApp(
  root: HTMLElement,
  options: RosaryAppOptions = {},
): RosaryApp {
  const date = options.date ?? new Date();
  const storage = options.storage ?? window.localStorage;
  let state: AppState = loadState(storage, date);

  root.className = "rosary-app";
  root.innerHTML = `
    <section class="rosary-stage">
      <div class="rosary-stage__header"></div>
      <div class="rosary-stage__selector"></div>
      <div class="rosary-stage__map"></div>
    </section>
    <aside class="rosary-stage__sheet"></aside>
  `;

  const headerSlot = root.querySelector<HTMLElement>(".rosary-stage__header");
  const selectorSlot = root.querySelector<HTMLElement>(".rosary-stage__selector");
  const mapSlot = root.querySelector<HTMLElement>(".rosary-stage__map");
  const sheetSlot = root.querySelector<HTMLElement>(".rosary-stage__sheet");

  if (!headerSlot || !selectorSlot || !mapSlot || !sheetSlot) {
    throw new Error("Rosary application slots are missing");
  }

  const progressHeader = createProgressHeader();
  headerSlot.append(progressHeader);

  const selectCurrentStep = (stepId: string): void => {
    state = selectStep(state, stepId);
    saveState(storage, state);
    render();
  };

  const rosaryMap = createRosaryMap({
    onSelect: selectCurrentStep,
    currentStepId: state.currentStepId,
    completedThroughIndex: getStepIndex(state.currentStepId),
  });
  mapSlot.append(rosaryMap);

  const currentStep = getStepById(state.currentStepId);

  if (!currentStep) {
    throw new Error(`Missing current Rosary step: ${state.currentStepId}`);
  }

  const prayerSheet = createPrayerSheet({
    viewModel: buildPrayerSheetViewModel(currentStep, state.mysterySet),
    canGoPrevious: Boolean(getPreviousStep(state.currentStepId)),
    canGoNext: Boolean(getNextStep(state.currentStepId)),
    onPrevious: () => {
      const previous = getPreviousStep(state.currentStepId);
      if (previous) {
        selectCurrentStep(previous.id);
      }
    },
    onNext: () => {
      const next = getNextStep(state.currentStepId);
      if (next) {
        selectCurrentStep(next.id);
      }
    },
  });
  sheetSlot.append(prayerSheet);

  function renderSelector(): void {
    selectorSlot.replaceChildren(
      createMysterySelector({
        mysterySet: state.mysterySet,
        mode: state.mysterySelectionMode,
        onSelect: (mysterySet) => {
          state = selectMysterySet(state, mysterySet);
          saveState(storage, state);
          render();
        },
        onAutomatic: () => {
          state = useAutomaticMysteries(state, date);
          saveState(storage, state);
          render();
        },
      }),
    );
  }

  function render(): void {
    const step = getStepById(state.currentStepId);

    if (!step) {
      throw new Error(`Missing current Rosary step: ${state.currentStepId}`);
    }

    const currentIndex = getStepIndex(state.currentStepId);
    updateProgressHeader(progressHeader, currentIndex, ROSARY_SEQUENCE.length);
    updateRosaryMap(rosaryMap, {
      currentStepId: state.currentStepId,
      completedThroughIndex: currentIndex,
    });
    updatePrayerSheet(prayerSheet, buildPrayerSheetViewModel(step, state.mysterySet));
    updatePrayerSheetNavigation(
      prayerSheet,
      Boolean(getPreviousStep(state.currentStepId)),
      Boolean(getNextStep(state.currentStepId)),
    );
    renderSelector();
  }

  render();

  return {
    destroy() {
      root.replaceChildren();
      root.className = "";
    },
  };
}
```

- [ ] **Step 4: Wire the real entry point**

Replace `src/main.ts`:

```ts
import { createRosaryApp } from "./app/app";
import "./styles/base.css";
import "./styles/prayer-sheet.css";
import "./styles/rosary.css";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Missing #app root element");
}

createRosaryApp(root);
```

- [ ] **Step 5: Add app-level layout styles**

Append to `src/styles/base.css`:

```css
.rosary-app {
  min-height: 100svh;
  padding-top: var(--safe-top);
}

.rosary-stage {
  display: grid;
  min-height: 58svh;
  grid-template-rows: auto auto minmax(0, 1fr);
  padding: 0.75rem 0.75rem 0;
}

.progress-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.3rem 1rem;
  align-items: end;
}

.progress-header__eyebrow {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.progress-header h1 {
  margin: 0.1rem 0 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(2rem, 10vw, 3.4rem);
  line-height: 0.95;
}

.progress-header__count {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.8rem;
  font-weight: 750;
}

.progress-header__track {
  grid-column: 1 / -1;
  height: 0.25rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgb(111 98 88 / 18%);
}

.progress-header__track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--color-gold);
}

.mystery-selector {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.65rem;
}

.mystery-selector label {
  font-size: 0.8rem;
  font-weight: 750;
}

.mystery-selector select,
.mystery-selector button {
  min-width: 0;
  border: 1px solid rgb(79 48 31 / 18%);
  color: var(--color-ink);
  background: rgb(255 253 248 / 82%);
}

.mystery-selector select {
  width: 100%;
  padding-inline: 0.75rem;
}

.mystery-selector button {
  padding-inline: 0.75rem;
  font-weight: 750;
}

.rosary-stage__map {
  display: grid;
  min-height: 0;
  place-items: center;
}

@media (min-width: 800px) {
  .rosary-app {
    display: grid;
    grid-template-columns: minmax(28rem, 1.15fr) minmax(22rem, 0.85fr);
    gap: 1rem;
    max-width: 80rem;
    margin-inline: auto;
    padding: max(1rem, var(--safe-top)) 1rem max(1rem, var(--safe-bottom));
  }

  .rosary-stage {
    min-height: calc(100vh - 2rem);
    border: 1px solid rgb(79 48 31 / 12%);
    border-radius: 1.75rem;
    background: rgb(255 253 248 / 42%);
    box-shadow: var(--shadow-card);
  }

  .rosary-stage__sheet {
    align-self: stretch;
  }
}
```

- [ ] **Step 6: Run app integration tests**

Run:

```bash
npx vitest run tests/integration/app-navigation.test.ts
npm run test:unit
npm run typecheck
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/app/app.ts src/main.ts src/styles/base.css tests/integration/app-navigation.test.ts
git commit -m "feat: connect Rosary navigation and progress"
```

---

### Task 9: Verify and refine the iPhone-first visual layout

**Files:**
- Create: `tests/e2e/rosary-flow.spec.ts`
- Create: `tests/e2e/mobile-layout.spec.ts`
- Create: `tests/e2e/accessibility.spec.ts`
- Modify: `src/styles/base.css`
- Modify: `src/styles/prayer-sheet.css`
- Modify: `src/styles/rosary.css`
- Create after tests run: Playwright snapshot files under `tests/e2e/*-snapshots/`

**Interfaces:**
- Tests the public page at `/rosary/`.
- Uses exact accessible names and `data-part` hooks already defined.
- Produces reviewed screenshots for fresh start, mid-decade, after-decade, final prayer, smallest iPhone, larger iPhone, and desktop.

- [ ] **Step 1: Install Playwright browsers**

Run:

```bash
npx playwright install chromium webkit
```

Expected: Chromium and WebKit install successfully.

- [ ] **Step 2: Write the complete prayer-flow browser test**

Create `tests/e2e/rosary-flow.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("moves from the crucifix to the opening Our Father", async ({ page }) => {
  await page.goto("./");

  await expect(page.getByRole("heading", { name: "Begin the Rosary" })).toBeVisible();
  await expect(page.getByText("Apostles’ Creed")).toBeVisible();

  await page.getByRole("button", { name: "Next bead" }).click();

  await expect(page.getByRole("heading", { name: "Opening Our Father" })).toBeVisible();
  await expect(page.getByText("Large bead above the crucifix")).toBeVisible();
});

test("supports direct bead selection and exact prayer count", async ({ page }) => {
  await page.goto("./");

  await page
    .getByRole("button", {
      name: /Small bead 7 in decade 3\. Hail Mary 7 of 10\./,
    })
    .click();

  await expect(page.getByText("Small bead 7 in decade 3")).toBeVisible();
  await expect(page.getByText("This is 7 of 10.")).toBeVisible();
  await expect(page.getByText("Holy Mary, Mother of God")).toBeVisible();
});

test("changes the mystery set without losing the selected bead", async ({ page }) => {
  await page.goto("./");
  await page
    .getByRole("button", { name: /Large bead for decade 1\. Begin decade 1\./ })
    .click();

  await page.getByLabel("Mysteries").selectOption("sorrowful");

  await expect(page.getByText("The Agony in the Garden")).toBeVisible();
  await expect(page.getByText("Large bead for decade 1")).toBeVisible();
});

test("supports keyboard focus and activation on physical Rosary targets", async ({ page }) => {
  await page.goto("./");

  const target = page.getByRole("button", {
    name: /Small bead 1 in decade 1\. Hail Mary 1 of 10\./,
  });
  await target.focus();
  await expect(target).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page.getByText("Small bead 1 in decade 1")).toBeVisible();
  await expect(target).toHaveAttribute("aria-current", "step");
});
```

- [ ] **Step 3: Write mobile geometry, overflow, target-size, and visual tests**

Create `tests/e2e/mobile-layout.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("has no horizontal overflow and keeps every target at least 44px", async ({ page }) => {
  await page.goto("./");

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);

  const sizes = await page.locator("button[data-step-id]").evaluateAll((buttons) =>
    buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }),
  );

  for (const size of sizes) {
    expect(size.width).toBeGreaterThanOrEqual(44);
    expect(size.height).toBeGreaterThanOrEqual(44);
  }
});

test("keeps the strand attached to the crucifix", async ({ page }) => {
  await page.goto("./");

  const openingCord = page.locator('[data-part="opening-cord"]');
  const cross = page.locator('[data-part="cross"]');
  const cordBox = await openingCord.boundingBox();
  const crossBox = await cross.boundingBox();

  expect(cordBox).not.toBeNull();
  expect(crossBox).not.toBeNull();

  if (!cordBox || !crossBox) {
    throw new Error("Connected Rosary geometry is missing");
  }

  expect(Math.abs(cordBox.y + cordBox.height - crossBox.y)).toBeLessThanOrEqual(2);
});

test("renders the approved Rosary-first start state", async ({ page }) => {
  await page.goto("./");
  await expect(page).toHaveScreenshot("fresh-start.png", {
    fullPage: true,
    animations: "disabled",
  });
});

test("renders a readable mid-decade state", async ({ page }) => {
  await page.goto("./");
  await page
    .getByRole("button", {
      name: /Small bead 5 in decade 2\. Hail Mary 5 of 10\./,
    })
    .click();

  await expect(page).toHaveScreenshot("mid-decade.png", {
    fullPage: true,
    animations: "disabled",
  });
});

test("renders after-decade and final-prayer states", async ({ page }) => {
  await page.goto("./");
  await page
    .getByRole("button", {
      name: /After the tenth Hail Mary of decade 5\. Complete decade 5\./,
    })
    .click();

  await expect(page).toHaveScreenshot("after-fifth-decade.png", {
    fullPage: true,
    animations: "disabled",
  });

  await page.getByRole("button", { name: "Next bead" }).click();
  await expect(page).toHaveScreenshot("final-prayer.png", {
    fullPage: true,
    animations: "disabled",
  });
});

test("keeps prayer text and controls usable at 125 percent root text size", async ({ page }) => {
  await page.goto("./");
  await page.addStyleTag({ content: "html { font-size: 125%; }" });

  await expect(page.getByRole("heading", { name: "Begin the Rosary" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next bead" })).toBeVisible();

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
});
```

- [ ] **Step 4: Add automated WCAG and landmark checks**

Create `tests/e2e/accessibility.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("has no automatically detectable WCAG A or AA violations", async ({
  browserName,
  page,
}) => {
  test.skip(browserName !== "chromium", "Run one deterministic accessibility engine");

  await page.goto("./");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});

test("exposes one main landmark and a named progress indicator", async ({ page }) => {
  await page.goto("./");

  await expect(page.getByRole("main", { name: "Rosary prayer guide" })).toHaveCount(1);
  await expect(page.getByRole("progressbar", { name: "Rosary progress" })).toBeVisible();
});
```

- [ ] **Step 5: Run browser tests and record the initial failures**

Run:

```bash
npm run test:e2e
```

Expected before refinement: functional tests may pass, but screenshot tests create missing-snapshot failures and expose layout issues on at least one target viewport.

- [ ] **Step 6: Refine CSS against explicit visual criteria**

Adjust only the existing design tokens and the three existing style files until all of these are true in both iPhone projects:

```text
[ ] The complete loop, centerpiece, opening beads, and crucifix are visible.
[ ] The cord visibly touches the centerpiece and crucifix with no gap.
[ ] The Rosary is centered and does not feel squeezed against either edge.
[ ] Wooden beads have consistent lighting and no mismatched default SVG fills.
[ ] Large beads are visibly distinct without appearing oversized.
[ ] The current bead is identifiable by focus ring plus aria-current, not color alone.
[ ] Completed beads use a restrained check mark and do not visually overwhelm the Rosary.
[ ] The prayer sheet begins below the essential Rosary geometry in the fresh-start state.
[ ] The prayer sheet heading, count, prayer title, and prayer copy have distinct hierarchy.
[ ] Previous and Next controls remain visible above the Home indicator.
[ ] Increased browser text size does not clip the prayer title or controls.
[ ] Desktop preserves the same Rosary-first interaction rather than becoming a separate design.
[ ] No element resembles an unstyled browser default.
```

Use these bounded tuning ranges:

```css
/* src/styles/tokens.css */
--radius-sheet: 1.25rem to 1.75rem;

/* src/styles/base.css */
.rosary-stage min-height: 56svh to 64svh;
.rosary-stage padding-inline: 0.625rem to 1rem;

/* src/styles/rosary.css */
.rosary-map width: min(100%, 22rem) to min(100%, 28rem);

/* src/styles/prayer-sheet.css */
.prayer-sheet max-height: 42vh to 52vh;
.prayer-copy line-height: 1.55 to 1.75;
```

Do not change the geometry coordinates merely to hide a CSS overflow defect.

- [ ] **Step 7: Generate and inspect snapshots**

Run:

```bash
npm run test:e2e -- --update-snapshots
npm run test:e2e
```

Expected: PASS.

Open every generated PNG and inspect it at 100% scale. Reject snapshots containing any failed criterion from Step 6. Make the smallest CSS correction that resolves the defect, regenerate snapshots, and rerun the full e2e suite.

- [ ] **Step 8: Run the full local quality gate**

Run:

```bash
npm run format
npm run check
npm run test:e2e
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/styles tests/e2e
git commit -m "test: verify iPhone Rosary experience"
```

---

### Task 10: Add installable and offline PWA behavior

**Files:**
- Create: `public/favicon.svg`
- Create: `public/manifest.webmanifest`
- Create: `public/sw.js`
- Create: `scripts/generate-icons.mjs`
- Create: generated `public/icons/icon-192.png`
- Create: generated `public/icons/icon-512.png`
- Create: generated `public/icons/icon-maskable-512.png`
- Create: `src/app/register-service-worker.ts`
- Create: `src/components/install-prompt.ts`
- Test: `tests/integration/install-prompt.test.ts`
- Modify: `src/app/app.ts`
- Modify: `src/main.ts`
- Test: `tests/e2e/offline.spec.ts`

**Interfaces:**
- Produces: `registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined>`.
- Produces: `createInstallPrompt(): HTMLElement`.
- Service worker scope and manifest URLs remain relative to the deployed `/rosary/` base.
- Offline behavior caches same-origin application requests and uses the app shell for navigation fallback.

- [ ] **Step 1: Write failing offline and manifest tests**

Create `tests/e2e/offline.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test.describe("PWA behavior", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Offline control uses Chromium");

  test("exposes valid install metadata", async ({ page }) => {
    await page.goto("./");

    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
    expect(manifestHref).toBe("/rosary/manifest.webmanifest");

    const manifest = await page.request.get("/rosary/manifest.webmanifest");
    expect(manifest.ok()).toBe(true);
    expect(await manifest.json()).toMatchObject({
      name: "Rosary",
      short_name: "Rosary",
      display: "standalone",
      start_url: "./",
      scope: "./",
    });
  });

  test("reloads offline after the service worker controls the page", async ({
    context,
    page,
  }) => {
    await page.goto("./");
    await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller));

    await context.setOffline(true);
    await page.reload();

    await expect(page.getByRole("heading", { name: "Rosary" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Begin the Rosary" })).toBeVisible();
  });
});
```

- [ ] **Step 2: Run and confirm the intended failures**

Run:

```bash
npx playwright test tests/e2e/offline.spec.ts --project=desktop-chromium
```

Expected: FAIL because the manifest, service worker, and registration code do not exist.

- [ ] **Step 3: Create the source icon and generator**

Create `public/favicon.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#f4efe5"/>
  <circle cx="256" cy="176" r="112" fill="none" stroke="#6d4b34" stroke-width="24"/>
  <circle cx="256" cy="288" r="26" fill="#855532"/>
  <path d="M256 314v118M208 350h96" stroke="#4f301f" stroke-width="28" stroke-linecap="round"/>
  <circle cx="256" cy="64" r="22" fill="#855532"/>
  <circle cx="345" cy="110" r="18" fill="#855532"/>
  <circle cx="367" cy="205" r="18" fill="#855532"/>
  <circle cx="167" cy="110" r="18" fill="#855532"/>
  <circle cx="145" cy="205" r="18" fill="#855532"/>
</svg>
```

Create `scripts/generate-icons.mjs`:

```js
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

await mkdir("public/icons", { recursive: true });

const source = "public/favicon.svg";

await Promise.all([
  sharp(source).resize(192, 192).png().toFile("public/icons/icon-192.png"),
  sharp(source).resize(512, 512).png().toFile("public/icons/icon-512.png"),
  sharp(source)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: "#f4efe5",
    })
    .png()
    .toFile("public/icons/icon-maskable-512.png"),
]);
```

Run:

```bash
node scripts/generate-icons.mjs
```

Expected: all three PNG files exist.

- [ ] **Step 4: Create the manifest**

Create `public/manifest.webmanifest`:

```json
{
  "name": "Rosary",
  "short_name": "Rosary",
  "description": "Pray the Rosary bead by bead with complete prayers and mysteries.",
  "id": "./",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#f4efe5",
  "theme_color": "#2f2118",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

- [ ] **Step 5: Implement the service worker**

Create `public/sw.js`:

```js
const CACHE_NAME = "rosary-shell-v1";

function scopeUrl(path = "./") {
  return new URL(path, self.registration.scope).toString();
}

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  const rootUrl = scopeUrl("./");
  const rootResponse = await fetch(rootUrl, { cache: "reload" });

  if (!rootResponse.ok) {
    throw new Error(`Unable to cache app shell: ${rootResponse.status}`);
  }

  const html = await rootResponse.clone().text();
  await cache.put(rootUrl, rootResponse);

  const discoveredAssets = Array.from(
    html.matchAll(/(?:src|href)="([^"]+)"/g),
    (match) => match[1],
  )
    .filter((value) => typeof value === "string")
    .map((value) => new URL(value, rootUrl))
    .filter(
      (url) =>
        url.origin === self.location.origin &&
        url.pathname.startsWith(new URL(self.registration.scope).pathname),
    )
    .map((url) => url.toString());

  const requiredAssets = [
    scopeUrl("manifest.webmanifest"),
    scopeUrl("favicon.svg"),
    scopeUrl("icons/icon-192.png"),
    scopeUrl("icons/icon-512.png"),
    scopeUrl("icons/icon-maskable-512.png"),
  ];

  await cache.addAll(Array.from(new Set([...requiredAssets, ...discoveredAssets])));
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheAppShell().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (request.method !== "GET" || requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(scopeUrl("./"), copy));
          return response;
        })
        .catch(async () => {
          const cachedShell = await caches.match(scopeUrl("./"));
          return cachedShell ?? Response.error();
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
```

- [ ] **Step 6: Register the service worker**

Create `src/app/register-service-worker.ts`:

```ts
export async function registerServiceWorker(): Promise<
  ServiceWorkerRegistration | undefined
> {
  if (!("serviceWorker" in navigator)) {
    return undefined;
  }

  return navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
    scope: import.meta.env.BASE_URL,
  });
}
```

Modify `src/main.ts`:

```ts
import { createRosaryApp } from "./app/app";
import { registerServiceWorker } from "./app/register-service-worker";
import "./styles/base.css";
import "./styles/prayer-sheet.css";
import "./styles/rosary.css";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Missing #app root element");
}

createRosaryApp(root);

window.addEventListener("load", () => {
  void registerServiceWorker();
});
```

- [ ] **Step 7: Write failing install-guidance tests**

Create `tests/integration/install-prompt.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInstallPrompt } from "../../src/components/install-prompt";

describe("install prompt", () => {
  it("shows iPhone Add to Home Screen guidance outside standalone mode", () => {
    const controller = createInstallPrompt({
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15",
      isStandalone: false,
      eventTarget: window,
    });

    expect(controller.element.hidden).toBe(false);
    expect(controller.element.querySelector("button")?.hidden).toBe(true);
    expect(controller.element.textContent).toContain("Add to Home Screen");

    controller.destroy();
  });

  it("stays hidden on a non-iOS browser until beforeinstallprompt fires", () => {
    const controller = createInstallPrompt({
      userAgent: "Mozilla/5.0 Chrome/140.0.0.0 Safari/537.36",
      isStandalone: false,
      eventTarget: window,
    });

    expect(controller.element.hidden).toBe(true);
    controller.destroy();
  });
});
```

Run:

```bash
npx vitest run tests/integration/install-prompt.test.ts
```

Expected: FAIL because `install-prompt.ts` does not exist.

- [ ] **Step 8: Add an install affordance that degrades safely on Safari**

Create `src/components/install-prompt.ts`:

```ts
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

export interface InstallPromptOptions {
  readonly userAgent?: string;
  readonly isStandalone?: boolean;
  readonly eventTarget?: Window;
}

export interface InstallPromptController {
  readonly element: HTMLElement;
  destroy(): void;
}

export function createInstallPrompt(
  options: InstallPromptOptions = {},
): InstallPromptController {
  const container = document.createElement("div");
  container.className = "install-prompt";
  container.hidden = true;
  container.innerHTML = `
    <button type="button">Install Rosary</button>
    <p class="install-prompt__ios">
      On iPhone, use Share, then choose Add to Home Screen.
    </p>
  `;

  const button = container.querySelector<HTMLButtonElement>("button");
  const iosCopy = container.querySelector<HTMLElement>(".install-prompt__ios");
  const eventTarget = options.eventTarget ?? window;
  const userAgent = options.userAgent ?? navigator.userAgent;
  const standaloneNavigator = navigator as Navigator & { standalone?: boolean };
  const detectedStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean(standaloneNavigator.standalone);
  const isStandalone = options.isStandalone ?? detectedStandalone;
  let deferredPrompt: BeforeInstallPromptEvent | undefined;

  if (!button || !iosCopy) {
    throw new Error("Install prompt elements are missing");
  }

  if (/iphone|ipad|ipod/i.test(userAgent) && !isStandalone) {
    container.hidden = false;
    button.hidden = true;
    iosCopy.hidden = false;
  }

  const handleBeforeInstallPrompt = (event: Event): void => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    container.hidden = false;
    button.hidden = false;
    iosCopy.hidden = true;
  };

  const handleInstall = async (): Promise<void> => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = undefined;
    container.hidden = true;
  };

  eventTarget.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  button.addEventListener("click", () => {
    void handleInstall();
  });

  return {
    element: container,
    destroy() {
      eventTarget.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    },
  };
}
```

Modify `src/app/app.ts` with these exact changes.

Add the import:

```ts
import { createInstallPrompt } from "../components/install-prompt";
```

Replace the root markup with:

```ts
root.innerHTML = `
  <section class="rosary-stage">
    <div class="rosary-stage__header"></div>
    <div class="rosary-stage__selector"></div>
    <div class="rosary-stage__install"></div>
    <div class="rosary-stage__map"></div>
  </section>
  <aside class="rosary-stage__sheet"></aside>
`;
```

Replace the slot queries and guard with:

```ts
const headerSlot = root.querySelector<HTMLElement>(".rosary-stage__header");
const selectorSlot = root.querySelector<HTMLElement>(".rosary-stage__selector");
const installSlot = root.querySelector<HTMLElement>(".rosary-stage__install");
const mapSlot = root.querySelector<HTMLElement>(".rosary-stage__map");
const sheetSlot = root.querySelector<HTMLElement>(".rosary-stage__sheet");

if (!headerSlot || !selectorSlot || !installSlot || !mapSlot || !sheetSlot) {
  throw new Error("Rosary application slots are missing");
}
```

After appending the progress header, create and append the install controller:

```ts
const installPrompt = createInstallPrompt();
installSlot.append(installPrompt.element);
```

Replace the `destroy()` body with:

```ts
destroy() {
  installPrompt.destroy();
  root.replaceChildren();
  root.className = "";
},
```

Append this CSS to `src/styles/base.css`:

```css
.install-prompt {
  margin-top: 0.5rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid rgb(79 48 31 / 14%);
  border-radius: 0.8rem;
  background: rgb(255 253 248 / 72%);
}

.install-prompt button {
  min-height: 44px;
  padding-inline: 0.85rem;
  border: 1px solid rgb(79 48 31 / 18%);
  border-radius: 0.75rem;
  color: white;
  background: var(--color-wood-dark);
  font-weight: 750;
}

.install-prompt__ios {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.85rem;
  line-height: 1.45;
}

.rosary-stage {
  grid-template-rows: auto auto auto minmax(0, 1fr);
}
```

- [ ] **Step 9: Run offline and install tests**

Run:

```bash
npm run build
npx vitest run tests/integration/install-prompt.test.ts
npx playwright test tests/e2e/offline.spec.ts --project=desktop-chromium
npm run test:e2e
```

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add public scripts/generate-icons.mjs src/app/register-service-worker.ts src/components/install-prompt.ts src/app/app.ts src/main.ts tests/integration/install-prompt.test.ts tests/e2e/offline.spec.ts
git commit -m "feat: add installable offline PWA"
```

---

### Task 11: Add repository validation, CI, deployment, and contributor documentation

**Files:**
- Create: `scripts/validate-repository.mjs`
- Create: `tests/unit/repository-files.test.ts`
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/deploy-pages.yml`
- Create: `.github/pull_request_template.md`
- Create: `README.md`
- Create: `CONTRIBUTING.md`
- Create: `LICENSE`
- Create: `docs/qa/v1-release-checklist.md`

**Interfaces:**
- Produces: `npm run validate:repo`.
- CI uses Node 22, `npm ci`, Playwright browser installation, and all quality gates.
- Deployment builds with Vite and uploads `dist/` to GitHub Pages.
- README documents local setup, test commands, architecture, accessibility, and deployment.

- [ ] **Step 1: Write the failing repository-file test**

Create `tests/unit/repository-files.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("repository configuration", () => {
  it("runs every required CI quality gate", () => {
    const workflow = readFileSync(".github/workflows/ci.yml", "utf8");

    for (const command of [
      "npm run format:check",
      "npm run lint",
      "npm run typecheck",
      "npm run test:unit",
      "npm run test:e2e",
      "npm run build",
    ]) {
      expect(workflow).toContain(command);
    }
  });

  it("deploys only the built dist directory", () => {
    const workflow = readFileSync(".github/workflows/deploy-pages.yml", "utf8");
    expect(workflow).toContain("path: dist");
    expect(workflow).toContain("branches: [main]");
  });

  it("documents the exact local verification command", () => {
    const readme = readFileSync("README.md", "utf8");
    expect(readme).toContain("npm run check");
    expect(readme).toContain("npm run test:e2e");
  });
});
```

- [ ] **Step 2: Run and confirm missing-file failure**

Run:

```bash
npx vitest run tests/unit/repository-files.test.ts
```

Expected: FAIL because the workflows and README do not exist.

- [ ] **Step 3: Add deterministic repository validation**

Create `scripts/validate-repository.mjs`:

```js
import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  ".github/workflows/ci.yml",
  ".github/workflows/deploy-pages.yml",
  "CONTRIBUTING.md",
  "LICENSE",
  "README.md",
  "public/manifest.webmanifest",
  "public/sw.js",
  "src/data/prayers.ts",
  "src/data/rosary-sequence.ts",
  "tests/e2e/mobile-layout.spec.ts",
];

await Promise.all(requiredFiles.map((file) => access(file)));

const manifest = JSON.parse(await readFile("public/manifest.webmanifest", "utf8"));

if (manifest.display !== "standalone") {
  throw new Error("Manifest display mode must be standalone");
}

if (!Array.isArray(manifest.icons) || manifest.icons.length < 3) {
  throw new Error("Manifest must include standard and maskable icons");
}

console.log(`Validated ${requiredFiles.length} required repository files.`);
```

- [ ] **Step 4: Add CI**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  quality:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium webkit

      - name: Validate repository
        run: npm run validate:repo

      - name: Check formatting
        run: npm run format:check

      - name: Lint
        run: npm run lint

      - name: Type-check
        run: npm run typecheck

      - name: Run unit and integration tests
        run: npm run test:unit

      - name: Run browser tests
        run: npm run test:e2e

      - name: Build
        run: npm run build

      - name: Upload Playwright report on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          if-no-files-found: ignore
```

- [ ] **Step 5: Add GitHub Pages deployment**

Create `.github/workflows/deploy-pages.yml`:

```yaml
name: Deploy GitHub Pages

on:
  workflow_run:
    workflows: [CI]
    types: [completed]
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    if: github.event.workflow_run.conclusion == 'success'
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest

    steps:
      - name: Check out repository
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.workflow_run.head_sha }}

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Configure Pages
        uses: actions/configure-pages@v5

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 6: Add professional project documentation**

Create `README.md` with these exact sections and commands:

````markdown
# Rosary

A mobile-first, installable Rosary prayer guide. The complete connected wooden Rosary remains visible while each bead reveals the exact prayer, repetition count, and mystery context.

## Features

- Complete Rosary sequence
- Exact full prayer text
- Direct bead selection
- Previous and next navigation
- Automatic weekday mysteries with manual override
- Saved local progress
- Keyboard-accessible 44 × 44 pixel targets
- Installable and offline-capable PWA
- iPhone-first responsive design

## Local development

Requirements:

- Node.js 22
- npm

```bash
npm ci
npx playwright install chromium webkit
npm run dev
```

The development server runs at `http://127.0.0.1:4173/rosary/`.

## Verification

```bash
npm run check
npm run test:e2e
```

Run repository validation separately with:

```bash
npm run validate:repo
```

## Architecture

`src/data/rosary-sequence.ts` is the canonical source of truth for prayer order, navigation, progress, and bead mapping. `src/components/rosary-map.ts` renders the connected wooden Rosary and native button hit targets. `src/components/prayer-sheet.ts` renders prayer and mystery content from the selected sequence step.

## Accessibility

The application uses native buttons for bead interaction, visible keyboard focus, minimum 44 × 44 pixel targets, semantic progress, reduced-motion support, and text contrast designed to meet WCAG AA.

## Deployment

Merges to `main` run CI. A successful `main` CI run triggers the GitHub Pages workflow, which publishes `dist/`.

## Project documentation

- Design: `docs/superpowers/specs/2026-07-31-rosary-pwa-design.md`
- Implementation plan: `docs/superpowers/plans/2026-07-31-rosary-pwa.md`
- Release checklist: `docs/qa/v1-release-checklist.md`

## License

MIT
````

Create `CONTRIBUTING.md`:

````markdown
# Contributing

## Development workflow

1. Create a focused branch.
2. Write or update a failing test before behavior changes.
3. Make the smallest implementation that passes the test.
4. Run formatting, linting, type checks, unit tests, browser tests, and the production build.
5. Inspect affected mobile screenshots before opening a pull request.

## Required local checks

```bash
npm run validate:repo
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e
npm run build
```

## Pull requests

Keep pull requests focused. Explain the user impact, test evidence, and any screenshot changes. Do not update visual snapshots without inspecting them at full size.
````

Create `.github/pull_request_template.md`:

```markdown
## What changed

Describe the user-visible and internal changes.

## Why

Explain the problem or requirement this addresses.

## Verification

- [ ] `npm run validate:repo`
- [ ] `npm run check`
- [ ] `npm run test:e2e`
- [ ] Updated screenshots were inspected at full size
- [ ] iPhone SE and iPhone 14 layouts were checked
- [ ] The crucifix remains visibly attached to the Rosary

## Screenshots

Attach before-and-after screenshots for visual changes.
```

Create `LICENSE`:

```text
MIT License

Copyright (c) 2026 Jared Mahotiere

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Create `docs/qa/v1-release-checklist.md`:

````markdown
# Version 1 Release Checklist

## Prayer correctness

- [ ] All nine required prayer records are present.
- [ ] Every prayer is shown in full.
- [ ] Five decades contain ten Hail Mary beads each.
- [ ] Glory Be and Fatima Prayer follow every decade.
- [ ] Final prayers occur after decade five in the approved order.
- [ ] Weekday mystery mapping is correct.

## Interaction

- [ ] Direct bead selection shows the matching sequence step.
- [ ] Previous and Next remain synchronized with direct selection.
- [ ] Reload restores valid progress.
- [ ] Malformed saved progress resets safely.
- [ ] Manual mystery selection does not change the current bead.
- [ ] Automatic mode returns to the current weekday mystery set.

## iPhone visual inspection

- [ ] No horizontal page overflow.
- [ ] Full loop, centerpiece, opening beads, and crucifix are visible.
- [ ] Cord touches the centerpiece and crucifix without a gap.
- [ ] Every hit target measures at least 44 × 44 CSS pixels.
- [ ] Prayer sheet controls remain above the Home indicator.
- [ ] Current and completed states are distinguishable without color alone.
- [ ] Prayer copy remains readable with increased text size.
- [ ] No control looks like an unstyled browser default.
- [ ] Wooden bead lighting and sizing remain consistent.

## PWA

- [ ] Manifest is valid.
- [ ] Standard and maskable icons load.
- [ ] App installs in a supported browser.
- [ ] iPhone Add to Home Screen guidance is available.
- [ ] App reloads offline after the first online load.
- [ ] Saved progress survives service-worker activation.

## Final commands

```bash
npm run validate:repo
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e
npm run build
```
````

- [ ] **Step 7: Run documentation and workflow tests**

Run:

```bash
npm run validate:repo
npx vitest run tests/unit/repository-files.test.ts
npm run format
npm run check
npm run test:e2e
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add .github scripts/validate-repository.mjs tests/unit/repository-files.test.ts README.md CONTRIBUTING.md LICENSE docs/qa/v1-release-checklist.md
git commit -m "chore: add CI deployment and project docs"
```

---

### Task 12: Perform final verification and prepare the publish branch

**Files:**
- Modify only files required by a failing check or a failed release criterion.
- Update: `docs/qa/v1-release-checklist.md` by checking each verified item.
- Do not modify snapshots unless the rendered UI intentionally changed.

**Interfaces:**
- Produces a clean, independently verified branch ready for push and pull request.
- Produces command evidence for every required quality gate.

- [ ] **Step 1: Start from a clean worktree**

Run:

```bash
git status --short
```

Expected: no output.

- [ ] **Step 2: Run every automated gate from a clean install**

Run:

```bash
npm ci
npx playwright install chromium webkit
npm run validate:repo
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e
npm run build
```

Expected: every command exits 0.

- [ ] **Step 3: Inspect all visual snapshots against the release checklist**

Open every PNG under `tests/e2e/*-snapshots/` at full size.

For each screenshot, verify:

```text
- complete wooden Rosary visible,
- continuous loop-to-centerpiece-to-cross cord,
- attached crucifix,
- no clipped or overlapping text,
- no page-level horizontal overflow,
- clear selected state,
- restrained completed state,
- readable prayer hierarchy,
- visible Previous and Next controls,
- no generic default styling,
- no unexplained empty region or apparently missing component.
```

When a criterion fails, identify the responsible existing CSS rule, make one bounded correction, rerun the affected Playwright test, regenerate only the affected snapshot, inspect it again, then rerun `npm run test:e2e`.

- [ ] **Step 4: Mark the release checklist with verified evidence**

Edit `docs/qa/v1-release-checklist.md` and change each verified `- [ ]` to `- [x]`. Do not check an item based on assumption; use the relevant test output or inspected snapshot.

- [ ] **Step 5: Re-run the final gate after checklist edits**

Run:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e
npm run build
git diff --check
git status --short
```

Expected: all commands pass; only `docs/qa/v1-release-checklist.md` is modified.

- [ ] **Step 6: Commit verification evidence**

```bash
git add docs/qa/v1-release-checklist.md
git commit -m "docs: verify version one release"
```

- [ ] **Step 7: Confirm final branch state**

Run:

```bash
git status -sb
git log --oneline --decorate -12
```

Expected: clean worktree and a clear sequence of focused commits.

- [ ] **Step 8: Publish only after GitHub write access is available**

Run:

```bash
git remote -v
git push -u origin agent/rosary-pwa-v1
```

Then open a draft pull request to `main` with:

```markdown
## What changed

Built the version-one Rosary PWA with a complete connected wooden Rosary, exact bead-by-bead prayers, weekday mysteries, saved progress, accessibility support, offline use, and GitHub Pages deployment.

## Why

The app provides a focused iPhone-first guide for praying the complete Rosary without losing the physical bead position or prayer sequence.

## Verification

- `npm run validate:repo`
- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`
- Mobile snapshots inspected at full size
- Release checklist completed
```

Expected: branch is pushed and a draft PR targets `main`.
