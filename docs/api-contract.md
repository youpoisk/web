# API contract integration

The committed `contracts/openapi.json` mirrors the implemented backend contract. `contracts/source.json` pins its backend commit, normalized LF SHA-256 and generator version. Generated `src/shared/api/schema.d.ts` contains no runtime authentication or invented endpoints.

```powershell
pnpm api:import C:/repos/youpoisk-backend
pnpm api:check
pnpm api:check-source C:/repos/youpoisk-backend
pnpm build
```

Import requires a clean committed backend contract. Review its diff before committing the mirror/types. CI checks mirror integrity and generated-type drift; `api:check-source` also compares the current backend checkout and must run when changing either repository together. CI without a backend checkout validates the pinned contract, not an independently moving backend branch. The build runs the generated-type drift check.

Current coverage: register/login/refresh, current profile, device sessions/revoke/logout, current-password change, offline lease, per-video state/add, confirmed-channel personal rating and guest/authenticated video card lookup. Remaining library lists/search/hashtags, profiles/privacy, relationships, reviews/posts/feeds, DM, reports/admin/deletion, sync/import and trusted YouTube resolution are not yet advertised as working endpoints. Mail implementation is deferred by request.

UI mapping: auth/settings map to the implemented account/session operations; a video detail maps to by-youtube lookup and video state/add; channel rating requires a server-confirmed channel UUID. A client-provided UC and video association cannot grant that confirmation. Catalog, library/watchlist/ratings pages still need list/query APIs. Social/feed/chat/admin screens need their backend modules. Existing mock UI is not an API integration and must not be presented as live data.

Transport rules: expected_revision is a JSON field, change_seq is required nullable, unknown duration/average are null; never fabricate totals. Reject unsafe JavaScript integers. Access tokens stay in memory. Web credential types exclude JSON refresh tokens. The future first-party auth broker and browser checks are prerequisites for production auth; the type generator does not establish a browser session.
