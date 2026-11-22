# Review: YP-062 notifications UI (frontend commit 1c545d0)

Reviewer: independent read-only review. Scope: `src/components/Notifications.tsx`, `src/main.tsx` (bell, `#/notifications` route, keys), `src/components/Messages.tsx`, `src/components/FriendRequests.tsx`, `src/shared/library/lists.ts`, `src/style.css`, `tests/lists.test.mjs`, `tests/validators.test.mjs`, DEC-WEB-028 in `todo.md`. Contract: `youpoisk-backend/api/openapi.json` (backend 2ca2a8f).

## Gate: FAIL

Two MEDIUM findings: the badge re-fetches on every App render, and the bell's `aria-label` hides the unread count from screen readers.

## Verification

- `test:api` run directly with node 22: 98/98 pass. Coverage for `lists.ts`: 100% lines, 99.53% branches, 100% functions. The 100% line/function claim holds.
- The notification paths in `contracts/openapi.json` match the backend `api/openapi.json` exactly. The validators test count was updated from 54 to 58 (+4 operations).
- `tsc` could not be checked on this machine: the `node_modules/@types/react` symlink cannot be read (I/O error, a Windows-installed tree). This is an environment problem, not a finding.
- Backend serialises `occurred_at` as Go `time.Time` (RFC3339Nano, full precision). Read-all compares `updated_at <= through`. Sending back the newest item's `occurred_at` string unchanged is therefore exact, and the newest shown item is included.

## Findings

### MEDIUM-1: the badge re-runs its effect on every App render, so it is not polling once a minute while visible
`src/components/Notifications.tsx:14-26` (`useEffect(..., [client])`), `src/main.tsx:47` (`<NotificationBadge ... client={apiClient}/>`). `apiClient` is built in the render body with `new ApiClient(...)` (an IIFE, no `useMemo`), so its identity changes on every App render.

The badge is mounted in the header on every page for the whole signed-in session. Each App render therefore runs the cleanup (abort, clear the interval) and a new `load()`, which sends `GET /v1/me/notifications/unread-count`.

Failure scenario: a signed-in user types "music" into the header search. That is 5 `setQuery` renders, plus catalog `setCatalog` renders and toast show/hide renders, and each one fires an unread-count request. Clicking ratings or "Посмотрю позже" on the home page does the same. If App renders more often than every 60 s, the interval is reset each time and never fires. Request volume then follows UI activity rather than the rate stated in DEC-WEB-028 ("опрос раз в 60 с при видимой вкладке").

The same identity change hits `NotificationsList` (`Notifications.tsx:46-49`). On `#/notifications`, toggling the mobile menu (`setMobile`) or any toast re-runs the effect. That calls `load(null)`, which drops pages already loaded with «Показать ещё» and resets the list.

Other components share the `[client]` pattern, but this is the first one that is always mounted.

Fix: memoise `apiClient` in `main.tsx` (`useMemo` keyed on `authSession`). Alternatively, give the badge and list effects a stable dependency (for example a ref holding the client, with the effect keyed on the user id).

### MEDIUM-2: the bell's `aria-label` overrides the hidden unread count
`src/main.tsx:47` (`<button className="icon-btn" ... aria-label="Уведомления">`) and `src/components/Notifications.tsx:27` (`<span className="sr-only">, непрочитанных: {count}</span>`). Under the accessible-name computation, `aria-label` replaces the name built from the button's contents. The sr-only text is never part of the button's name, and the dot is `aria-hidden`.

Failure scenario: a screen-reader user with 3 unread notifications hears only "Уведомления, кнопка". Sighted users see the dot. The DEC-WEB-028 promise of «скрытым текстом числа непрочитанных» is not met.

Fix: drop the `aria-label` and use visible-to-AT text (`<span className="sr-only">Уведомления</span>` plus the count span). Or compute the label: ``aria-label={count ? `Уведомления, непрочитанных: ${count}` : 'Уведомления'}``, which needs the count lifted out of the badge.

### LOW-1: an event during an in-flight poll is dropped, so the badge can stay stale for up to 60 s
`Notifications.tsx:17`. `load()` returns early while `busy.current` is set. If `NOTIFICATIONS_CHANGED` fires while a count request is in flight (sent before the mark), that event is ignored. The in-flight response then sets the pre-mark count.

Scenario: on returning to the tab, the visibilitychange poll starts. The chat thread marks the conversation read and dispatches the event, which is skipped. The dot stays until the next trigger. Today MEDIUM-1 hides this, because any render re-fetches. Once that is fixed, the gap becomes visible.

Fix: when busy, set a "dirty" flag and reload once in `finally`.

### LOW-2: a refresh that was in flight can undo a successful read-all in the UI
`Notifications.tsx:35-45, 58-70`. «Обновить» calls `load(null)` without a signal or a stamp bump. If it was sent before «Отметить все прочитанными» and returns after it, `setItems(page.items)` restores `read:false` for items the server has already marked.

Scenario: on a slow network, click «Обновить», then «Отметить все». The notice says «отмечены прочитанными», yet the items show as unread again and the button reappears. This is cosmetic: the server state is correct and the next refresh fixes it.

Fix: bump the generation on read-all success, or re-apply the read-all boundary to late pages.

### LOW-3: optimistic single read has no rollback or feedback
`Notifications.tsx:52-55`. A failed `markNotificationRead` is swallowed (for example a 429 after the 120/min limit shared with read-all). The item stays marked read locally and the badge is not refreshed. The user navigates away at once, and the list reloads from the server on return, so the impact is small. For `message` items, opening the chat marks the notification read on the server anyway.

