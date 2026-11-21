# Independent review: feed grouping by video (1bd491e)

Commit: `1bd491e feat(feed): group recommendations by video and focus privacy settings` (branch codex/mvp-integration)
Scope: src/components/FeedList.tsx, src/shared/library/lists.ts (groupFeedByVideo), src/main.tsx (Privacy button), src/style.css, tests/lists.test.mjs, todo.md DEC-WEB-025, docs/task-log.md.
Backend contract checked: youpoisk-backend api/openapi.json `GET /v1/me/feed` (listFeed), internal/application/catalog/feed.go, internal/platform/postgres/feed.go.
Mode: read-only. No source, git or data changes.

## Gate: PASS

No HIGH or MEDIUM findings. Four LOW findings below; none blocks acceptance.

## Verification

- `pnpm` is not installed in the review shell. I ran the `test:api` script's exact `node ...` command line directly (Node v22.23.5): 94 tests, 94 pass, 0 fail. Coverage thresholds passed: lists.ts 100% lines, 100% functions, 99.35% branches. Every included file is at 100% lines and functions.
- Typecheck/build NOT verified. In this VM the pnpm `node_modules` symlinks (react, typescript, vite, ...) cannot be read (I/O error), so `tsc` reports spurious JSX errors. The task-log claim "build PASS" was not independently reproduced here.

## Contract confirmation (backend)

- One item = one author/video pair. The openapi description says "One item per author/video". Friendship plus following does not duplicate a record. `changed_at` is the latest visible part.
- Ordering is strictly descending by `(changed_at, user_id, video_id)`: `ORDER BY i.at DESC, i.user_id DESC, v.id DESC` with a keyset `< (cursor)` predicate (postgres/feed.go:54-55). The application layer re-validates that rows are strictly descending and strictly after the cursor (feed.go:119).
- `next_cursor` encodes the last returned row (feed.go:113), so pages within one snapshot neither overlap nor leave gaps.
- So the frontend's assumptions are correct: the server sends a newest-first stream, one item is one author/video contribution, and the UUID `video.id` is the identity.

## Correctness analysis (passed)

- **Grouping:** `groupFeedByVideo` (lists.ts:339) keys on `video.id`, never on title. Groups are ordered by first occurrence. The input is globally newest-first, so a group's first item is its newest entry and `changedAt` is correct. Appending older pages only adds authors to existing groups or appends new groups at the end, so existing order never changes. The test covers different UUIDs with the same title.
- **Cross-page dedup:** FeedList.tsx:28 drops page-N items whose `user:video` key is already loaded, keeping the earlier (newer) entry. `groupFeedByVideo` applies the same first-wins rule per user inside a group. The two layers agree, so no entry is lost or duplicated. The server cannot return the same pair twice inside one snapshot. Across snapshots it can happen only when `changed_at` moves (see L1), and then the first copy wins.
- **Races:** both mode toggles are derived state (line 39), so toggling never fetches and a late response simply re-groups. `generation` (unmount, client change) and `serial` (superseded reads) guard both the result and the `finally` path. `reading` is reset only by the current read, so it cannot get stuck: any newer load resets it on completion. Account switch remounts FeedList via `key={authView.user.id}`, and the cleanup increments `generation` and aborts the initial request. A late load-more or retry from the previous user is dropped by the stamp check.
- **React keys:** article keys are `video:<uuid>` (grouped) and `author:<user>:<video>` (by author). Both are unique given the dedup. `FeedAuthor` uses `key=user.id`, unique within a group. In main.tsx every `authView.user.id`-based key is now suffixed (privacypanel, blockspanel, securitysessions, search, friends, in/out). `FriendRatingsPanel` and `VideoReviewPanel` share the pattern `user.id+':'+c.id`, but they render under different parents (main column vs aside), so they are not siblings. The route content sits in `<React.Fragment key={route}>`. No duplicated sibling keys found.
- **Privacy navigation:** `go('/settings','Приватность')` stores `pendingTab`, and the hashchange handler applies that tab only when the route matches. Authenticated users then see only `PrivacyPanel`, keyed `:privacypanel`.
- **XSS/text:** all user text (name, login, review, title, channel) renders as React text children. `bdi`, `dir="auto"` and `unicode-bidi:plaintext` isolate RTL text. Every href starts with `#/` and uses server UUIDs or YouTube ids. No `dangerouslySetInnerHTML`.
- **Toggle accessibility:** the toggle is `role="group"` with an `aria-label` and two native buttons with `aria-pressed`. The visual `selected` class matches the pressed state. The section has `aria-busy`, and status messages use `role="status"`.

## Findings

### L1 (LOW): contributions changed during pagination stay stale and the newer state is never fetched
FeedList.tsx:28, with the keyset cursor at postgres/feed.go:54.
Scenario: page 1 shows author A rating video V 6/10. A re-rates V to 9 while the viewer is still paging. The row's `changed_at` moves above the cursor, so later pages never return it, and the post keeps "6/10" until reload. The reverse also happens: a privacy change that hides A's rating moves `changed_at` back to the review time, so the pair reappears on a later page. The first-wins dedup then keeps the stale page-1 copy, whose rating is now hidden from this viewer, on screen until reload. Nothing is duplicated or lost, and this behaviour predates the commit. DEC-WEB-025 states "only loaded entries", but it does not mention staleness.
Suggestion: document it, or let a newer `changed_at` replace the older copy.

### L2 (LOW): the cross-page merge in FeedList is untested; the tests exercise only the pure function
tests/lists.test.mjs:376-391 versus FeedList.tsx:22-38.
The test simulates "pages" by passing a concatenated array to `groupFeedByVideo`. The real append filter (line 28), the serial/generation guards and retry-after-failed-load-more have no automated test. Scenario: if someone later changes line 28 to dedup by `video.id` (or drops the filter), by-video mode would silently lose author contributions, and `test:api` would still pass at 100%. The 100% line/function claim is accurate for lists.ts, but it does not cover this logic.
Suggestion: extract the merge into lists.ts (e.g. `appendFeedPage(prev, page)`) and test it there.

### L3 (LOW): in by-video mode, "Показать ещё" adds content to posts that may be off-screen, with no indication
FeedList.tsx:45 and :58.
Scenario: the viewer scrolls to the bottom and presses "Показать ещё". A new contribution from page 2 joins a video post near the top. Nothing visible changes near the button and screen readers hear nothing, so the user may think nothing loaded. The hint says load-more will "дополнит общие посты" (extend existing posts), but load-more can also append whole new posts, so the wording is partly inaccurate.
Suggestion: a short `role="status"` summary after each page (e.g. "добавлено N записей, из них M в уже показанные посты").

### L4 (LOW): typecheck and build were not independently reproduced
Environment limitation (unreadable pnpm symlinks in the review VM, no pnpm). Tests and coverage were reproduced. Before final acceptance, run `pnpm build` on the developer machine.

## Not findings (checked)
- Group metadata comes from the newest-loaded item. Title drift between page fetches is cosmetic.
- The "Показано авторов" counter counts loaded entries only, as DEC-WEB-025 states. There is no unbounded prefetch.
- Retry is disabled while loading, and retry after a failed initial load replaces items (`after=null`), which is correct.
