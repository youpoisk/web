# Browser session coordinator follow-up — 24d7a1d (includes0050536)

Gate: PASS. Original stale-forget P2 resolved; no new findings in the fix delta.

forgetLocal now validates its exact durable reference before consulting/removing pending state. A stale/storage error is retained while the old instance still drops memory, blocks and clears private cache; execution stops before changing the newer reference. The regression directly starts with authenticatedA, commits accountB through a fresh coordinator, then invokes oldA.forgetLocal without a prior identity read. It asserts stale_session, byte-identicalB durable reference, authenticatedB retained and no usable old profile.

Independent readonly test:api passed42CSP tests; session100% lines/branches/functions, combined100% lines/functions and98.40% branches. The emitting build is author-verified rather than repeated. No source edits, commits, actual user storage/accounts/navigation, environment reads or stack mutations occurred. Native UI/cookie/WebLocks/browser release gates remain subsequent work.