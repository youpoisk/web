# Runtime validator email follow-up — backend6a6cf5b / frontend9d166ce

Gate: PASS. Original P2 resolved; no additional findings in this delta.

The canonical IDL removes the narrower format=email assertion from User/Register while retaining bounded string/@/control-character wire constraints and explicitly documenting authoritative Go mailbox syntax/UTF8-byte validation. Accepted runtime account behavior is unchanged. Generated frontend mirror, types and standalone validators now accept the already-supported Unicode local-part and Unicode domain; WebCredentials still rejects extra refresh fields and all response validation remains enabled.

Reviewed backend normalization/contract regressions and frontend user/credential/request plus malformed-control regressions. Independently ran backend auth/business -race in a readonly-source no-network Docker container: PASS. Independently ran frontend api:check (types and validator regeneration drift), api:check-source and seven CSP runtime tests: all PASS. A separate synthetic trailing-control email probe was also rejected as intended.

No source edits, commits, real .env/secret reads or DB/stack changes occurred. Full builds/Redocly are author-verified rather than repeated; no SQL changed. This closes the validator prerequisite gate, leaving fetch/account-context/browser transport implementation open.