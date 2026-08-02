---
name: rosary-product-ux
description: Use for every Rosary frontend, interaction, accessibility, responsive-layout, or visual change. Enforces domain-specific design, user-flow correctness, and real-browser verification before merge.
---

# Rosary Product UX

This is a devotional product used repeatedly, often one-handed on a phone. It is not a marketing page, dashboard, or design showcase. The primary task is to pray the Rosary without losing place or being surprised by navigation.

## Product truth

The interface must preserve these facts:

- A standard Rosary has a crucifix, one opening Our Father bead, three opening Hail Mary beads, a centerpiece, and five decades.
- Physical location and prayer order must agree.
- Selecting a bead is inspection. It must not imply that skipped prayers were completed.
- Completion advances only through the explicit sequential action.
- Previous and Start over must always provide recovery from mistakes.
- Progress represents completed prayers, not the currently inspected position.
- Every decorative shape must have a domain or interaction purpose.

## Design direction

The product should feel quiet, legible, reverent, and materially grounded.

Use:

- a physically coherent Rosary as the signature element,
- restrained walnut, cord, parchment, and muted-metal references,
- clear prayer typography,
- one primary action at a time,
- flat or lightly separated surfaces,
- compact mobile controls,
- visible recovery actions.

Reject by default:

- giant marketing-style headings,
- generic rounded-card compositions,
- dramatic shadows or decorative gradients,
- progress rings that confuse position with completion,
- ornamental circles, badges, or shapes without meaning,
- desktop-first layouts compressed onto mobile,
- controls that look active but do nothing,
- style changes without rendered-browser evidence.

## Required workflow

### 1. Reproduce before changing

For a reported bug:

1. Write or extend a Playwright journey that reproduces the exact user action.
2. Run it and observe the failure.
3. Add a lower-level unit test when the bug has deterministic domain logic.
4. Make the smallest coherent correction.
5. Re-run the original failing journey.

Do not replace a behavioral test with a source-text regular-expression check.

### 2. Design from the task

Before visual changes, write down:

- the person and context,
- the action they are trying to complete,
- the next action they should understand immediately,
- the Rosary-specific physical constraints,
- three generic UI defaults being rejected,
- the single signature interaction or object.

Do not choose a style from a catalog before answering these questions.

### 3. Test real user journeys

At minimum, exercise:

- first launch,
- Next through the opening prayers,
- Previous from multiple points,
- direct selection of an early and late bead,
- accidental selection followed by recovery,
- Start over,
- reload resets to a fresh Rosary (progress is session-only),
- Mystery selection,
- final prayers,
- no horizontal overflow,
- keyboard access,
- automated accessibility scan,
- offline or service-worker behavior when affected.

Run on both:

- desktop Chromium,
- iPhone-sized WebKit.

### 4. Inspect rendered evidence

Every UI pull request must produce browser evidence:

- Playwright HTML report,
- trace on failure,
- screenshots for the main states touched,
- console errors captured by the test runner.

Open and inspect the screenshots. Passing assertions do not prove visual quality.

Check specifically for:

- clipped prayer text,
- overlapping touch targets,
- a detached crucifix,
- reversed opening-bead order,
- unexplained geometry,
- stale completion marks,
- dead ends,
- inconsistent spacing,
- excessive rounding or shadows,
- mobile overflow.

### 5. Verify the deployed product

After GitHub Pages deploys, run a smoke journey against the returned live URL. A local build is not enough to prove the public PWA works or refreshed its cache.

## Merge gate

Do not merge or claim completion until all of the following are true:

- unit and integration tests pass,
- desktop Chromium journeys pass,
- iPhone WebKit journeys pass,
- accessibility checks pass or documented exceptions are approved,
- Playwright evidence is uploaded,
- screenshots were inspected,
- the deployed smoke test passes for release changes,
- the original user-reported action was re-tested directly.

When evidence is missing, state what is unverified instead of implying completion.
