# Independent review — password change via API-origin page (YP-047)

Scope: backend `8e9375f` (branch codex/mvp-implementation) and frontend `df7a1da` (branch codex/mvp-integration).
Reviewer: independent, read-only. Date: 2026-11-22.

## Gate: PASS

No HIGH or MEDIUM findings. Five LOW findings below; none blocks merge.

## Verification run

- Backend `node --test internal/transport/httpapi/broker/broker.test.js`: 35/35 pass.
- Frontend `test:api` command line (node, 100% line/function thresholds): 96/96 pass, exit 0.
  session.ts 100% lines / 99.27% branches / 100% funcs; runtime.ts 100/100/100. The 100% line+function claim holds.
- Go tests (`broker_test.go`) NOT run: `go` is not installed in the review shell. Checked by reading only.
- `scripts/auth-e2e.mjs` not run (needs a live stack); new checks read as correct (200 + CSP `form-action 'none'` for a registered callback, 400 with no Location for an unregistered one).

## What was checked and holds

- Open redirect: `/auth/password` goes through `validLogoutQuery` (exactly `redirect_uri` + `state`, registered callback, `state` must decode as 32 bytes). An invalid request gets 400 text and never redirects. `finish()` only adds params to the validated `redirect_uri`. On the site, `returnHash` comes from per-tab sessionStorage and must start with `#/`, so it stays same-origin.
- Forged return (`?password=changed&state=…` from an attacker link): without this tab's saved nonce, `#capturePassword` returns null. Scope, credentials and mock data stay as they are, and the normal silent restore runs. A duplicate `password`/`state` value, an unknown outcome or a damaged record is rejected too (all tested). Every outcome needs the nonce from per-tab sessionStorage, so another tab or site cannot supply it.
- Clickjacking/CSRF: the `/auth/*` responses set `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `form-action 'none'`, `Referrer-Policy: no-referrer`, COOP same-origin, `no-store` and `nosniff`. GET/HEAD only. The form can't post anywhere (`form-action 'none'`, preventDefault plus fetch). The page only works as a top-level window. Loading it does a cookie restore, which `/auth/authorize?intent=restore` already allows, so this adds no new exposure.
- Lock usage: the restore (`refreshAccess`) runs under the exclusive `yp.broker.cookie.v1` Web Lock, on load and on the single 401 retry. `POST /v1/me/password` runs outside the lock (the test asserts exactly one lock acquisition). The attempt-id/proof persistence path is unchanged. The password POST does not set or read the cookie, and the server deliberately does not clear the cookie on 204. So the rotation and attempt-proof logic is not touched.
- 401 handling: one restore, then one repeat of the POST. A second 401, or a restore that returns null, gives up with `session`. A network failure during that restore happens before the second POST is sent, so the code correctly shows "no connection", not "uncertain" (tested).
- Uncertain outcome: a fetch rejection or timeout after the POST was sent shows the "uncertain" message, and the return button is relabelled to `uncertain`. Nothing retries automatically. The server change is atomic (hash + revoking all families in one commit, per `business/password.go` and `credentials/service.go`).
- 422 mapping: `incorrect_current_password` and `invalid_new_password` keep the page and the session. A short or long current password maps to ErrCurrent on the server, so the messages are accurate.
- Password confidentiality: values only go into the JSON body of the same-origin `/v1/me/password` POST (`referrerPolicy: no-referrer`, `redirect: 'error'`). They are never logged, never stored and never put in a URL. The site never sees them.
- sessionStorage notice `yp.boot.notice`: only the site's own origin can write it (only an XSS could inject, and an XSS already wins). It is rendered through `notify` → `{toast}` as a React text node, not HTML. It is written only on the guest + reload path, and read and removed once on mount.
- Cancel path: `cancelled` with a valid nonce changes nothing. The URL is replaced with `callback#/settings`, and `bootAuth` then performs the normal silent restore with `route(location.hash)` (live getter). The user lands back on Settings.
- main.tsx: the button shows only when signed in, and is guarded by `authBusy`. No new lists or keys. Existing scoped keys are unchanged. No regressions spotted.

## Findings

### LOW-1 — After "uncertain" the form stays submittable; a manual resubmit gives a misleading outcome
`youpoisk-backend/internal/transport/httpapi/broker/broker.js:285-289` (with `domUI.problem` at :399-405, which does not hide `password-form`).
After a lost response the page shows the uncertain message, but the filled form and its submit button stay enabled (`busy(false)` in `finally`). The code never retries automatically, but it invites a manual retry. Scenario: the first POST was committed but the response was lost. The user presses «Сменить пароль» again → 401 (all sessions revoked) → the restore returns null → `back('session')`. The site then shows «Сессия завершилась. Войдите снова, чтобы сменить пароль», which suggests the password was not changed, although it was. The user then tries the old password and fails. The reverse also happens: if the resubmit gets 422, the cancel button still says "uncertain", and the site signs out locally although the session is alive and the password is unchanged.
Fix: after uncertain, hide or disable the form (show only the problem and the return button), or use a dedicated `uncertain` panel.

