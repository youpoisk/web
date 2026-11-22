# Reviewed list buttons and subscriptions people search — 78eb2f9

Commit `78eb2f96cf484662ee9053702550ffcd5560ba1a` (parent `ba5ab91`). Scope: contract re-import from backend `8c0da4f` (73 operations), `ListCard.hasReview`, the watchlist/ratings «Рецензия» visual state, and one shared «Найти людей» filter on all Subscriptions tabs.

Gate: **PASS**. No HIGH/MEDIUM findings. Five P3 items below; none blocks merge. The customer's button request is met; the subscriptions search is met as a current-list filter under the project's DEC-WEB-022 interpretation, not as a new-people discovery search.

## Findings

### P3-1 · No automated test covers the new subscriptions search state machine — src/components/Subscriptions.tsx:42-58,103-105

`tests/lists.test.mjs` covers `toCard` and the pure `filterPeopleList`, but nothing renders `SubscriptionsPanel`/`SubscriptionsList`. `test:api`'s coverage includes `src/shared/library/lists.ts`, not components (`package.json:16`), so the new auto-walk, generation/serial guards, error/retry, tab key and empty-state branches rely on manual QA. Suggested: extract the “walk while a query is active” decision into a pure helper, or add a component test covering a multi-page search, a mid-walk failure followed by retry, clearing the query, and both directions on «Все». Non-blocking test-strength gap.

### P3-2 · The auto-walk has no cursor-progress guard — src/components/Subscriptions.tsx:42-44

The effect runs `loadMore()` while `searchTerm && next && !loading && !error && !saving`. It re-fires on every `loading` true→false transition. With the current backend the cursor always advances (pagination is tested), so this is defensive only: if a page ever returned the same non-null `next_cursor`, `setNext` would bail out on the identical string, `setLoading(false)` would re-trigger the effect, and the UI would keep requesting the same page while the query is active. Suggested guard: in `load`, stop and expose an error when `after !== null && page.next === after`, or remember the last requested cursor in a ref. Not an observed defect.

### P3-3 · Duplicate live-region announcements and a double page-walk on «Все» — src/components/Subscriptions.tsx:46-47,105

On the «Все» tab both lists are mounted. Each renders its own `role="status"` «Ищем по всему списку…» / «По вашему запросу никого не найдено.» and each auto-walks its remaining pages independently. This is logically correct for two lists, but a screen reader can announce two identical status messages and the browser performs two independent walks. A panel-level status (or a single live region) would be cleaner. Minor a11y/UX duplication, non-blocking.

### P3-4 · The filled review link inherits a low-contrast `.on` style — src/style.css:48, src/main.tsx:41

`.card-action.on` sets white text on `#1da1f2` at 12px/700, roughly 2.8:1 contrast — below WCAG AA 4.5:1 for normal text. The state is not conveyed by colour alone: the icon changes from `PenLine` to `Check` and `title`/`aria-label` become descriptive, so the functional requirement is met. The same class already styles the filled «Посмотрю позже» action, so this is an inherited style issue newly applied to the review link. Verify with design; darken the fill or adjust size/weight if AA is required.

### P3-5 · Cross-tab/external writes leave `hasReview` stale — src/main.tsx:34

`serverList` reloads on `route`, `signedIn` and `listGen`. Opening a video from the list makes `routeList(route)` null and sets `serverList` to null; returning reloads it, so a review written, edited (true→true), or deleted (true→false) in the same tab is reflected on return. A review written/edited/deleted in another tab/window while the list stays open is not revalidated on focus/visibility and stays stale until a route change or reload. In-app flow is correct; cross-tab freshness is a limitation, not an observed defect.

## Verified independently

