# Review: site search on the home page (frontend cbb8866, 8316af9, 7d5e655)

## Summary

Three commits reviewed: cbb8866 (card page waits for auth and for its own route id; write guard released in `finally`), 8316af9 (backend contract 766009f imported, 26 operations, `searchVideos` has `auth: "none"`), and 7d5e655 (the home page lists the public catalog from `GET /v1/videos`).

The transport change is minimal and correct. `searchCatalog`/`toPublicCard` map only fields that exist in the contract and carry no own state. The catalog effect handles debounce, abort, stale responses and keyset paging correctly. The new card-page loading condition cannot hang on its own. I found no HIGH or MEDIUM issues. The findings are UX gaps around the fallback and filter sources, plus small polish items.

## Findings

### HIGH
None.

### MEDIUM
None.

### LOW

- **L1. Every search failure looks like "catalog unavailable", with no retry.** `src/main.tsx`, catalog effect `.catch(()=>…error:'Каталог YouPoisk сейчас недоступен, показываем подборку.')`.
  - A 422 `invalid_fields` falls back to the demo list with this outage message. Example: a pasted tab or another control character in the header search. The contract forbids control characters in `q`, and `searchCatalog` only trims and slices.
  - 429 `busy` (Retry-After 1, shared card-read gate) is handled the same way, and nothing retries.
  - Suggested fix: strip control characters (`/[\u0000-\u001F\u007F]/g`) in `searchCatalog`. Retry once after `retryAfterSeconds` on 429/503, or show a distinct message for invalid input.

- **L2. The tag filter buttons come from the demo catalog, not the server catalog.** `src/main.tsx`: `categories=['Все видео',...new Set(videos.flatMap(v=>v.hashtags))]`.
  - The "hashtag buttons as a tag filter" are the demo videos' tags (`#gta6`, `#моряк`, …). Only 2 of the 7 demo videos have tags.
  - Server videos with other tags cannot be filtered, and a demo tag often returns an empty server result.
  - Each empty result shows the generic «Здесь пока ничего нет… Добавляйте видео через расширение» state, which reads oddly for a search. The leading `#` itself is fine: the contract accepts it and the backend normalizes it.
  - Acceptable as an increment, but it should be recorded as a known gap. A popular-tags source or tag chips taken from the shown cards would fix it.

- **L3. A demo list flashes, then 250 ms of debounce delay on first load.** `src/main.tsx`, catalog effect.
  - `catalog` starts as `null`, so the first paint shows the demo grid, «7 ВИДЕО» and the demo sort options. The effect then swaps in «Загружаем каталог…».
  - The 250 ms debounce also applies to the very first request, where there is no typing to debounce.
  - Suggested fix: initialise `catalog` as loading when `route==='/'&&apiClient`, and skip the timer when the key is the initial one.

- **L4. The sort select shows server sorts in fallback mode but has no effect there.** `src/main.tsx`, section head: `(catalog?sortNames:[…])`.
  - After an error, `catalog` is non-null (it has `error`), so the select offers «Новые/Лучшие/Популярные» while the demo `filtered` list is shown.
  - `filtered` only reacts to «По названию», so changing the sort just re-requests the API.
  - Suggested fix: key the options on `catalog&&!catalog.error`, as the list rendering already does.

### NIT

- **N1. Count label shows wrong numbers while loading.** It reads «0 ВИДЕО» next to «Загружаем каталог…» on first load, and the previous result's count while a new filter loads. Consider hiding the count while `catalog.loading`.
- **N2. The effect re-fetches when only whitespace changes.** Its dependency is the raw `query`, so typing a trailing space aborts the request and re-fetches the same key after 250 ms. Compare the computed `key` with the current one and skip.
- **N3. `catalogLoadMore` rebuilds the filter from the render's closure.** It uses `query`/`category`/`catalogSort` instead of the filter that produced `cur.key`. It is correct today because a filter change always sets `next:null, loading:true` first. Deriving from the key (or storing the filter in state) would make that invariant explicit.
- **N4. Hashtag display differs between server and demo cards.** Server hashtags have no leading `#` (contract pattern `^[^#]`), so public cards show `gta6 tga2026` while demo cards show `#gta6`. The poster caption has the same mismatch.
- **N5. The section heading still says «Видео из подборки» for the live catalog.** The hero and the «Общая подборка» rail also stay demo-only. Copy only.
- **N6. `availability` is ignored on public cards.** Unavailable or removed videos look like normal cards in search. The card page can show the state, but the grid gives no hint.
- **N7. Possible skips and repeats under top/popular paging.** Keysets on top/popular can skip or repeat items when ratings change between pages (backend review N4). Repeats are handled by the dedup by id; skips are inherent. No action needed beyond awareness.

## Verified

- **client.ts array serialization.**
  - Array values are appended as repeated keys (`tag=a&tag=b`). Scalars still use `set`, unchanged.
  - Validation runs on the whole value before serialization, so `maxItems: 10` is enforced. The test sends 11 tags and gets `invalid_input`.
  - An empty array sends no key. Unknown keys are still rejected.