### LOW-2 — 5xx from a proxy, or an unexpected 2xx, after sending is not treated as uncertain
`broker.js:284` and `:291`.
Only a fetch rejection counts as uncertain. A 502/504 from a reverse proxy, or a load balancer timeout after the commit, shows «Сервис временно недоступен. Повторите чуть позже.», and the cancel button still returns `cancelled`. Scenario: the change commits, the proxy answers 504, and the user clicks «Вернуться на сайт без смены пароля». The site keeps its local signed-in view while the server has revoked everything. The next API call gets 401, then recovery, then guest, with no notice saying why. The user may also believe the change failed. The same applies to an unexpected 200 (tested only as "protocol").
Fix: treat 5xx gateway responses (502/503/504 without a structured error code) and non-204 2xx after the request was sent as uncertain, or at least switch the cancel to `uncertain` in those cases.

### LOW-3 — A second 401 after a successful restore reports `session` although the cookie session is alive
`broker.js:276-279`.
If the restore succeeds (the family is alive and just rotated) but the repeated POST still gets 401 (for example an access/epoch race), the page returns `session`. The site then ends the local sign-in and says «Сессия завершилась». The next «Войти» silently continues from the live cookie, so the message is inaccurate. Self-healing, no security impact.
Fix: map this case to a protocol/unavailable problem on the page instead of `session`, or accept it and document it.

### LOW-4 — A predictable nonce when `getRandomValues` fails now gates a local sign-out, not just a notice
`youpoisk-frontend/src/shared/auth/session.ts:117-120` and `:127` (fallback asserted in tests/session.test.mjs).
`#nonce()` falls back to `'A'.repeat(43)`. For logout the comment is right that it "only gates a notice". For password mode a valid nonce clears the local scope and mock data and signs the tab out. Scenario: a browser where `crypto.getRandomValues` throws (and `randomUUID` works) starts a password change. A crafted `callback?password=changed&state=AAAA…` link opened in that tab before the real return signs it out locally and shows a false «Пароль изменён». The server session is unaffected. Impact is a local nuisance with very unlikely preconditions.
Fix: in `passwordURL` throw `FlowError('crypto')` instead of using the placeholder.

### LOW-5 — Any return carrying `password` consumes the nonce before validation
`session.ts:140`.
`removeItem` runs before the comparison. If any `?password=` URL loads in the tab while a change is in progress (stale history entry, crafted link), the genuine return that follows is treated as forged. Scenario: a genuine `changed` return then shows no notice and does not demote the scope. The tab stays "authenticated" locally until the first 401 sends it through restore → `login_required` → guest. Fails safe, but the "Пароль изменён" notice is lost.
Fix: optional. Remove the key only when the state matches, or accept it as is (it is single-use either way).

## Test adequacy

Good coverage of the happy path, mismatch, both 422 codes, 401→refresh→success, 401 twice, restore null, lost response vs. failure before sending, busy/unavailable/protocol, retrying a failed restore, the lock count, and every frontend nonce/forgery/duplicate/damaged/cancel branch. Gaps: no test for resubmitting after uncertain (LOW-1), for 5xx after sending (LOW-2), for main.tsx's `yp.boot.notice` round trip (no UI test harness), or for the Go handler in this environment (not runnable here).

## Follow-up — fixes 3d404b6 (backend) and 804b297 (frontend), 2026-11-22

### Gate: PASS

The fixes introduce no MEDIUM or HIGH issues. LOW-1, LOW-2 and LOW-4 are resolved. LOW-3 and LOW-5 stay open by decision (recorded in todo.md).

### Verification
- Backend `node --test internal/transport/httpapi/broker/broker.test.js`: 35/35 pass.
- Frontend `test:api` command line: 96/96 pass, exit 0. session.ts 100% lines / 99.29% branches / 100% funcs; runtime.ts 100/100/100. The 100% line/function thresholds still hold.

### Resolution of earlier findings
- **LOW-1: resolved.** `broker.js` `passwordDone()` sets `handler = null` and hides `password-form` on an uncertain outcome. The test confirms the form is hidden and a later submit sends nothing. The cancel button stays visible and is re-enabled by `busy(false)` in `finally`, and it returns `uncertain`.
- **LOW-2: resolved.** After the request is sent, any failure except `busy` (429) is uncertain: lost response, any 5xx including 502/504, unexpected 2xx/4xx. `sent` is still reset to false around the 401 restore, so a failure during that restore (before the second POST) is not reported as uncertain. The test matrix covers 429 (form kept), 503, 502 and 200 (uncertain, form closed).
- **LOW-4: resolved.** `passwordURL` now throws `FlowError('crypto')` when `getRandomValues` fails. `runtime.changePassword` catches it and shows «Не удалось открыть смену пароля…» without navigating. Only logout keeps the fixed placeholder, where the nonce gates only a notice. Tested.

### New observation (LOW, no action required)
- **F-1 — a definite pre-commit rejection is now reported as uncertain.** `broker.js` catch block (`sent && kindOf(problem) !== 'busy'`). A structured 4xx (400 `invalid_json`, 403, 409 snapshot conflict, 413/415), or a 503 admission refusal sent before the handler commits, proves the password was not changed. It is still shown as uncertain: the form closes and the site ends the local sign-in. Scenario: admission returns 503 under load → the user is told to sign in again and «если смена прошла, подойдёт новый пароль» → the old password works. This fails safe (an extra sign-in, no wrong state) and follows the conservative choice in the fix. Optional refinement: keep the form for 4xx responses that carry a structured `code` that is known not to commit.
