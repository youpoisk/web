# Typed HTTP client follow-up — 274b756

Gate: PASS. Original Unicode P2 resolved; no additional findings in this delta.

safeWireValues now rejects lone UTF16 surrogates in string values and object keys, before request serialization and after response parsing; existing nonfinite/unsafe integer protection remains intact. The Unicode-mode character class matches lone surrogate codepoints while valid astral pairs and U+FFFD remain accepted. Request failures map to invalid_input; malformed response strings/keys map to protocol. The additional own-property operation guard rejects prototype names before metadata lookup.

Independently ran read-only api:check and test:api: all16CSP tests pass, handwritten client100% lines/functions and96.75% branches. Tests cover both high/low surrogates on request/response, arbitrary error-field keys, emoji/U+FFFD controls and prototype operation rejection. No source edits, commits, real requests/accounts, .env reads or stack mutations occurred. Author-reported build/runtime smoke was not repeated; browser broker/client UI remain subsequent scope.