# Firefox production package

First package: 1.0.0. Site: https://youpoisk.github.io/web/. API deliberately empty until the backend is deployed.

Build:

    pnpm install --frozen-lockfile
    node scripts/extension-auth-bundle.mjs --check
    node scripts/build-firefox-extension.mjs --production --site-origin=https://youpoisk.github.io/web/ --api-origin= --allow-unconfigured-api --version=1.0.0

Production normally requires a public HTTPS API. The explicit Firefox-only --allow-unconfigured-api flag additionally requires the literal empty --api-origin= argument; it cannot silently accept an omitted or unsafe server. This pending-backend package uses a separate background entry that never initializes auth/storage/sync, performs no network requests and rejects all data/auth commands with a configuration message. No localhost fallback, demo profile or successful local-only save is substituted. Host permissions include only YouTube. Normal configured production and development entry points stay unchanged.

The production Gecko UUID is stable and differs from the development ID. Version is set explicitly with --version; the development manifests keep their existing version. A configured production package may use an HTTPS site URL with /web/ path and a separate API origin.

The Desktop delivery contains the unpacked extension, upload ZIP, unsigned XPI, SHA256 hashes and tracked source ZIP with reproducible build instructions. Source ZIP excludes untracked files, local env and artifacts. Mozilla requires signing for permanent installation in normal Firefox; these artifacts are not signed or published to AMO. An empty-backend package is a production configuration draft, not an operational server-connected public release. Connect the real HTTPS API, add its exact host permission by rebuilding, increment version and complete signing before public distribution.

Sources: https://extensionworkshop.com/documentation/publish/package-your-extension/ and https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/
