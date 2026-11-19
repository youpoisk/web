# Frontend contract review — 3000bbd

Gate: changes requested (two P2 findings).

## P2 — Require the imported contract to exist in the recorded backend commit

Location: C:/repos/youpoisk-frontend/scripts/contract.mjs:22

`git diff --quiet HEAD -- api/openapi.json` ignores untracked files. A checkout whose HEAD contains no contract can therefore import an untracked file and emit a manifest claiming that unrelated HEAD as its provenance. Independently reproduced using a staging-only backend with tracked.txt committed and an untracked copy of OpenAPI: diff exits0, copied importer exits0 and generates manifest/types; git ls-files --error-unmatch confirms the contract is untracked.

Fix: read api/openapi.json directly from the recorded commit using git show (which fails when absent), compare normalized committed bytes with working-file bytes, and only then write the mirror/manifest. Add untracked/unrelated-HEAD and changed-working-file regressions.

## P2 — Reject external schema references before generator resolution

Location: C:/repos/youpoisk-frontend/scripts/contract.mjs:41

The importer/checker forwards parsed JSON into openapi-typescript without restricting references. An external relative $ref successfully reads a local schema outside the pinned mirror, so the generated result depends on unpinned local data and can trigger file/network resolver access. Independently reproduced with harmless external.json in staging: the copied importer exits0 and generated types contain LOCAL_SCHEMA_SENTINEL loaded from that external file. The mirror SHA256 does not cover this dependency. The backend contract gate already requires internal-only references, but the frontend does not preserve that boundary itself.

Fix: recursively validate internal-only references before generator invocation and before import writes. Reject external $ref/$dynamicRef and rebasing $id values (or explicitly implement safe internal resolution). Apply the same guard to import/check/generate/check-source. Add negative file/relative/network reference fixtures and assert rejection does not alter mirror/types.

## Completed checks and limits

Read provenance manifest, generator script, pinned dependency/lockfile, generated types, CI/build commands and honest partial-UI documentation. Mirror integrity/deterministic generation and explicit non-live UI scope otherwise follow the intended slice. Independently ran read-only pnpm api:check and api:check-source against the real backend: PASS. Existing extension tests passed9/9. Full build was not independently rerun because review is read-only and build emits artifacts; author reports build success.

All negative import probes executed copied scripts in isolated writable PDC staging repositories. No real frontend/backend source, .env, secrets or Docker stacks were modified/read. One initial combined probe was rejected by automatic approval review due an ambiguous frontend working directory; it executed nothing, and subsequent probes used explicit absolute staging paths. Reports and harmless fixtures are under staging only.