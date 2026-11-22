# Review: YP-083.2 reports and moderation UI (frontend commit e72374c)

Reviewer: independent read-only review. Scope: `src/components/Moderation.tsx`, `src/main.tsx` (`#/moderation` route, sidebar link, keys), `src/components/Messages.tsx`, `src/components/UserProfilePage.tsx`, `src/shared/library/lists.ts`, `src/style.css`, `tests/lists.test.mjs`, `tests/validators.test.mjs`, DEC-WEB-029 in `todo.md`. Contract: `youpoisk-backend/api/openapi.json` (backend 270e5cd).

## Gate: FAIL

One MEDIUM finding: the confirm step for irreversible decisions (suspend in particular) has no in-flight state. «Отмена» stays enabled while the request is running, so the screen can show "cancelled" when the decision has already been applied. Everything else is LOW.

## Verification

- `test:api` run directly with node 22.23.5: 99/99 pass. Coverage for `lists.ts`: 100% lines, 99.59% branches, 100% functions. The 100% line/function claim holds. Note that it covers only the thin helpers; `Moderation.tsx` has no tests (see LOW-9).
- `contracts/openapi.json` is byte-identical to backend `api/openapi.json`. The validators test count went from 58 to 63 (+5 operations: createReport, getStaffRole, listReports, resolveReport, listModerationAudit).
- `tsc` was not run: there is no `node_modules/typescript` on this machine. This is an environment limit, not a finding.
- Contract use is correct. `listReports` sends `status` (open/dismissed/actioned), `limit=30` and an opaque `after`. `createReport` handles 201 and 200 through the `created` flag (both responses are declared and validated). `details` is left out when blank; the server trims it as well. `hide` is offered only for `target_kind === 'review'`; the server returns 422 otherwise. 403/409/422/429 get distinct messages in `reportError`/`moderationError`.
- Rights are server-enforced. The UI only hides controls: the audit tab is shown to admins only (server 403 otherwise), and the page and link are shown only after `GET /v1/me/role` returns a role. Every list and resolve call is checked by the server, and nothing is unlocked on the client alone. A 403 from list/resolve shows «Недостаточно прав…».
- Account switch: `apiClient` is a module-level singleton (`main.tsx:15`, `session: () => …`). `ModerationRoute` is keyed `user.id+':moderation'` and `ModerationLink` is keyed `user.id+':modlink'`, so a switch remounts both. `useStaffRole` aborts the old request and drops late answers (`live` flag). The old account's role and queue cannot leak into the new one.
- Sibling keys in `main.tsx`: both new keys are unique. The route sits in a ternary chain (a single element), and the link sits in a non-array fragment. No duplicate-key regression.
- Generation guards: the view/client effect bumps `generation` and aborts. `load` and `resolve` drop results whose stamp is stale. "Load more" is deduplicated by `id`. Switching views while a load is running cannot mix lists.
- Text safety: everything is rendered as React text, with no `dangerouslySetInnerHTML`. Reporter `details`, review text and message body are wrapped in `<bdi dir="auto">`.

## Findings

### MEDIUM-1: confirming a decision has no pending state; «Отмена» appears to cancel a suspend that is still applied
`src/components/Moderation.tsx:68-78` (`resolve`, guarded only by `busy` ref), `:97-100` (confirm buttons with no `disabled`, no «Выполняем…»).

`busy` is a ref, so nothing re-renders when the request starts. «Подтвердить» and «Отмена» stay enabled, and the label does not change. The result notice is the persistent `<p role="status">` at the very bottom of the section (`:107`), far from the item.

Failure scenario: a moderator on a slow connection clicks «Подтвердить» under «Заблокировать @x? … вернуть доступ может только оператор». Nothing visibly changes, so they click «Отмена». The confirmation box closes (`setConfirm(null)`), which looks like a cancel. The suspend request still completes, the account is disabled and all its sessions are revoked, and only then does the report disappear. The real outcome is in a status line below the list, possibly off-screen.

A second variant: while the first request is running, the moderator opens another report's confirm and clicks «Подтвердить». `busy.current` makes this a silent no-op. The box stays open and no message explains why.

For an irreversible action, the UI must not present "cancelled" while the request is in flight.

Fix: keep `busy` in state as well, or track the report id being resolved. Disable both confirm buttons (and the action buttons) while it runs, and show «Выполняем…». Show the success or error message next to the item, or move focus to the notice.

