# GitHub Pages

Repository: https://github.com/youpoisk/web
Site: https://youpoisk.github.io/web/

Push to main or run Deploy website to GitHub Pages manually. The workflow installs pinned Node/pnpm versions, builds the SPA, runs core/extension checks and dependency audit, then publishes only dist using the official Pages artifact + OIDC deployment actions. No personal access token is needed in Actions secrets. Repository Pages source must be GitHub Actions.

## Public build variables

Settings → Secrets and variables → Actions → Variables:

- VITE_API_ORIGIN: public backend HTTPS origin without trailing slash, for example https://api.example.com. Intentionally empty/unset until a backend exists. No local fallback is used by production authConfig when configuration is missing.
- VITE_AUTH_CALLBACK: optional override; default https://youpoisk.github.io/web/. It must exactly match the backend callback allowlist, including /web/ and trailing slash.

These are public frontend variables, never database credentials. After setting/changing them, rerun the Pages workflow or push main: Vite substitutes them at build time.

Until the backend is connected, the static interface is published, but catalog/account/social features cannot load server data. No demo data or localhost API is substituted. The site explains that the backend is not connected. Configure backend CORS for https://youpoisk.github.io and browser callback for https://youpoisk.github.io/web/ before enabling authorization. The admin panel remains on the backend origin; static Pages does not host /ap.

The app uses hash routes, so /web/#/feed works directly. Relative Vite assets work under /web/. prepare-pages.mjs fixes the custom 404 links in dist only, preserving local development. Local reproduction:

    VITE_API_ORIGIN='' VITE_AUTH_CALLBACK='https://youpoisk.github.io/web/' pnpm build
    PAGES_BASE_PATH='/web/' node scripts/prepare-pages.mjs

Publish only tracked reviewed application files. .env, node_modules, .artifacts, local credentials, QA evidence and dist are not committed. Access tokens must never be written into workflows, URLs or source.