- Contract provenance: `contracts/source.json` names backend `8c0da4f6103cfd2a635fcf800519e985b1a93567`, path `api/openapi.json`, sha256 `e3fbbd3106ba421498f4552a6efee148fb188353f8573317b75d93bfe0cb0384`; the frontend `contracts/openapi.json` and backend `api/openapi.json` both hash to that value. `node scripts/contract.mjs check` and `node scripts/validators.mjs check` pass independently (73 operations).
- Generated files are in sync: `schema.d.ts` adds only required `has_review`; `validators.js` adds only the required/boolean checks; `contracts/openapi.json` differs from the parent only by that field. No unrelated drift was found in `78eb2f9`.
- Typecheck and tests: `node --test` over `tests/*.test.mjs` passed 116/116; `tsc --noEmit -p tsconfig.json` exited 0; the focused list suite passed 35/35. (`pnpm build`/vite, the exact coverage thresholds, extension tests and browser QA were not independently repeated.)
- Card mapping: `toCard` maps `item.has_review` (`src/shared/library/lists.ts:74`); `PublicCard` omits `hasReview` (`:33`); `toPublicCard` never adds it (`:293-314`); `reviewed()` narrows both unions via `'hasReview' in v` (`src/main.tsx:36`). The review link is only rendered when `ownActions` is true (`/watchlist`/`/ratings`, `src/main.tsx:41`), where items are `ListCard`s, so the public/catalog union cannot see a filled state.
- Visual/accessible state: `.card-action.on` exists and fills the link (`src/style.css:48`); the icon swaps to `Check`; `title` and `aria-label` become «Рецензия написана…» while the visible label remains «Рецензия». There is no colour-only state.
- Refresh path: leaving a list route sets `serverList` to null and returning starts a new `loadList` (`src/main.tsx:34`); a write/edit/delete made on the video page is committed before navigation, so the returned list gets the current `has_review`. The client validates list responses against the required field, so a missing `has_review` fails closed rather than becoming `undefined` silently.
- Subscriptions search: `SubscriptionsPanel` renders one `PeopleListSearch` above the conditional sections on all three tabs (`src/components/Subscriptions.tsx:103-105`); `SubscriptionsList` receives the shared `search` prop (`:8`). It filters login/name with `filterPeopleList` (`:43`, `src/shared/library/lists.ts:331-335`), walks remaining cursor pages (`:44`), dedupes by `user.id` (`:20`), stops on error with a retry (`:49`), hides paging and ordinary empty text while a query is active (`:50,56`), and shows search/empty statuses (`:46-47`). The loaders use explicit `following`/`followers` keys (`:105`) and the panel is keyed by viewer in `main.tsx:52`, so tab switches cannot carry one direction's state into the other.
- Stale responses: `generation`/`serial` guards discard late replies and late failures (`src/components/Subscriptions.tsx:15,19,23,24`); the auto-walk resumes only from the latest `next`. No duplicate pages were found in the append path (dedupe by `user.id`).
- No search writes: the search path calls only `loadFollowing` (`listFollowing`/`listFollowers`); `setFollowing` is reached only from the explicit «Отписаться» button (`src/components/Subscriptions.tsx:35,54`). The filter is pure.
- Consistency with the friends pattern and DEC-WEB-022: the same `PeopleListSearch`, `filterPeopleList` and “walk while searching” pattern are used by `FriendsList`/`FriendRequestsList`; the committed decision is at `todo.md:69`. The layout (search above the lists, same heading/placeholder) matches the «Мои друзья» tab.

## Customer request completeness

- **Watchlist and ratings «Рецензия» buttons:** met. Both pages show a filled `.card-action on` link with a `Check` icon and a descriptive accessible name when the backend reports a saved review; a hidden or unpublished review still counts, and a deleted one clears the state on return.
- **Subscriptions «Найти людей»:** met as a filter of the viewer's existing following/followers, on all three tabs, after walking the remaining pages — the project's DEC-WEB-022 interpretation of the friends-page control. It does **not** search all YouPoisk users or add new authors to follow; the friends page's «Все» tab uses a separate server-side `PeopleSearch` for that. If the customer's «как на странице friends» meant that discovery search rather than the «Мои друзья» filter, the request is only partially met; the recorded decision supports filtering, so no code change is requested without product clarification.

No source, test, contract or task-log changes were made. The existing out-of-scope `todo.md` modification and two untracked plan documents were left untouched; only this review file was added. Line references above are to commit `78eb2f9`; the branch has since advanced to `eb531e0` with unrelated account-deletion work, which was not reviewed.
