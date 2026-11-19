# Standalone runtime validators review — f0f896e

Gate: changes requested (one P2).

## P2 — Align email validation with accepted backend account identities

Location: C:/repos/youpoisk-frontend/scripts/validators.mjs:20 (addFormats), generated schema_User / schema_Register email validators; source contract User/Register email format.

ajv-formats uses an ASCII-oriented email regex while the existing backend accepts a broader net/mail.ParseAddress policy. Independently confirmed using synthetic data: backend auth.normalize accepts тест@example.com, but the generated schema_User rejects the same otherwise-valid own-user response. Once transport consumes these validators, existing valid accounts cannot accept login/profile responses, despite correct credentials. Current tests only exercise ASCII addresses and miss the narrowing.

Fix the canonical contract's email envelope to reflect the chosen server policy rather than changing accepted product behavior to fit a generator. A bounded string envelope with documented authoritative server semantic validation is acceptable; preserve full credential response validation. Regenerate mirror/types/validators and add Unicode local-part and Unicode-domain regressions across the backend contract and frontend validators.

## Completed checks

Read generator, pinned build-only dependencies, standalone exports/operation metadata and tests. Contract integrity/internal-ref checks run before compilation. Generated bundle is self-contained with Ajv standalone functions, no dynamic schema compilation at runtime, and meaningful secret/impossible-state/metadata tests. All19implemented operations have request/response metadata; independent pnpm api:check regenerated-to-memory and matched committed artifacts. Independent pnpm test:api passed6/6 under --disallow-code-generation-from-strings. Windows deterministic output was verified; Linux CI/platform output was inspected by generation options, not independently run.

The email mismatch was independently reproduced with a readonly-source disposable backend container and a readonly frontend module import; no real accounts/data were used. No source edits, commits, environment reads or database/stack changes occurred. Safe-integer/account-context/fetch integration remain future transport requirements as explicitly scoped; they are not claimed completed here.