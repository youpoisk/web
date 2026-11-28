# Production API connection — VPS step 14

Public API: https://91.228.154.168:8443
Website: https://youpoisk.github.io/web/

GitHub Actions repository variables:
- VITE_API_ORIGIN=https://91.228.154.168:8443
- VITE_AUTH_CALLBACK=https://youpoisk.github.io/web/

These values are public build configuration, not secrets. Rebuild Pages after any
change. Preserve production fail-closed behavior when API origin is absent; never
fall back to loopback. The API already allows the exact Pages origin without /web/.
Keep admin UI at https://91.228.154.168:8443/ap.

Extension release command (Firefox and Chrome, production version1.0.1):

~~~powershell
node scripts/prepare-extension-release.mjs --production --site-origin=https://youpoisk.github.io/web/ --api-origin=https://91.228.154.168:8443 --version=1.0.1
~~~

Firefox host permission must omit port (browser limitation); actual runtime API
origin retains :8443. Chrome permission keeps the exact port. Do not allow all
hosts. No localhost permissions/config are permitted in production packages.

Unsigned Firefox package requires a temporary installation for local acceptance or
Mozilla signing for permanent installation. Preparing a zip is not store submission
and does not update an already installed signed extension. Keep older release files.

The deployed API uses an exact Origin allowlist. Firefox internal moz-extension
UUID varies per installation; Chrome ID must also be known. Host permissions alone
do not override the server's origin_forbidden response. For first installed-client
acceptance, obtain the real extension origin and add that exact origin to
API_ALLOWED_ORIGINS on VPS, preserving Pages and API origins. Recreate only API
with existing secrets and image, never restart Docker or VPN. Do not broaden the
allowlist to wildcard origins. General multi-user extension origin policy remains
a separate backend task; a per-installation allowlist is an initial acceptance
configuration, not a scalable public-store deployment.

Check guest catalog, login/PKCE callback, refresh/reload, and logout on the actual
published site in Firefox and Chrome. Use the account owner for their login; do not
sign in as Henning with a guessed/old password. Website and extension have separate
sessions; extension must authenticate the desired existing account itself.
Do not declare extension working until installed-client requests and persistence
on the production API have been verified. No fixture writes to production.
