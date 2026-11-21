# Browser session coordinator review — 117c88a

Gate: changes requested (one P2).

## P2 — A stale coordinator must not overwrite the newer durable reference in forgetLocal

Location: C:/repos/youpoisk-frontend/src/shared/auth/session.ts: forgetLocal.

forgetLocal does not validate its durable reference before writing a guest generation. If no pending flow exists, PendingFlow.pendingSummary returns null without invoking the scope callback, so no indirect identity check occurs either. A stale/BFCache coordinator can therefore erase the owner/epoch committed by a newer instance. Independently reproduced with synthetic in-memory storage: instanceA authenticated, a fresh instance forgets and commits accountB, then staleA.forgetLocal succeeds and writes owner:null; the fresh authenticated instance subsequently throws stale_session. The existing other-coordinator test first calls currentUser, which detects the stale reference and misses this direct mutation path.

Fix: guard the exact current raw reference before reading/removing pending state or writing a new generation. Even on stale/storage/cache failures discard this instance's memory and clear its private data, but never overwrite another coordinator's reference/proof. Add a direct stale.forgetLocal regression after a fresh account commit; do not rely on a prior read to activate stale detection.

## Other completed checks

Reviewed durable noncredential reference parsing, real PendingFlow/CodeExchange composition, pre/post cache-hook commit checks, synchronous acknowledgment/save/memory commit ordering, same-owner restore epoch, copied currentUser, local-vs-server logout documentation and failure tests. No additional actionable finding. Tokens/profile remain memory-only and reload enters recovering rather than treating stored ownership as auth. Native cookie/navigation/WebLocks/UI are correctly left open.

Independent readonly test:api passed42CSP tests with100% coordinator lines/branches/functions. The finding used only synthetic memory storage/accounts, no real requests or browser session. No source edits, commits, actual .env/secret reads or stack changes occurred. Emitting build is author-verified rather than repeated.