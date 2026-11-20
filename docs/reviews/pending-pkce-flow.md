# Pending PKCE flow foundation review — 1cf08bf

Gate: changes requested (one P2).

## P2 — Expose safe pending-flow recovery after ordinary reload/navigation interruption

Location: C:/repos/youpoisk-frontend/src/shared/auth/flow.ts: begin/cancel public API.

After a flow is persisted, a fresh PendingFlow instance on the normal callback URL has no public way to obtain its unpredictable state for exact cancellation. capture without code/state returns null; begin always rejects pending, including after the15minute TTL or account-epoch change. cancel requires the exact state, which exists only inside private storage when the initiating page's memory/public navigation parameters were lost. Independently reproduced with two instances sharing in-memory storage: ordinary reload capture=null; after900001ms a new begin still throws pending. The coordinator would have to duplicate the private storage key/format to offer a safe cancel/restart, contrary to this class owning that protocol.

Fix: expose a validated minimal pending summary/recovery operation that lets a reloaded caller explicitly cancel by the stored nonce, including expired/stale flows. Do not automatically overwrite a live or unknown pending record and do not disclose the PKCE verifier through the summary. Test fresh-instance normal reload and expired/stale cancellation/restart, plus replacement nonce protection and storage/malformed failures.

## Other completed checks

Reviewed strict configured URLs, crypto32byte state/verifier/S256, API+callback-scoped per-tab storage, owner/epoch checks before and after digest, callback cleanup-before-storage validation, exact state/path/query/TTL checks, safe return hash, explicit acknowledgment and non-clobber concurrency tests. Tokens/passwords are not persisted by this class. Acknowledgment/identity exchange are intentionally separate and require later coordinator checks. No additional actionable security finding was identified.

Independent readonly pnpm test:api passed26CSP tests; flow100% lines/branches/functions and client100% lines/functions. The API usability issue was reproduced separately with synthetic in-memory storage, not a real user/browser session. No source edits, commits, actual .env/secret reads, navigation or stack changes occurred. Actual coordinator/navigation and real Chrome blocked-cookie proof remain future work.