# Review: extension 0.4 (three actions) and site without «Моя библиотека»

Commits: 1504581 (site), f400099 (extension 0.4). Reviewer: independent (Claude), 2026-11-21.

## Summary

The domain layer (core.js) does what the customer decision asks: only `rating`/`later`/`review` patch keys, correct review validation, legacy field cleanup and dropping of empty records. Worker authorization and serialization are unchanged and their tests pass. The site route removal and the `#/library` redirect are correct.

There is one MEDIUM defect: **an unsaved review draft is silently lost** in both the YouTube panel and the popup when the user does anything else first (rates the video, toggles «Посмотрю позже», or another tab or the popup changes storage). The cause is that both UIs rebuild or reset the review field from storage on every render. Several site features still contradict the decision; they are listed as questions, not fixes.

## Findings

### MEDIUM

**M1. Unsaved review text is destroyed by re-render (content.js and popup.js).**
- `extension/content.js` `render()`: every render builds a new `#yp-panel` (with a new `editor` and `textarea`, `area.value=saved.review||''`) and calls `old.replaceWith(panel)`. A render happens:
  - after any successful `update()` (rating, «Посмотрю позже», reset), and
  - after `schedule()`/`refresh()`, which runs on the `YP_CHANGED` broadcast that `background.js` `broadcast()` sends to all YouTube tabs after every write, and on MutationObserver hits when the panel is detached or moved.

  Reproduction 1: open «Написать рецензию», type some text, then click «＋ Посмотрю позже» or pick a rating. The click light-dismisses the `popover=auto` editor (the text is still held in the detached-from-view textarea). The update then calls render, and the draft is gone.

  Reproduction 2: with the editor open and text typed, change anything from the popup or another YouTube tab. The broadcast re-renders the panel, the open popover is removed from the DOM, and the text is lost with no warning.
- `extension/popup.js` `render()`: the draft is kept only while `document.activeElement===$('review')`. Clicking a score button, «Удалить оценку» or «Посмотрю позже» moves focus to that button. `mutate()` then runs `finally{render()}`, which writes `$('review').value=item.review||''` over the draft. A failed «Сохранить рецензию» also resets the field to the stored value, because focus is on the button.
- Suggested direction: keep the draft outside the render (a per-video draft variable, or reuse the existing editor/textarea and update only the button states), and do not overwrite a textarea whose value differs from the last saved value.

### LOW

**L1. `extension/content.js` keep/drop handlers close the editor on failure.** `await update(...)` swallows errors (`notify`) and returns early when `busy` is set or when the video context changed (`schedule()`). `editor.hidePopover()` still runs unconditionally. The error appears in the panel status behind a closed editor, and on the context-mismatch path the following refresh re-renders and loses the text (see M1). Close the editor only on success.

**L2. Length limits disagree (content.js `area.maxLength=1000`, popup.html `maxlength="1000"` vs core and counter).** `maxlength` counts UTF-16 code units of the raw value, including leading and trailing whitespace. The counter and `core.review()` count code points after trim. With emoji or other astral characters, or padded text, input is blocked or a paste is silently truncated while the counter shows fewer than 1000. This is safe, because it is stricter than core, but confusing. Either drop `maxlength` and rely on the counter plus core validation, or document the behaviour.

**L3. `extension/core.js` `apply()` cleans legacy data only lazily.**
- Records that carry only `added:true` or `recommended:true` (no rating, «Посмотрю позже» or review) stay in `yp-library-v1` until that video is touched again. They are invisible in every UI.
- `state.channels` is deleted only on `UPDATE`, not on `OPTIONS`.
- A legacy `options.channel` stays until the settings are saved again.

  README line 19 states the "on next change" behaviour, so this is documented. Still, given the decision that there is no library, a one-time migration on read in the worker would remove data the user can no longer see or delete. Severity is LOW (local data only).

### NIT
- `src/main.tsx` redirect hook: for one render, `#/library` shows the fallback «Страница не найдена» before the effect calls `location.replace('#/watchlist')`. Normalising in the `useState` initialiser or the hashchange handler would avoid the flash. `replace` (not push) is correct, so Back does not loop.
- `extension/popup.js` list: `if(v.later)` around the remove button is always true now that the list filters `v.later`.
- `extension/content.js` `scores(panel,key,value)`: the `key` parameter is now always `'rating'`.
- `extension/tests/core.test.mjs`: there is no astral-plane case for the 1000-code-point limit (for example 1000 emoji accepted, 1001 rejected), no lone `\r` normalisation case, and no test of the UI draft behaviour.