- **Public operations while recovering.** The `recovering`/`guest` gate and the Authorization header apply only when `entry.auth !== 'none'`. `searchVideos` is `auth: "none"` in `validators.js` (line ~16488). So the scope may be `recovering`, no Bearer is sent (the test asserts that `Authorization` is null), and the stale-session checks are skipped for this operation. `credentials:'omit'` and `referrerPolicy:'no-referrer'` are unchanged.
- **8316af9.**
  - `contracts/source.json` pins backend 766009f with sha256 `827bdcb1…81235`, and the backend review confirms the bytes are identical.
  - The validators test expects 26 operations.
  - The `searchVideos` parameters match the contract: `q` maxLength 400, `tag` array of up to 10 items, `match`, `sort` enum, `after` up to 128, `limit` 1..100.
- **lists.ts.**
  - `searchCatalog` sends `limit:30` and `sort`. It sends `q` only when the trimmed text is non-empty (sliced to 100 UTF-16 units; a split surrogate becomes U+FFFD in the URL, which is harmless). It sends `tag:[tag]` only when a tag is set, and `after` only on load-more. `match` is never sent, so the default `any` applies.
  - `toPublicCard` uses only contract fields, with fallbacks for a null title, duration and channel and empty hashtags. `rating` is the average, or 0 when there are no votes; this is safe because averages are 1..10. `votes` is the count. It sets no `uuid`/`revision`/`later`/`myRating`, and nothing is invented beyond the display fallbacks.
- **Catalog effect.**
  - Cleanup clears the timer and aborts the request, and every `setCatalog` checks `!ctl.signal.aborted`, so stale responses are dropped.
  - Previous items are kept while loading (`items: prev?.items ?? []`), with `next:null` so «Показать ещё» is hidden mid-change.
  - On error, the items are emptied, the error notice is shown and the demo `filtered` list appears.
  - Leaving `/` or having no `apiClient` sets `catalog` to null, so the original demo behaviour is unchanged when no API is configured.
- **Load more.**
  - `catalogLoadMore` checks `cur.next`, `!cur.loading`, `apiClient` and an in-flight ref.
  - The merge requires `prev.key===cur.key && prev.next===cur.next` and dedups by id.
  - The effect aborts any in-flight load-more on a filter or route change, and `finally` releases the ref only if it still belongs to this request.
  - A load-more error only shows a toast.
- **Sort mapping.** «Лучшие»→top, «Популярные»→popular, anything else (including the default «Подборка»)→new. While the catalog is active, the select shows «Новые» for any non-catalog sort value, which matches what is requested.
- **Public card rendering.** The rating badge shows `★ average` for public cards and «Нет оценок» when the average is 0. The watch-later toggle is not rendered for `publicCard`. The text reads «Оценок: N». The poster number is not shown because the card is not in `videos`.
- **Interaction with serverList and the filters.** `routeList('/')` is null, so `serverList` is null on `/` and the catalog branch is used. Own lists on `/library`, `/watchlist` and `/ratings` are unaffected, and the catalog is null there.
- **Hooks order.** The new `useState`/`useRef`/`useEffect` calls are at the top level of `App`. The only early `return`s before them are inside callbacks or effects, so the hook order is unconditional.
- **Header search.** `onChange={e=>{setQuery(e.target.value);if(route!=='/')go('/')}}` is unchanged, so typing on other pages still navigates to `/`.
- **cbb8866 loading condition `/^\/video\//.test(route)&&(loading||redirecting||(remote!==null&&remote.id!==route.slice(7)))`.** I found no permanent hang:
  - Invalid ids, ids of the wrong length or a missing reader make the effect set `remote` to null, so the third clause is false.
  - For a valid id, `remote.id` is `m[1]`, which equals `route.slice(7)` because the regex is anchored. The mismatch therefore lasts only from the route change until the effect runs.
  - No auth config means `authSession` is null and `authView` becomes `error`, which is not loading. `apiClient` and `guestClient` are then null, so the page falls back to the demo or not-found page.
  - `bootAuth` never rejects (try/catch) and its exchange has a 15 s timeout.
  - `redirecting` is set only by the boot restore, which navigates away. A bfcache restore reloads the page (`pageshow` persisted handler).
  - The remaining theoretical case is `authorize()` or `completeCallback` never settling, which would also block the rest of auth and is bounded by its timeouts.
- **Write guard.** `remoteWrite` now has `try{…}finally{pending.current.delete(c.id)}`, so the guard is released even if `loadCard` or `setRemote` throws.
- **XSS and safety.**
  - All server strings are rendered as React text. `main.tsx` has no `dangerouslySetInnerHTML` or `innerHTML`.
  - The thumbnail URL uses `youtube_video_id`, which the response validator checks against `^[A-Za-z0-9_-]{11}$`. The channel link is `encodeURIComponent`'d. `url` is pattern-checked and not rendered in the grid.
- **Tests.** `node --experimental-test-coverage --test tests/*.test.mjs` (Node 22.23.5): 69 tests, 69 pass, 0 fail.
  - `client.ts`: 100% lines, 96.84% branches, 100% functions.
  - `lists.ts`: 100% lines, 98.67% branches, 100% functions.

## Not verified

- The frontend gate (`pnpm build` including `tsc`, `test:api`, `test:extension`) is author-reported PASS. This shell has no pnpm or tsc, so I could not check type correctness of the `as unknown as Video[]` casts and the new union types.
- No browser run was possible. I did not observe the real rendering, debounce feel, demo flash (L3), mobile layout or the live network requests against a running backend. That includes the absence of Authorization on the wire, which is verified only by code and the unit test.
- The backend behaviour (sorting, cursor, Cyrillic case folding) is taken from the contract and the backend review `youpoisk-backend/docs/reviews/yp053-search.md`.

Gate: PASS
