# Callback code-exchange transport review — 0d7d6b4

Gate: PASS. No actionable findings in the reviewed callback-only transport slice.

Reviewed CodeExchange, its failure/race tests, PendingFlow integration, generated request/response schemas, typechecking configuration and DEC-WEB-016 scope. No actual .env, credentials or browser storage were read.

Capture/scrubbing precedes network use. The destination comes from validated persisted API configuration; cookies/Bearer/manual Origin are omitted and redirects/cache/referrer are restricted. Request shape is validated before dispatch. Responses are streamed under64KiB with strict UTF8/scalar-string validation, closed success/error schemas and sanitized diagnostics. Access output stays in memory; no acknowledgment or identity commit is performed by this class.

Current pending nonce/owner/epoch/status is checked before fetch, after headers, after body and on errors, rejecting cancellation, expiry, replacement/account transitions and late failures. A bound existing owner must match the returned user. The result carries original scope/state for a subsequent synchronous coordinator check/ack/commit. Attempt tracking prevents implicit same-instance replay after uncertain outcomes; explicit fresh flow remains the required recovery path.

Independent readonly api:check, typecheck:api and33CSP tests passed, including wrong-owner, mid-fetch/body transition, malformed Unicode/shape, size, timeout/abort and sanitized HTTP cases. Handwritten modules meet100% line/function gates. The author-reported emitting build was not repeated; actual navigation/native auth page/coordinator and real browser blocked-cookie proof remain open. No source edits, commits, real network requests/accounts, environment reads or stack changes occurred.