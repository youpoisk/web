# Review: privacy settings page (YP-056 website)

Commits: c75feab (contract import 12d8d66), df7cd83 (PrivacyPanel, loadPrivacy/changePrivacy, settings wiring, task log).
Reviewer: independent code review, 2026-11-21. Read-only; no source edits.

## Summary

The contract import is exact and the panel is careful about generations, unmounts, double submits and 409 reloads. One wording problem matters: the
«Кто видит мои рекомендации» select changes `recommendations`, which the backend stores but never applies. The «Рекомендации» list on a user
profile follows the ratings and reviews policies instead. A user who sets it to «Только я» will think their profile list is hidden, but others
can still see it. Watchlist and friends/subscriptions are also stored without being applied. Nothing exposes them to other users today, so
there is no leak there, but the UI does not say they are not applied yet.

## Findings

### MEDIUM

- **M1. «Кто видит мои рекомендации» has no effect, and the UI implies it does.** `src/components/PrivacyPanel.tsx` `fields` entry
  `['recommendations', ...]`. In the backend, `recommendations_visibility` is read and written only in `internal/platform/postgres/privacy.go`.
  `internal/platform/postgres/profiles.go` (`profileAccess`, `Recommendations`) uses only `ratings_visibility` and `reviews_visibility`, and the
  contract text for getPrivacy says the ratings and reviews policies apply to user profiles and recommendations. So setting «Только я» here leaves
  the profile «Рекомендации» list visible. Fix: hide this select, or mark it clearly as not applied yet and say the profile list follows the
  ratings and reviews settings. The backend could also start enforcing it.

### LOW

- **L1. Watchlist and social settings are shown as if they work.** `PrivacyPanel.tsx` `fields` `watchlist`, `social`. The backend stores them but no
  read path uses them. No other user can see a watchlist or friends list yet, so nothing leaks. Still, the intro text should say these apply once
  those features exist. Only ratings and reviews are enforced today. The note that «Друзья и подписчики» means friends only for now is accurate
  (profiles.go treats `friends_and_followers` like `friends`).
- **L2. A failed first load has no retry.** `PrivacyPanel.tsx` `reload`: when the first GET fails, the panel shows only the error text, with no
  selects and no button. The user has to leave the settings page and come back. Add a «Повторить» button.
- **L3. A 409 followed by a failed reload shows a wrong message.** `PrivacyPanel.tsx` `change`, conflict branch: `await reload()` may set
  «Не удалось загрузить…», and the next line overwrites it with «…Показаны актуальные», while the old values are still on screen. Only show the
  conflict message when the reload succeeded. Every later change would 409 again, which recovers, but the text is wrong in the meantime.
- **L4. The legacy local section appears for guests and during auth loading.** `src/main.tsx`, settings branch: the condition
  `!(authView.status==='authenticated'&&apiClient)` also matches `loading` and `redirecting`. Signed-in users can briefly see the old localStorage
  selects. Guests get editable selects (`yp-privacy`) that do nothing. This behaviour predates these commits, but the server panel now exists, so a
  guest would be better served by a «Войдите, чтобы настроить приватность» note than by fake controls.
- **L5. Every save error gets the same message.** 401/403/429/503 and network errors all show «Не удалось сохранить…». That is acceptable, but
  429 Retry-After and 503 could have their own messages.
- **L6. No component tests.** Only `loadPrivacy`/`changePrivacy` are tested (`tests/lists.test.mjs`). None of the panel's state logic is tested:
  generation guard, busy ref, 409 path.

### NIT

- N1. «Все» stands for `public`, which the contract defines as "every signed-in viewer". The real audience is narrower than the label, so this is
  safe, but «Все пользователи» would be more precise.
- N2. While a save runs, every select is `disabled`. A focused select that becomes disabled can lose keyboard focus in some browsers. Consider
  `aria-disabled` plus ignoring changes, since `busy` already guards against double submits.
- N3. `busy.current` is not reset when the generation changes during a save (`finally` checks `stamp === generation.current`). Today the client
  is a module-level constant and the parent keys the panel by `user.id`, so the panel remounts instead. If the client identity ever changed while
  mounted, the selects would stay disabled.
- N4. `PrivacyField` includes `library`, which the UI does not offer. This is intended and documented in the task log.

## Verified

- `contracts/openapi.json` is byte-identical (`cmp`) to backend `api/openapi.json` in the working tree and at commit 12d8d66.
  `contracts/source.json` records commit 12d8d667…. The contract has 36 operations.
- Contract: the PrivacySettings schema requires revision plus six fields with the enum public/friends/friends_and_followers/private. PrivacyPatch
  requires `expected_revision`, has minProperties 2 and does not allow additional properties. `changePrivacy` sends exactly
  `{expected_revision, [field]: value}`.
- Render conditions: PrivacyPanel renders only when `authView.status==='authenticated' && apiClient`, keyed by `authView.user.id`. Everyone else
  gets the legacy section (see L4).
- Revision handling: each change is sent at `settings.revision`, and the response replaces the state. A same-value select is a no-op. `busy` ref
  plus disabled selects prevent concurrent PATCHes. On 409 (`conflicted`: ApiError http 409) the panel reloads and shows an explanation.
- Stale responses and unmount: a generation stamp guards every setState, the effect cleanup aborts the GET, and an aborted load does not show an
  error.
- Accessibility: each select is wrapped in a label with descriptive text. Status and loading messages use `role="status"`, and the section has
  `aria-busy`.
- XSS: everything renders as React text nodes and enum option values. There is no innerHTML.
- Hooks: no conditional hooks. The effect depends on `[client]`. `reload` is not in the deps but reads only refs and the client.
- Backend enforcement checked: only ratings (friend ratings, profiles, recommendations) and reviews (profiles, recommendations) are applied.
  `friends_and_followers` is treated as friends.
- Tests: `node --experimental-test-coverage --test tests/*.test.mjs` gave 83/83 pass and 0 fail. `lists.ts` coverage is 100% lines, 99.12%
  branches, 100% functions.

## Not verified

- `pnpm build` / `tsc`. The author reports the frontend gate as PASS. I could not run pnpm in this environment.
- I did not run the page in a browser: rendering, layout of `.setting-row`, focus behaviour, the real 409 flow against a live API, and how screen
  readers announce the status messages are all unchecked.
- I did not re-check the generated `validators.js`/`schema.d.ts` against the generator beyond the commit stat and the passing validator tests.

Gate: FAIL (one MEDIUM: M1, the «Кто видит мои рекомендации» setting has no effect)
