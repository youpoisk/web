# Review: YP-096 «Оценки друзей» on the video page

Commits: 796f991 (contract import from backend c28a1b6), 33844ef (FriendRatingsPanel).
Reviewer: independent review, static plus node tests. No source files changed.

## Summary

The feature meets YP-096. A signed-in viewer on a server video page (`#/video/<11-char id>` with a backend card) sees a «Оценки друзей» panel in the aside. The panel lists each friend's name, @login, rating N/10 and date, with «Показать ещё» for more pages. When no friend rating is visible it shows exactly «Никто из друзей не оценил это видео». Guests and the local demo fallback get no panel and send no request. The contract is byte-identical to backend c28a1b6. Responses are checked by the generated validator. Stale responses and aborts are guarded in the same way as in VideoReviewPanel. There are no MEDIUM or HIGH findings.

## Findings

### HIGH
None.

### MEDIUM
None.

### LOW
- L1 `src/components/FriendRatingsPanel.tsx`, error line «Повторить» → `load(null)`. If a «Показать ещё» page fails, the retry reloads page 1 and replaces the items already shown, instead of retrying the failed cursor. Nothing is lost or duplicated, because page 1 is fetched fresh and `next` is reset. Still, a viewer who has paged deep is sent back to the start. Suggestion: on load-more failure, keep the items and let retry call `loadMore()`.
- L2 `src/components/FriendRatingsPanel.tsx` `load()`. The `catch` block treats every error the same way. A 401 (session expired or revoked), a 404 (the card was removed) and a network error all show the same text, «Не удалось загрузить…». VideoReviewPanel names the 401 case for writes. This is acceptable for a read-only panel. Noted for consistency.

### NIT
- N1 `FriendRatingsPanel.tsx` avatar `(it.user.name || it.user.login)[0]`. Taking the first UTF-16 unit splits a surrogate pair when a display name starts with an emoji or a non-BMP letter. The result is a lone surrogate in the avatar, shown as a replacement glyph. `[...s][0]` avoids this. The avatar is cosmetic and `aria-hidden`.
- N2 `FriendRatingsPanel.tsx`. There is no read serial like `readSerial` in VideoReviewPanel. Reads cannot overlap today, because the UI makes them single-flight. While a load runs, «Показать ещё» is disabled and the retry button is hidden: `error` is cleared at the start of every load. The `more` ref adds a further guard. A future UI change, such as an always-visible refresh, would need a serial.
- N3 `FriendRatingsPanel.tsx` `useEffect` deps `[client, videoId]` do not list `load`, so react-hooks/exhaustive-deps would warn. This is the same pattern as VideoReviewPanel, and the component is remounted by key, so it causes no bug.
- N4 The `setItems([])`/`setNext(null)` reset in the effect is redundant, because the parent remounts the panel through `key={user.id+':'+c.id}`. It is harmless.
- N5 `docs/task-log.md` correctly records "Browser check pending".

## Verified

- Contract: `git show c28a1b6:api/openapi.json` in youpoisk-backend, `contracts/openapi.json` in the working tree and the same file at 796f991 all have SHA-256 `64ed4db613debab7f3d48b1a7b4b02e37f8a429a3de8d5f010da1c2e09f457f3`, so they are byte-identical. `contracts/source.json` records the commit c28a1b6185557ba396e55d0e517655b85717342a and the same sha256. The contract has 30 operations, and tests/validators.test.mjs now asserts 30. The new operation is `listFriendRatings` at GET /v1/me/videos/{id}/friend-ratings with Bearer auth, uuid id, `after` ≤128 and `limit` 1..100. FriendRatingPage holds `items` (≤100) and an optional `next_cursor`. FriendRating holds a user {id uuid, login 1..32, name string|null 1..100}, a rating integer 1..10 and rated_at as date-time. All have `additionalProperties:false`.
- Validators: the generated `schema_FriendRatingPage` accepts a valid page and rejects `rated_at:'garbage'`, `rating:11` and `name:''`, checked with node. `ApiClient.request` validates every response, including the status and Content-Type, and throws `protocol` on any mismatch. As a result the panel only receives schema-valid data: a valid date, rating 1..10 and a non-empty login.
- `loadFriendRatings` (lists.ts) sends `{limit:20}` plus `after` only when a cursor exists, passes the AbortSignal, and maps `next_cursor ?? null`. It has a unit test, and lists.ts has 100% line and function coverage.
- Render conditions (main.tsx, server card branch):
  - The panel renders only when `authView.status==='authenticated' && apiClient`. It is keyed by `authView.user.id+':'+c.id`, the same key VideoReviewPanel uses, so switching account or video remounts it and aborts the old request.
  - `videoId={c.id}` is the internal card UUID, which matches the uuid path parameter, not the YouTube id.
  - Guests never mount the panel, so no `/me/` request and no Authorization header is sent from it.
  - The local demo fallback branch (`current`) does not render the panel. This is correct, because demo videos have no server id.
  - The panel sits inside `<aside>` under the rating panel.
- States:
  - The initial value of `loading` is true, so the empty text never flashes before the first response.
  - Loading text appears only while there are no items yet.
  - The error text comes with a retry button.
  - The empty text requires `!loading && !error && items.length===0`. Its wording matches the requirement exactly, with no trailing period.
  - «Показать ещё» appears only when `next` exists and is disabled while loading.
- Stale and abort handling:
  - A generation counter is bumped on effect start and on cleanup. Results, errors and `loading` updates are applied only when the generation stamp still matches.
  - The AbortController is aborted on unmount or key change, and errors are suppressed when `signal.aborted` is set.
  - Load-more has a re-entry guard (the `more` ref) and requires a non-null `next`.
  - Appended pages are deduplicated by `user.id`. The API returns one rating per friend, so this guards against keyset overlap.
  - Load-more calls run without a signal but are dropped through the generation check after unmount.
- Hooks rules: all hooks are unconditional and at the top level. The conditional render is in the parent.
- XSS: user-supplied name and login are rendered only as React text nodes. There is no `dangerouslySetInnerHTML`, `href` or `src` built from user data.
- Date: `new Date(rated_at).toLocaleDateString('ru-RU')` on a validated RFC 3339 date-time shows the viewer's local calendar date, for example 21.11.2026.
- Accessibility:
  - The panel sets `aria-busy` while loading and has a heading «Оценки друзей» (h3, like the sibling rating panel).
  - Loading and error messages use `role="status"`, and the retry and load-more controls are real `<button>` elements.
  - The decorative avatar is `aria-hidden`.
  - The rating is read as text, for example "9/10".
- CSS: one scoped rule for `.friend-ratings`. It reuses the existing `person-line`, `avatar` and `small-avatar` classes.
- Tests: `node --experimental-test-coverage --test tests/*.test.mjs` gives 80 tests, 80 pass and 0 fail. lists.ts and client.ts have 100% line and function coverage.

## Not verified

- `pnpm build` and `tsc`. The reviewer cannot run pnpm here. The PASS result is as reported by the author.
- Browser behaviour, including an actual check of `#/video/ber1ap2V868` signed in or as a guest, the layout, the screen-reader output and the real network requests. No browser check was done by the author or by the reviewer.
- The component has no render or unit tests. The panel's state logic was reviewed statically only.
- Backend behaviour, such as friend and privacy filtering or cursor ordering, beyond what the contract describes.

Gate: PASS