### LOW-1: a 409 "already resolved" leaves a dead-end item
`Moderation.tsx:76`, `lists.ts` `moderationError` 409. When another moderator has already resolved the report, the item stays in the «Открытые» list with its confirm box open. The message says «Обновите список», but there is no refresh control in the open view: «Повторить» exists only in the error state. The moderator has to switch tabs or reload the page. Suggestion: on 409, drop the item (or reload the first page) and show the message.

### LOW-2: a first-page reload can bring back a report that was just resolved
`Moderation.tsx:83` (retry `load(null)`), `:58`, `:74`. When an error is shown, the stale items are still rendered with active decision buttons. `resolve` does not check `loading` and does not bump the generation. If «Повторить» runs `load(null)` while a resolve is in flight, the server's page may be a snapshot taken before the resolve. It then replaces `items` (no dedupe on `after=null`) and the resolved report comes back as open. The next click gets 409 (LOW-1). Also, «Повторить» after a failed «Показать ещё» throws away the pages already loaded.

### LOW-3: a failed role check looks like "not staff", with no retry
`Moderation.tsx:115`, `:125`. Any error from `getStaffRole` (network, 5xx, 429) becomes `role: null`. A real moderator on `#/moderation` then sees «Раздел доступен только модераторам.» with no retry, and the sidebar link disappears. Suggestion: tell "role is null" apart from "check failed" and offer «Повторить».

### LOW-4: tabs semantics are incomplete
`Moderation.tsx:81`. The tabs have `role="tablist"`/`role="tab"`/`aria-selected`, but there is no `role="tabpanel"`, no `aria-controls`/`aria-labelledby`, no roving `tabindex` and no arrow-key handling. Screen readers announce tabs that do not behave like tabs (the APG tabs pattern). Either complete the pattern, or drop the roles and use plain buttons with `aria-pressed` (or links/`aria-current`).

### LOW-5: report form focus and announcements
`Moderation.tsx:25-31`.
- Clicking «Пожаловаться» unmounts the focused button. Submitting or «Отмена» unmounts the form. Each time focus falls to `<body>`, so a keyboard user loses their place in the chat or profile. Move focus to the select when the form opens, and back to the trigger or the status when it closes.
- The `role="status"` span is mounted at the same moment its text appears (`notice && …`), so some screen readers (NVDA/JAWS with some browsers) do not announce it. `ModerationPage` already uses the right pattern: a status element that is always rendered.
- After a failure followed by «Отмена», the error notice stays shown next to the re-shown trigger.

### LOW-6: `<form>` inside `<p>` on the profile page
`src/components/UserProfilePage.tsx:61` wraps `ReportButton` in `<p>`, and `ReportButton` renders a `<form>`. That is invalid HTML nesting. React's DOM nesting validation warns («<form> cannot be a descendant of <p>»), and SSR/hydration would break. Use a `<div>`.

### LOW-7: messages for an existing report and for 429
- `Moderation.tsx:20`: `created: false` always says «Жалоба на рассмотрении», even when the returned `status` is `dismissed` or `actioned`.
- `lists.ts` `reportError`/`moderationError` 429: `ApiError` already carries Retry-After seconds, but the messages hard-code «через минуту».
- 422 from `createReport` also means "own content" according to the contract, but the message only says «Проверьте причину и комментарий». This is unreachable from the current entry points (own messages and own profile are hidden), so it is minor.
- 403 on suspend (target is staff, or oneself) shows the generic «Недостаточно прав для этого действия».

### LOW-8: queue states after decisions
- `Moderation.tsx:84`, `:106`: after resolving every visible item, «Жалоб нет.» is shown together with «Показать ещё» when `next` exists.
- After suspending a user, other open reports about the same user still show the old `target_user.status` and offer «Заблокировать аккаунт» again.
- A resolve that finishes after a view switch is dropped with no notice (`:73`), even though it was applied.

### LOW-9: tests do not cover the component logic
`tests/lists.test.mjs` covers only the request shapes and error-message mapping. Nothing tests the parts this review relies on: role gating and the account-keyed remount, generation guards (a view switch during a load, a late resolve), the double-submit guard, the confirmation flow, and 409 handling. The 100% line/function figure is accurate for `lists.ts`, but it says nothing about `Moderation.tsx`. The tests also do not assert that `signal` is passed through by `loadStaffRole`/`loadReports`/`loadAudit`.

### LOW-10: some user-controlled strings are not isolated for bidi
`Moderation.tsx:40`, `:90`, `:98`, `:103`. Logins in `person()` are not in `<bdi>` (`StaffUser.login` has no pattern in the contract), and neither is the review video title. That includes the confirmation sentence «Заблокировать {login}?». An RTL login or title can visually reorder the surrounding Russian text, for example the « · скрыта» suffix or the question mark. Wrap them in `<bdi>`.

