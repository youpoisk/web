# Review: extension draft fixes and site video reviews

Commits: 2d06126 (extension: draft fixes for M1/L1/L2) and 2b94bac (site: «Рецензии» on the video page, card actions on «Мои оценки»). Reviewer: independent (Claude), 2026-11-21.

## Summary

**Extension (2d06126): the earlier findings are fixed.**
- M1 is fixed. The YouTube panel and the popup keep unsaved review text in a per-video `drafts` map. That text survives every re-render path I traced: `update()`→`render()`, the `YP_CHANGED` broadcast, MutationObserver refreshes, failed saves, and popup `mutate()`/`YP.subscribe`.
- L1 is fixed. `update()` now returns a boolean, and Save/Delete close the editor only on success.
- L2 is fixed. `maxlength` is gone from both UIs. The counter counts code points after trim and turns red above 1000. Core tests now cover emoji and a lone CR.
- What remains are small UX rough edges: caret position after a re-render, and the error status sitting behind the editor.

**Site (2b94bac): the customer request is implemented.**
- The server card page and the demo fallback both render a «Рецензии» section keyed `video:<youtubeId>`.
- «Мои оценки» cards get a large `aria-pressed` «Посмотрю позже» toggle, which uses the correct write path, and a «Написать рецензию» link to `#/video/<id>`.

**One MEDIUM defect in the reviewSection edit/delete logic.** The bug predates this commit, but the commit carries it into the new `at = editing ?? own` code. It is now exposed on the main video page the customer asked for. Clicking «Редактировать» and then «Удалить» leaves `editing` pointing at a stale index. The next save then either silently overwrites another video's review or loses the text while showing «Рецензия сохранена».

## Findings

### MEDIUM

**M1. Stale `editing` index after delete overwrites another review or loses the text (src/main.tsx line 34, `reviewSection`).**
- The «Удалить» handler is `setReviews(reviews.filter((_,j)=>j!==i))`. It resets neither `editing` nor `text`.
- Steps: open «Редактировать» on your review. `editing=i` and the textarea holds the text. Click «Удалить». The textarea still shows the text and the button still says «Сохранить изменения». Click it.
  - `own` is now -1, so `at=editing=i`.
  - `reviews.map((r,i)=>i===at?{title,text}:r)` replaces whatever entry now sits at index `i`. That is another video's review, or a channel «Отзыв», which is lost and re-keyed to this video.
  - If `i` was the last index, nothing is saved, but the toast still says «Рецензия сохранена».
- The data is browser-local, but it is user-written text and the loss is silent.
- Fix:
  - In the delete handler, call `setEditing(null)` (and `setText('')` if `editing===i`).
  - In save, verify that `reviews[at]?.title===title` before mapping, otherwise fall back to `own`/append.
  - Better still, for the video key drop the index entirely and always use `findIndex(r=>r.title===title)`, since there is one review per video.
- Pre-existing logic. It is in scope because the commit rewrote this handler and the one-review rule depends on it.

### LOW

**L1. A second review on the same video silently replaces the first (src/main.tsx line 34).**
- When the author already has a review, the composer is still shown empty with «Опубликовать рецензию».
- Publishing overwrites the existing review with no prompt. This respects "one review per author per video", but the user is not told.
- Suggest: when `own>=0` and not editing, hide the composer, prefill it, or label the button «Заменить рецензию». The site could also show «Моя рецензия» like the extension does.

**L2. The review draft shares the `text` state with the share modal (src/main.tsx, demo fallback video page).**
- The «Рекомендовать видео» modal textarea is also bound to `text`/`setText`.
- On the demo fallback page, typing a review and then clicking «Поделиться» pre-fills the recommendation message with the review draft. «В ленту» publishes the draft to the feed and clears it.
- The reverse also happens: text typed in the modal shows up in the review composer after the modal is closed.
- Navigation does reset the state (hashchange handler and `go()` call `setText('')`/`setEditing(null)`), so there is no stale text across videos.
- Pre-existing. Use a separate state for the modal message.