### Questions: site features that contradict the customer decision (not fixed, by design of this review)
- **Q1. Manual recommendations.** The video page button «Поделиться» opens a modal «Рекомендовать видео» with «В ленту» (posts to the feed) and «Лично другу» (personal sends). The feed has a «Личные» tab and the aside «Ваши рекомендации … Делитесь видео из карточки». The decision says a video appears in followers' and friends' «Рекомендации» because of a rating or review, not through a manual recommend or share action. Should this modal, the «Личные» tab and the related copy go?
- **Q2. Channel ratings on the site.** The `/channel/...` page still has «Оцените канал», `/ratings` shows «Оценки каналов», and README.md:26 says "оценки видео и каналов". The extension dropped channel ratings. Are channel ratings still wanted on the site?
- **Q3. Site «Отзывы» vs extension «Рецензия».** The site has a separate local `yp-reviews` (keyed by title, also on channel pages) under a different name. Should these be unified into one video review concept (no channel reviews)?
- **Q4. API contract.** `src/shared/api/schema.d.ts` still exposes `/v1/me/library` (`listLibrary`), and lists.ts keeps the `'library'` kind. This is fine for now (site no longer routes to it), but it needs a backend decision.

## Verified
- `core.js`:
  - Patch keys are limited to rating/later/review. `later` must be a boolean; `rating` must be null or an integer 1..10.
  - Review: non-string is rejected (including `undefined`); `\r\n` and `\r` become `\n`; text is trimmed; empty is rejected; more than 1000 code points is rejected; `null` deletes and sets `reviewedAt=null`.
  - Merge strips `added`/`recommended` from the previous record and lets metadata overwrite stale title and channel.
  - An empty record is deleted. `channels` is removed on UPDATE. `options()` has no `channel` key and the default state has no `channels`.
- `background.js` is unchanged in f400099. Authorization (sender id, top frame, watch URL, GET/UPDATE only from tabs, video id must match the tab URL) and the serialized write queue are intact, and the worker tests pass.
- `content.js`:
  - All user and page text goes through `textContent`/`value`; there is no `innerHTML`.
  - Panel buttons, including the editor's Save and Delete, are disabled during `update()`.
  - There is an empty-text guard, and Delete is disabled with no saved review.
  - Focus moves to the textarea on open. The popover is clamped horizontally and vertically after `showPopover()`, and `aria-expanded` is synced.
  - No leftover channel or recommend code.
- popup: there is no «Все» tab, the list shows only `later` items, the counter updates on input and render, and «Удалить рецензию» is disabled with no saved review. The draft survives renders only while the textarea is focused (see M1).
- options.html/options.js: the channel checkbox is gone. Manifest is 0.4.0 with an updated description, and demo.html copy is updated.
- Site:
  - The nav has no library item.
  - `routeList('/library')` returns null (test updated), and the list effect makes no API call for `/library`.
  - The redirect `useEffect` is unconditional at the top level of `App`, before any return, and uses `location.replace`.
  - No leftover library UI text (the `Library` icon remains only as the empty-state icon). The extension showcase copy describes the three actions.
  - README.md and extension/README.md are updated; the old «Рекомендовать» mention is only in the historical "Версия 0.3" section.
- Tests run by the reviewer:
  - `node --test extension/tests/*.test.mjs`: **9/9 pass**.
  - `node --test tests/*.test.mjs`: **69/69 pass**.

## Not verified
- `pnpm build` (including tsc), `pnpm test:api` and `pnpm test:extension` could not be run by the reviewer (no pnpm in the review environment). They are author-reported PASS.
- No real Chrome or YouTube run. Untested here: popover behaviour, focus, light-dismiss, the M1 reproductions (derived from code reading), whether YouTube's own DOM churn moves `#top-level-buttons-computed` often enough to trigger extra re-renders, and layout and dark theme of the review editor.

Gate: FAIL (1 MEDIUM: M1 review draft loss; 3 LOW, 4 NIT, 4 questions)
