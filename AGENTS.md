# Rosary Repository Instructions

## Required skill

For any frontend, interaction, responsive, accessibility, or visual change, read and follow:

`.agents/skills/rosary-product-ux/SKILL.md`

Also follow `DESIGN.md` (banned tokens, type roles, chapel-desk surfaces).

Do not use a generic frontend-design skill as the sole design or acceptance rubric.

## Product invariants

- Direct bead selection inspects a prayer without completing skipped prayers.
- Only explicit sequential advancement marks a prayer complete.
- Previous and Start over must recover from mistakes.
- Progress measures completed prayers, not selected position.
- The physical Rosary and prayer sequence must agree.
- The crucifix, opening strand, centerpiece, and loop must remain connected.
- Decorative geometry without a domain purpose is a defect.

## Required verification

For behavior changes:

1. Add a failing regression test for the reported action.
2. Run unit/integration checks.
3. Run Playwright desktop Chromium and iPhone WebKit journeys.
4. Run accessibility checks.
5. Inspect screenshots and traces.
6. For release changes, verify the deployed GitHub Pages URL.

Commands:

```bash
npm ci
npm run check
npx playwright install chromium webkit
npm run test:e2e
```

Use `npm run test:e2e:ui` for interactive browser inspection.

## Completion rule

Do not claim a bug is fixed or a UI change is complete from source inspection, typechecking, or unit tests alone. Provide fresh browser-test evidence and name any remaining unverified behavior.