**L3. Site textarea still has `maxLength={1000}` (src/main.tsx line 34).** This is the same UTF-16-vs-code-point mismatch that L2 of the previous review fixed in the extension. The new placeholder says «До 1000 символов». The site has no counter and saves the text untrimmed, so «1000 символов» means 1000 UTF-16 units of raw text, which differs from what the extension accepts. This is harmless while reviews are local, but the two should be aligned before YP-055 (counter plus code-point check, trim and normalize CRLF, or reuse the core rule).

**L4. Honesty wording on the site review (src/main.tsx line 34).**
- The note «Рецензия вместе с оценкой попадёт в «Рекомендации» ваших друзей и подписчиков. Пока сохраняется в этом браузере.» is basically honest.
- The first sentence is in the definite future with no condition, while the button says «Опубликовать рецензию». On a server card page the rating really is shared, but the review is not visible to anyone else or on another device.
- Suggest wording like the extension: «…попадёт в «Рекомендации» после подключения рецензий к аккаунту. Сейчас видна только вам в этом браузере.» Use «Сохранить рецензию» instead of «Опубликовать» until YP-055.

**L5. Caret, selection and IME are reset when the extension panel re-renders while the user types (extension/content.js `render()`).**
- A `YP_CHANGED` broadcast or a MutationObserver refresh while the editor is focused replaces the textarea with a new one. `openEditor(true)` then focuses it.
- The text is preserved, but:
  - the caret jumps to the end (setting `.value` moves the selection to the end);
  - any selection, the scroll position inside the textarea and the undo history are lost;
  - an in-progress IME composition is interrupted.
- This is rare (it needs a write from another tab, or YouTube moving the menu host). Reusing the existing editor node, or saving and restoring `selectionStart/End`/`scrollTop`, would avoid it.

**L6. Save errors in the extension are shown behind the open editor (extension/content.js `notify` + content.css `.yp-status`).**
- Now that the editor correctly stays open on failure, the error goes to `#yp-panel .yp-status`. That element is `position:absolute; top:44px` inside the panel, while the editor is a top-layer popover placed just below the «Рецензия» button. The status is likely covered.
- The same applies to «Рецензия не может быть пустой». For the over-1000 case the red counter helps.
- Suggest a status line inside the editor (role=status), or disabling Save while `n>1000`.

### NIT
- src/main.tsx line 23: `React.useEffect(()=>{if(route==='/library')location.replace('#/watchlist')},[route])` is now dead code, because `route` is normalized in the `useState` initialiser and in the hashchange handler. The address bar therefore keeps `#/library` while «Посмотрю позже» is shown. Either keep the `location.replace` without the route condition (`if(location.hash==='#/library')`), or remove the effect.
- src/main.tsx line 29: «Написать рецензию» is shown even when a review exists. «Моя рецензия» would be consistent with the extension. The link lands at the top of the video page, and the «Рецензии» section is below the poster and actions, so the user has to scroll. `id="review"` exists, but hash routing cannot use it as an anchor; the page could scroll to or focus it.
- src/main.tsx line 37: the server card «Посмотрю позже» button has no `aria-pressed`, unlike the new card action and the extension. The issue predates these commits.
- The section key changed from the video title to `video:<id>`. Earlier local site reviews stored under the title become invisible on video pages. Channel reviews keep their title key. This is acceptable for mock data but is not mentioned in the task log.
- extension/popup.js: drafts live only as long as the popup document, so closing the popup loses unsaved text. This is inherent to popups. It could use `sessionStorage`/`chrome.storage.session` if wanted.
- extension/content.js / popup.js: if another tab saves a different review for the same video while a local draft exists, the draft keeps winning, and Save overwrites the newer text. This is acceptable as last-writer-wins, noted for YP-055.
- `drafts` maps are never pruned. Entries are removed on success or when the text equals the saved value. Size is negligible.

## Verified
- **Extension `update()`.**
  - Returns `false` on busy or context mismatch (after `schedule()`) and on error, and `true` on success.
  - `drafts.delete(id)` runs only after a successful write whose patch contains `review`, so drafts survive rating and watch-later writes.
- **Panel re-render paths** (content.js `render()`): `update()` success, `refresh()` after `YP_CHANGED` and after `yt-navigate-finish`, and MutationObserver refresh.
  - The textarea is initialized from `drafts.get(id) ?? saved.review`.
  - `reopen` is computed from the old panel's open editor before `replaceWith`, and the editor reopens with focus only if the old textarea was focused.
  - The MutationObserver ignores mutations inside `#yp-panel`, and the replacement itself does not reschedule (host and context are unchanged), so there is no render loop.
