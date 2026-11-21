# Review: friend requests UI (219209a, c9fcae3)

## Summary

219209a imports backend contract f2a9935 byte-identically (42 operations). c9fcae3 adds people search, incoming/outgoing request lists and friend removal on `#/friends`, plus a loading placeholder on `#/feed`. The actions match each relation and direction, and match the backend semantics: a counter-request shows "waiting for your answer" and is not accepted automatically. 404 and 409 are handled where the backend returns them. Double clicks are guarded, stale responses are dropped (debounce, abort and a generation counter), components are keyed per viewer, and output is escaped by React. No HIGH or MEDIUM issues. The LOW items are about state between sibling components, how live-region messages are announced, and edge cases in input normalisation.

## Findings

### HIGH
None.

### MEDIUM
None.

### LOW
- **L1 `src/main.tsx` (/friends «Все» branch): search relation goes stale after removing a friend.** `PeopleSearch` and `FriendsList` render side by side and keep separate state. If you remove a friend in «Мои друзья» on the «Все» tab, a visible search result for that person still says «У вас в друзьях» and offers no «Добавить в друзья» until the query changes. Fix: lift relation updates into the parent, or have the search re-run its query after a removal.
- **L2 `src/components/FriendRequests.tsx` FriendRequestsList, error «Повторить»: retry always calls `load(null)`.** If a «Показать ещё» page fails, the retry reloads page 1 and replaces the list, so pagination progress is lost. `FriendsList` already keeps `failedAfter` for this case; the new list does not.
- **L3 `FriendRequests.tsx` / `FriendsList.tsx`: action messages may not be announced.** The `{message && <p role="status">…}` live regions are added to the DOM together with their text. Several screen readers do not announce a live region that appears with its content already in it. Fix: keep an always-mounted `role="status"` element and change only its text. The same applies to the search «Ищем…» and error lines. This follows the existing pattern in the codebase, so it is not a regression.
- **L4 `src/main.tsx` /friends: the "sign in" notice flashes while auth is loading.** The commit fixes this flash for `/feed`, but `/friends` still shows «Войдите, чтобы увидеть своих друзей.» while `authView.status` is `loading`/`redirecting`. This existed before the commit; it is listed here only because the same fix was made for `/feed`.

### NIT
- **N1 `src/shared/library/lists.ts` searchPeople:** `text.trim().slice(0, 50)` cuts by UTF-16 code units. An astral character (such as an emoji) at position 49–50 is split into a lone surrogate, the URL encoding then throws, and the user sees «Не удалось выполнить поиск.». The pre-check in `PeopleSearch` counts code points without NFC normalisation, while the backend's `peoplePattern` applies NFC, collapses whitespace and limits to 2–50 runes. A decomposed 2-code-point input can therefore pass the frontend check and get 422 back. Fix: slice with `[...s].slice(0, 50).join('')`.
- **N2 `src/main.tsx` /feed loading branch:** `<p className="muted">Загружаем…</p>` has no `role="status"`, unlike the other loading lines.
- **N3 `FriendRequests.tsx` PeopleSearch:** old results stay clickable during the 300 ms debounce and the following request, with only «Ищем…» shown above them. They are still valid users, so nothing breaks, but it can be confusing.
- **N4 `FriendRequests.tsx` PeopleSearch send():** for `status === 'incoming'` the UI points to the «Заявки» tab. That matches the backend (no auto-accept). An inline «Принять» using the returned `request.id` would save a step; this is optional.
- **N5 `FriendsList.tsx` confirmRemove:** `window.confirm` blocks the page and has a fixed look, but it is acceptable here. Treating a missing `window` as confirmed only affects non-browser environments (the component is never server-rendered).

## Verified
- `contracts/openapi.json` at 219209a has the same sha256 as backend `api/openapi.json` at f2a9935: `fdfab25a…1c61c`. `contracts/source.json` records that commit and hash. The contract has 42 operations, and `tests/validators.test.mjs` was updated from 37 to 42.
- The helpers map to the right operations and bodies: `sendFriendRequest {user_id}`, `acceptFriendRequest path id`, `deleteFriendRequest`, `deleteFriend path id = user id`, `listFriendRequests direction/limit 30/after`, and `searchPeople q (≤50) limit 20`. The limit values are within the contract bounds (≤100 and ≤50).
- Actions per relation: `none` → «Добавить в друзья». `self`/`friend`/`incoming`/`outgoing` show a status text and no button. Incoming requests offer accept/decline; outgoing requests offer cancel only, which matches accept being recipient-only.
- State after actions: search maps `created|exists` → outgoing, `incoming` → incoming, and 409 → friend. Request lists remove the item after accept/decline/cancel and also on 404 («Этой заявки уже нет.»). A friend is removed on success and on 404. Messages are reset at the start of each action.
- Double-click guard: a shared `busy` flag, with buttons disabled while it is set.
- Stale responses: search uses a 300 ms debounce, an AbortController, a generation stamp, and a short-query reset. The lists use a generation counter plus abort in effect cleanup. «Показать ещё» deduplicates by id and is disabled while loading.
- Keys: `FriendRequestsList` is keyed `user.id+':in'` / `':out'`, and `PeopleSearch`/`FriendsList` are keyed `authView.user.id`.
- Tab wiring: «Все» = PeopleSearch + FriendsList; «Мои друзья» = FriendsList; «Заявки» = incoming; «Отправленные» = outgoing. The demo grid is hidden for authenticated viewers.
- `/feed` shows «Загружаем…» while auth is `loading`/`redirecting`. In other states the authenticated and demo branches behave as before.
- XSS: everything is rendered as React text, and hrefs are built only from contract-validated uuid ids. There is no `dangerouslySetInnerHTML`.
- JSX/TS syntax: the TypeScript 5.9.3 parser reports 0 parse diagnostics for `main.tsx`, `FriendRequests.tsx` and `FriendsList.tsx`.
- Tests: `node --experimental-test-coverage --test tests/*.test.mjs` gives 85/85 pass, with `lists.ts` at 100% lines and 99.2% branches.
- `docs/task-log.md` has a YP-057 entry that matches the change.

## Not verified
- `pnpm build` / full `tsc` type-check: this review could not run pnpm (`node_modules` was installed for Windows, so the esbuild binary is missing in the Linux VM). The author reports PASS.
- Browser behaviour: rendering, focus, confirm dialog and screen-reader announcements were not checked. No browser check was possible.
- No end-to-end run against a live backend; backend behaviour was taken from its source (`friend_requests_http.go`, `requests.go`, `people.go`, `postgres/friend_requests.go`).

## Gate: PASS
