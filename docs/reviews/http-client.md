# Typed HTTP client review — cf2f0b9

Gate: changes requested (one P2).

## P2 — Enforce Unicode scalar strings on both JSON boundaries

Location: C:/repos/youpoisk-frontend/src/shared/api/client.ts:36 (safeNumbers) and parsed-response validation.

Fatal TextDecoder validates raw UTF8 bytes, but JSON escapes can still encode lone UTF16 surrogates. JSON.parse preserves those as invalid scalar strings, and the generated string schemas accept them. Independently reproduced getMe with a synthetic application/json own-user response whose name is escaped lone high surrogate: request succeeds and returns charCode0xd800. Requests with such strings likewise stringify to escaped surrogates instead of failing before fetch, whereas the backend shared JSON decoder rejects them.

Fix: extend recursive wire-value validation to reject unpaired high/low surrogates in string values and object keys before request serialization and after response parsing. Map input to invalid_input and response to protocol. Preserve valid astral surrogate pairs and legitimate U+FFFD. Add both-direction escaped/literal-invalid plus valid-emoji regressions.

## Other completed checks

Fixed-origin URL construction and validated path/query/header metadata prevent caller URL/header override. Credential-changing auth operations are excluded. Private/recovering state checks and captured owner+epoch checks reject cross-account late successes and errors; optional-auth reads do not silently downgrade recovering state. Fetch omits cookies, rejects redirects, disables cache/referrer and does not automatically retry. Input numbers are checked before stringify and after its copy; response size is bounded while streaming and unsafe integer/nonfinite values fail closed. Errors retain sanitized diagnostic/code/retry fields without copying sensitive messages/bodies. Timeout/abort/network classification and no-content/status/schema handling are covered meaningfully.

Independent read-only pnpm api:check passed. All15client/validator CSP tests passed with100% handwritten client lines/functions and96.67% branches. The Unicode mismatch was a separate synthetic readonly module probe; no real requests/accounts were used. Real browser CORS/blocked-cookie integration is future scope; native fetch behavior was inspected, not browser-tested. No source edits, commits, .env/secret reads or stack changes occurred.