- **Successful save or delete.** The draft is deleted before `render()`. The editor is reopened by render, then hidden by the handler using `document.getElementById` (the new node). No stale draft is left.
- **Failed save.** The editor stays open, the draft is kept, and there is no re-render.
- **Light-dismiss.** A click on «Посмотрю позже» or the rating closes the editor (popover=auto), but the draft is kept and reappears when the editor is reopened. This was M1 reproduction 1.
- **Navigation.** `yt-navigate-start` removes the panel. Drafts are keyed by video id, so another video never shows them, and returning to the original video restores its unsaved draft.
- **`oninput`** drops the draft when the text equals the saved review. The counter counts `[...value.trim()].length`, and `.yp-over` is styled.
- **Popup.**
  - `render()` always sets the textarea from `drafts.get(video.id) ?? saved`, so a subscribe or mutate re-render no longer overwrites typed text, whether the textarea is focused or not.
  - Draft deleted only on a successful review write.
  - Switching video from the «Посмотрю позже» list uses that video's draft.
  - `maxlength` removed. The counter gets the `error` class above 1000.
- **No `innerHTML`/`outerHTML`/`insertAdjacentHTML`** in extension/*.js. All text goes through `textContent`/`value`.
- **Dead code removed:** the `scores` key parameter and the always-true `if(v.later)`.
- **Site reviewSection.**
  - Guest sees «Войдите, чтобы написать рецензию» plus «Войти».
  - Signed-in sees the composer plus own entries filtered by key.
  - Save enforces one entry per key via `findIndex` (apart from M1 and L1).
  - «Рецензии» heading for the video key, «Отзывы» for channels.
  - The «Пока сохраняется в этом браузере» note is present.
- **Server card page** (`remote.card`): `reviewSection('video:'+c.youtube_video_id)` renders for both signed-in and guest. The demo fallback uses `'video:'+current.id`, which is the same key. `#/video/ber1ap2V868` is a demo id, so the page has the section on both the server and fallback paths. The section is not shown for «Видео пока нет в YouPoisk» or for a load error.
- **«Мои оценки» card actions.**
  - Shown only on `/ratings`. The small icon toggle is hidden there, so there are no duplicates.
  - Server cards (`'uuid' in v`) go through `serverToggleLater`, which uses StateWriter with a revision, the `pending` per-uuid guard and a 409 refetch. For `kind==='ratings'` the item is updated in place, not removed. Local cards use `toggleLater`.
  - `aria-pressed={isLater(v)}`. The label changes («В «Посмотрю позже»»/«Посмотрю позже»), and so does the icon.
  - The link uses `v.id`, which is the YouTube id for server cards (`toCard`).
- **Hooks.** 2b94bac adds no hooks. `reviewSection` and `card` are plain render functions, not components. The `useState` initialiser change does not alter hook order.
- **Styling.** `.card-action` uses the site accent `#1da1f2` with a 20px pill radius, matching `.primary`/`.secondary` overrides (22px). The site has no dark theme, so the `#fff` background is consistent.
- **Library mapping.** `#/library` is normalized to `/watchlist` before the first render, so there is no not-found flash.
- **Tests run by the reviewer:**
  - `node --test extension/tests/*.test.mjs`: **9/9 pass**.
  - `node --test tests/*.test.mjs`: **69/69 pass**.

## Not verified
- `pnpm build` (including tsc), `pnpm test:api` and `pnpm test:extension` could not be run (no pnpm in the review environment). They are author-reported PASS.
- No browser and no Chrome or YouTube run. Untested here:
  - popover reopen and focus behaviour;
  - caret and IME behaviour (L5, derived from code);
  - whether the status is actually covered by the editor (L6, derived from CSS);
  - the visual appearance of `.card-action` on «Мои оценки»;
  - the server card page against a live backend (signed-in versus guest).
- M1 and L2 are derived from code reading, not reproduced in a browser.

Gate: FAIL (1 MEDIUM: stale `editing` index after delete in reviewSection; 6 LOW, 7 NIT)
