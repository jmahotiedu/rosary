# Frontend Agent Quality Research

Date: 2026-08-01

## Problem

A broad "make it distinctive" frontend prompt can still produce a recognizable agent-generated result: oversized display type, cream or purple gradients, rounded cards, decorative shadows, and visual flourishes that are unrelated to the user's task.

For this application, the larger failure was not only appearance. The first live version also allowed direct bead selection to mutate completion state, had reversed physical ordering on the opening strand, rendered unexplained geometry, and lacked real-browser journey tests.

A generic visual-design skill cannot know the physical or devotional rules of a Rosary. The repository therefore needs a project-specific product skill plus enforceable browser tests.

## Sources evaluated

### Frontend Design Principles

Repository: https://github.com/joshuadavidthomas/agent-skills/tree/main/frontend-design-principles

Useful ideas adopted:

- identify the actual person and task before styling,
- derive color and vocabulary from the product's physical world,
- define one signature element that could only belong to this product,
- explicitly name generic defaults to reject,
- inspect the first result and iterate before showing it.

This is more relevant than selecting from a large catalog of fashionable styles because it forces domain-specific decisions.

### Frontend UI Engineering

Repository: https://github.com/addyosmani/agent-skills/tree/main/skills/frontend-ui-engineering

Useful ideas adopted:

- production UI quality includes state behavior, accessibility, responsive layout, and performance,
- use a real design system instead of isolated styling choices,
- avoid rounded-everything, stock cards, excessive gradients, shadows, and undifferentiated spacing,
- separate domain state from presentation.

### Microsoft Frontend Design Review

Repository: https://github.com/microsoft/skills/tree/main/.github/skills/frontend-design-review

Useful ideas adopted:

- evaluate whether the primary task is obvious and frictionless,
- require clear entry and exit points,
- keep Back or Cancel recovery available,
- score blocking, major, and minor issues instead of treating all polish equally,
- review actual states and responsive behavior.

### Anthropic Web Application Testing

Repository: https://github.com/anthropics/skills/tree/main/skills/webapp-testing

Retained only for testing mechanics:

- inspect the rendered DOM before scripting interactions,
- wait for the application to finish loading,
- use Playwright to capture screenshots and browser logs,
- discover selectors from the rendered application rather than guessing.

This skill is not used as the visual-design authority.

### Superpowers verification and TDD

Repository: https://github.com/obra/superpowers

Useful ideas adopted:

- reproduce a bug before changing implementation,
- require fresh evidence before claiming success,
- test the original symptom rather than inferring from a build,
- review agent output independently.

### Playwright official guidance

Documentation:

- https://playwright.dev/docs/ci
- https://playwright.dev/docs/best-practices
- https://playwright.dev/docs/test-assertions
- https://playwright.dev/docs/test-snapshots
- https://playwright.dev/docs/trace-viewer-intro

Practices adopted:

- run real browsers in CI,
- use one worker in CI for reproducibility,
- test user-visible behavior with web-first assertions,
- preserve traces, screenshots, videos, and HTML reports,
- cover Chromium and WebKit,
- smoke-test the deployed URL after publishing.

### Axe Playwright integration

Repository: https://github.com/dequelabs/axe-core-npm

Practice adopted:

- run automated WCAG A and AA checks inside the same rendered user journey.

Automated accessibility checks do not replace keyboard and visual review.

## Selected approach

The repository uses a layered approach instead of one generic frontend skill:

1. `.agents/skills/rosary-product-ux/SKILL.md` defines Rosary-specific product and interaction rules.
2. `AGENTS.md`, `CLAUDE.md`, and Copilot instructions make the project rules difficult for coding agents to miss.
3. Unit tests cover deterministic prayer, geometry, and completion logic.
4. Playwright exercises complete desktop Chromium and iPhone WebKit journeys.
5. Axe checks rendered accessibility.
6. CI uploads reports, traces, and screenshots.
7. The Pages workflow smoke-tests the public deployment.

## Design implication

The current visual direction should be reviewed as a product interface, not as a generated art direction. The next visual pass should reduce oversized headings, generic card framing, excessive rounding, decorative shadows, and ambiguous progress decoration while preserving the connected wooden Rosary as the product-specific signature.
