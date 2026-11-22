# Independent review — latest QA/messages handoff

Reviewed frontend 95634fd; backend 8916dfa and ae07b36; encryption requirement backend 9049a01 and frontend 271f55a. Read-only review: no seed execution, database mutations, repository edits or commits.

## Verdict: FAIL — one P2 in QA fixture verification

### P2: conversation verification accepts arbitrary messages instead of the required fixture

Location: backend scripts/qa-social-seed.mjs, conversation loop near the final `page.items.length < thread.length` check.

Both normal mode and `--verify` fetch only the newest message page and validate its count. They never confirm the deterministic client_message_id, sender, body or video attachment of each expected fixture message. Reproduction: each of the four conversations exists and contains at least the expected number of unrelated messages, while the deterministic seeded messages are absent. The current `--verify` passes and prints the advertised fixture totals. Thus its PASS does not prove that the requested QA conversations or attached videos actually exist, nor does the second PASS independently prove idempotency. Conversely, once sufficient newer history is present, required records can be beyond page one.

Required correction: derive the expected deterministic IDs for each thread, traverse message keyset pages as needed, and validate every expected ID's sender/direction, normalized body and expected catalog video identity. Missing IDs, mismatching content and malformed/non-progressing pagination must fail. Add isolated mocked tests proving that unrelated same-count history fails, wrong attachments fail, matching fixture on later pages passes and no secret is printed. Preserve read-only verification with only its documented temporary login/logout sessions.

## Other reviewed paths

Frontend 95634fd changes presentation only: heading/count, accessible refresh button, loading animation with reduced-motion exception, explicit empty state and friends link. Existing account generation/read guard and pagination behaviour remain intact. No actionable MEDIUM+ in this UI delta; visual browser outcome not independently certified.

QA account lists remain fixed reserved local identities and the Docker project/database checks precede login. Existing nonempty ratings/reviews are preserved. The friendship transaction retains canonical UUID order, active/sync checks and bilateral block refusal. Follows use own-account idempotent PUT. Stable message IDs avoid duplicate sends on repeated seeding; this implementation property does not replace the missing verifier evidence above. Temporary successful logins are collected before lease acquisition, and finally requires successful logout before final PASS. No new destructive cleanup or broad account reset introduced.

Encryption plan correctly distinguishes irreversible password hashing from reversible authenticated encryption of chat payloads, keeps keys outside the database/Git and separate from existing credential keys, identifies AAD/nonce/key versions/rotation, covers migration and derivative storage, and explicitly states that existing storage remains plaintext. Frontend 271f55a does not expose keys or claim E2EE. No actionable MEDIUM+ in this requirement recording. Actual encryption, key lifecycle and migration safety require their own implementation review; this report does not certify encryption at rest.

## Independent checks

- pnpm test:api PASS 101/101; gated handwritten core lines/functions100.
- pnpm typecheck:api PASS.
- pnpm test:extension PASS 9/9.
- node --check scripts/qa-social-seed.mjs PASS.

No live QA seed or browser flow executed. Author-reported repeated live seed success and build results were not substituted for independent content validation.
