# Rosary

A mobile-first, installable Rosary PWA with a complete connected wooden Rosary, exact prayers, daily mysteries, direct bead inspection, sequential navigation, and offline support. Progress is session-only: leaving or reloading the site starts a fresh Rosary.

## Live site

**https://jmahotiedu.github.io/rosary/**

On iPhone, open that address in Safari, tap **Share**, then **Add to Home Screen**.

## Local setup

Requires Node.js 20 or newer.

```bash
npm ci
npm run build
npm run preview
```

The preview command prints both:

- a local computer address
- a network address you can open from a phone on the same Wi-Fi

The application path is `/rosary/`, for example:

```text
http://localhost:4173/rosary/
```

## Development

```bash
npm run dev
```

`npm run dev` builds the current source and starts the cross-platform preview server on all network interfaces.

## Unit and repository checks

```bash
npm run check
```

This runs TypeScript validation, unit/integration tests, the production build, and repository validation.

## Real-browser end-to-end tests

Install the browsers once:

```bash
npx playwright install chromium webkit
```

Run the desktop Chromium and iPhone WebKit journeys:

```bash
npm run test:e2e
```

Open Playwright's interactive browser test UI:

```bash
npm run test:e2e:ui
```

The browser suite covers accidental bead jumps, backward recovery, completion state, opening Hail Mary order, Rosary geometry, reset behavior, keyboard access, responsive overflow, accessibility, service-worker registration, and screenshots of important states.

## Agent instructions

Frontend and interaction work must follow:

- `AGENTS.md`
- `.agents/skills/rosary-product-ux/SKILL.md`

These instructions deliberately replace generic frontend styling prompts with Rosary-specific product rules and required rendered-browser evidence.

## Deployment

Pushes to `main` run CI and the GitHub Pages deployment workflow. CI requires unit checks plus real desktop and iPhone browser journeys. After Pages publishes, the workflow runs a smoke test against the returned public URL.

In repository settings, **Settings → Pages → Build and deployment → Source** must be set to **GitHub Actions**.