### LOW-4: focus is lost after «Отметить все прочитанными»
`Notifications.tsx:73`. The button is rendered only while `unread` is true. After success it unmounts while focused, and keyboard and screen-reader focus falls to `<body>`. The status notice is announced, but the user loses their place.

Fix: keep the button rendered but disabled, or move focus to the list or heading.

### LOW-5: `<bdi dir="auto">` wraps the whole sentence, not the actor name
`Notifications.tsx:81`. `notificationText` builds sentences where the actor name may come first (`${who}: новых сообщений — N`, `${who} хочет добавить…`). With `dir="auto"`, an Arabic or Hebrew display name sets the direction of the entire Russian sentence to RTL, which garbles punctuation and order.

Fix: isolate just the name. Return parts from the helper, or render `<bdi>{name}</bdi>` plus the static text. Text safety is otherwise fine: everything is a React text node, with no `dangerouslySetInnerHTML` and no URLs from data.

### LOW-6: DEC-WEB-028 says the guest demo list remains, but guests cannot reach it
`src/main.tsx:48-49` and `todo.md:100`. `signedIn` is `me!==null`, and `me` is set only for `authenticated`. The earlier `!signedIn && [...'/notifications'...]` branch therefore always shows the «Эта страница доступна с профилем» gate to guests. The demo `requests.map` branch for `/notifications` can never render, for guests or signed-in users. This predates the commit, but the decision text claims the opposite.

Fix: correct the DEC text, or remove the dead branch.

### LOW-7: component logic has no tests
`tests/lists.test.mjs:436-466` covers only the `lists.ts` helpers: operation names, query/body shape, texts and targets. That is adequate for the 100% claim. The behaviour with real risk lives in `Notifications.tsx` and has no automated coverage: the read-all boundary and optimistic update, generation guards, the badge's busy/visibility/cleanup logic, and the account key. Previous UI reviews in this repo accepted the same split. Worth adding at least a pure helper for "apply read-all through T to items" so the boundary rule is tested.

## Checked and OK

- **Read-all boundary.** `through = items[0].occurred_at` (newest shown; the list is ordered by `occurred_at desc, id desc`). The server marks `<= through`, so newer rows, including rows bumped by a repeat after the page loaded, stay unread. Older rows that are not loaded yet are marked read on the server, which is consistent with the contract. The optimistic local update uses the same `<=` rule.
- **Account isolation.** `NotificationBadge key={user.id+':badge'}` and `NotificationsList key={user.id+':notifications'}` remount per account. Cleanup increments the generation, aborts the controller and clears the interval and both listeners. Late results are stamp-guarded, and the badge is not rendered when signed out. No path found where one account's count reaches another.
- **Listeners and timers.** They are removed symmetrically in cleanup. The badge does not fetch while `visibilityState !== 'visible'`, and fetches on becoming visible.
- **Navigation targets.** A pending `friend_request` opens `/friends` with the «Заявки» tab (through `pendingTab` and `go`). A `message` opens `/messages/{actor.id}`, which matches the route regex for lowercase UUIDs. Resolved requests and `friend_accepted` open `/user/{actor.id}`. All destinations load current data under their own rules, so a notification grants nothing.
- **Events.** `Messages.tsx` dispatches only after a successful `markConversationRead`. `FriendRequests.tsx` dispatches only after a successful accept. Decline does not dispatch, which is fine: the contract does not mark the notification read on decline.
- **UX states.** The page has loading (`role=status`), error (`role=alert` with retry at the failed cursor), empty, and a persistent `role=status` notice region. List items are real `<button>`s. The «Новое:» marker is sr-only, with bold text and a tinted background visually. The avatar is `aria-hidden`.
- **React keys.** `li key={n.id}`, and appended pages are deduplicated by id. In `main.tsx`, the new branch adds no sibling elements without keys and no duplicate keys, because the badge is the only keyed child inside the button. The old always-on dot was removed.

## Follow-up (frontend commit 1989205)

### Gate: PASS

No MEDIUM or higher findings remain, and none are new.

- **M1 retracted (false positive).** `apiClient` is a module-level constant at `src/main.tsx:15`, outside `function App` (`main.tsx:27`). It was already there in 1c545d0. `stateWriter` (`main.tsx:16`) and `guestClient` (`main.tsx:18`) are module-level too. No `new ApiClient` exists inside a render body, so `client` props are stable. The badge effect runs once per mount. The list is not reset by App re-renders. I misread the minified one-line file in the first pass.
- **M2 fixed.** The bell button no longer has `aria-label`. It contains `<Bell aria-hidden>`, `<span className="sr-only">Уведомления</span>` and the badge's sr-only text, so the accessible name is "Уведомления, непрочитанных: N" when there are unread items and "Уведомления" otherwise.
- **L1 fixed** (`Notifications.tsx:16-25`). A load while busy sets `again`. The stamped `finally` clears `busy` and reloads once. A stale instance's `finally` returns without touching the refs, and cleanup resets `busy` and `again`. A load skipped while hidden leaves a harmless `again=true`, which the next real load clears.
- **L3 fixed.** `markNotificationRead(...).catch(() => {}).finally(changed)` refreshes the badge after either outcome.
- **L6 fixed.** DEC-WEB-028 now says guests see the general «Эта страница доступна с профилем» page. The dead demo branch for `/notifications` in `main.tsx` is harmless and can be removed later.
- **Still open, all LOW and recorded in todo.md:** L2 (a late refresh shows stale read state), L4 (focus loss after «Отметить все»), L5 (`bdi` around the whole sentence), L7 (no component tests).
- **Tests.** `test:api` (node 22, run directly): 98/98 pass. `lists.ts` is at 100% lines and 100% functions (99.53% branches).
