# Rosary

A mobile-first, installable Rosary PWA with a complete connected wooden Rosary, exact prayers, daily mysteries, direct bead selection, sequential navigation, offline support, and saved progress.

## Live site

After GitHub Pages finishes its first deployment:

**https://jmahotiedu.github.io/rosary/**

On iPhone, open that address in Safari, tap **Share**, then **Add to Home Screen**.

## Local setup

Requires Node.js 20 or newer.

```bash
npm install
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

## Quality checks

```bash
npm run check
```

This runs TypeScript validation, unit/integration tests, the production build, and repository validation.

## Deployment

Pushes to `main` run CI and the GitHub Pages deployment workflow. The deployment job publishes only after its verification and build job succeeds.

In repository settings, **Settings → Pages → Build and deployment → Source** must be set to **GitHub Actions**.