## Notes (no finding)
- Two `getStaffRole` requests go out on `#/moderation` (one from the link, one from the route). This is acceptable; it could be lifted into one hook if desired.
- Every incoming message in the chat gets its own «Пожаловаться» text button. This is visually busy but works; consider a per-message menu later.
- Reporting reviews is deferred until public models expose review ids, as stated in DEC-WEB-029.

## Follow-up: commit 3c3acd9 ("fix(moderation): busy state on decisions; report reviews from the feed")

### Gate: PASS

MEDIUM-1 is fixed. No MEDIUM or higher finding remains or was introduced. The remaining items are LOW.

### Verification
- `test:api` run directly with node 22.23.5: 99/99 pass. `lists.ts` coverage: 100% lines, 99.59% branches, 100% functions.
- `contracts/openapi.json` is byte-identical to backend `api/openapi.json` (backend 311f5dc). `source.json` is updated. `review_id` (`string|null`, uuid, required) was added to `FeedItem` and `Recommendation` only. No new operations, so the validators count stays at 63.
- `tsc` was still not run (no TypeScript in `node_modules` on this machine).

### Status of earlier findings
- **MEDIUM-1: fixed.** `Moderation.tsx:47,70,81,104-105`: `saving` is now state. While a decision is in flight, «Подтвердить» shows «Выполняем…» and both confirm buttons are disabled, so «Отмена» can no longer look like a cancel. A status line inside the confirmation box (`role="status"`, rendered empty first and then filled) reads «Решение отправляется…». A second confirm can no longer be a silent no-op, because its button is disabled.
- **LOW-1: fixed.** `:80`: a 409 removes the report and closes the confirmation. «Обновить» was added (`:86`, disabled while loading or saving).
- **LOW-2: partly fixed.** «Обновить» is disabled while a decision is saving, but the opposite race remains (see residual R2). With the 409 fix the effect is benign: the reappeared item disappears on the next click.
- **LOW-3: fixed.** `:117-134`: `useStaffRole` tells a failed check from a null role. `ModerationRoute` shows «Не удалось проверить доступ.» with «Повторить», and the retry resets `loading`. The sidebar link stays hidden on failure, which is acceptable.
- **LOW-4: open, recorded** in DEC-WEB-029 (tabpanel and arrow keys).
- **LOW-5: mostly fixed.** The status element is always rendered (`:31`), and «Отмена» clears the notice (`:29`). Focus management is still open and recorded.
- **LOW-6: fixed.** `UserProfilePage.tsx:61` now uses `<div>`.
- **LOW-7: mostly fixed.** A repeat report reports its real status (`:20`). The Retry-After text is open and recorded. The 403-on-suspend wording is unchanged and not recorded (trivial).
- **LOW-8: open, not recorded in todo.md.** «Жалоб нет» shown next to «Показать ещё»; stale status on other reports about a suspended user; a late resolve after a view switch is dropped with no notice.
- **LOW-9: open, recorded** (component tests).
- **LOW-10: fixed.** `person()` wraps logins in `<bdi>` (`:40`), and the review title is in `<bdi>` (`:95`).

### New code: review reports
- `FeedList.tsx` `FeedAuthor` shows «Пожаловаться на рецензию» when `review_id` is present. It is shared by the grouped and single modes, keyed by `user.id` within a card, and it is not nested in `<p>`. Per the contract, the feed contains only friends and followed authors, never your own items, so the own-content 422 cannot be reached.
- `UserProfilePage.tsx:77` shows the button only when `profile.relation !== 'self'`. This also covers the owner-only view of hidden reviews. `review_id` is null whenever no review text is shown, and the button is gated on it.
- The server still decides whether a target can be reported (404/422 are mapped).

### Residual LOW findings
- **R1:** `Moderation.tsx:97-101,74`. While a decision is saving, the decision buttons on *other* reports stay enabled. Opening another report's confirmation hides the in-flight indicator of the first one. When the first request succeeds, `setConfirm(null)` closes the confirmation the moderator just opened. Nothing is applied without confirmation (the new «Подтвердить» is disabled while saving), but the feedback can be confusing. Suggestion: disable all decision buttons while `saving`, and clear `confirm` only if it still targets `target.report.id`.
- **R2:** `:86,88,58` and `:97-104`. Decisions stay enabled while «Обновить»/«Повторить» reloads the first page. A response that left the server before the resolve can bring the resolved report back. The next click removes it with a 409 message, so the impact is cosmetic.
- **R3:** LOW-8 items are not listed among the open LOWs in DEC-WEB-029. Consider recording them.
