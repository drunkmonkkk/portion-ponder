# Production deployment

**Live game:** https://potion-and-ponder.vercel.app/

Potion & Ponder is a client-only Vite application deployed on Vercel. All fifteen levels, automatic position feedback, saved progress, original illustrations, and synthesized music run in the browser.

## Build configuration

The committed `vercel.json` uses:

- Framework: Vite
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`

No runtime environment variables or API keys are required. SVG bottles are bundled components, fonts use system stacks, the favicon is in `public/`, and Web Audio generates all music and effects.

Navigation uses application-window state at the root URL, so no SPA rewrites are needed. localStorage saves are scoped to the website origin and do not transfer between localhost, previews, and production.

## Deploying

Import the repository into an authorized Vercel account, select the branch containing the application (`work`), and use the committed configuration. To update the existing deployment, reuse the existing Vercel project rather than creating another one. GitHub pushes alone do not imply deployment unless a Vercel Git integration has been configured.

Deployment credentials belong in the hosting platform or authenticated CLI session. Never commit credentials, `.env` files, or local `.vercel/` metadata.

## Verification

```sh
npm ci
npm run build
npm test
npx playwright install chromium
npm run test:e2e
```

To exercise the compiled bundle, start `npm run preview -- --port 4173 --strictPort`, then run:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173 npm run test:e2e
```

The current production release passed all 29 unit tests and all nine browser scenarios, including the complete fifteen-level playthrough, mobile touch controls, persistence, automatic completion, and audio continuity. Its page, CSS, JavaScript, and favicon returned HTTP 200.

In a managed environment where Node trusts the provided HTTPS proxy but Chromium does not, the optional test helper can use the existing verified Node HTTPS transport:

```sh
PLAYWRIGHT_BASE_URL=https://potion-and-ponder.vercel.app \
PLAYWRIGHT_PROXY_SERVER="$HTTPS_PROXY" \
PLAYWRIGHT_VERIFIED_TRANSPORT=1 npm run test:e2e
```

TLS verification remains enabled. Run browser suites sequentially because they share a results directory.
