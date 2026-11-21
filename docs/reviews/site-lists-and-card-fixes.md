# Site own lists, writes and server card - fix round review

Fix commits: frontend 5ef71f2 "fix(library): server card first, in-place 409 refetch, idempotent retries and write guards"; backend 4819cbf "chore(dev): run only committed gate scripts; reserved e2e video with replay and lease checks".
Earlier review: docs/reviews/site-lists-and-card.md (Gate: FAIL, findings 1-10).
Independent reviewer, source review via device shell. Gate: PASS.

## Summary

All four MEDIUM findings (1, 2, 3, 8) are fixed. The LOW and NIT findings (4-7, 9, 10) are fixed too. The new code adds no MEDIUM or HIGH issue.

- 1: `/video/<11>` now always loads the server card. Signed-in viewers read through `apiClient`, everyone else through `guestClient`. The demo page shows only when the server answers 404 or fails for a demo id.
- 2: a 409 on the list toggle refetches the list in place (`listGen`). The page is no longer reloaded.
- 3: StateWriter keeps the Idempotency-Key of a write whose outcome is uncertain. It reuses that key only for an identical body on the same video, and drops it on any definite answer. This matches ADR-0006: the receipt is looked up and replayed before the lease and version checks, and the request hash leaves out the key and the lease.
- 4: writes have a per-uuid in-flight guard, and concurrent writes share one lease request (the cached promise is reset on rejection).
- 8: the gate runner resolves `scripts/gates/<name>.ps1` on every request. It runs the script only if git tracks it and it matches HEAD, and the header comment now states the rule accurately.
- 9: auth-e2e uses one reserved video id, cleans it up at the end, and covers exact replay and the 410 lease cases.

The remaining points are LOW or NIT:
- two UX side effects of showing the server card first;
- a gate-runner rule that only holds while nobody tampers with git metadata;
- a 1-in-4096 flake in the damaged-lease check.

## Findings

1. LOW - the card page shows the demo page (with local-only writes) while auth is still loading, and for one frame can show the previous video's card. src/main.tsx:23, remote effect: `authView.status==='loading'` leads to `setRemote(null)`, so the render condition at src/main.tsx:34 (`remote&&(remote.loading||remote.card||!current)`) falls through to the local `current` page. For demo-catalog ids, a signed-in viewer therefore sees «Оценки и действия пока хранятся локально» with working local watch-later and score buttons until boot finishes. These are exactly the ids that finding 1 was about. Separately, `remote` is not checked against the current route id. On a /video/A -> /video/B navigation (or /video/A -> another route), the first render still holds `remote={id:A,card:A}` and paints card A until the effect runs. This was already the case before the fix, but it now covers demo ids as well. Fix: render a loading panel when the route is `/video/<11>` and `authView.status` is 'loading' or 'redirecting', and treat `remote` as absent unless `remote.id` equals the route id.

2. LOW - showing the server card first removes some demo-page features for videos that exist on the server. The server card (src/main.tsx:34) has no reviews section and no «Поделиться» button. A guest also gets no watch-later button there: `own` is undefined, and the guest's local watch-later list can only be toggled from the grid. Since the QA seed uses demo ids, these features disappear for every seeded video. This may be intended («demo page only as fallback»), but it is a visible change. If it is intended, record it in the task log. If not, keep reviewSection/share on the server card, and for guests the local watch-later toggle.

3. LOW (backend 4819cbf) - "committed and identical to HEAD" can still be bypassed by anyone who can run git in the repository. scripts/gate-runner.ps1 Resolve-Gate checks `git ls-files --error-unmatch` and `git diff --quiet HEAD`, then executes the working-tree file. The rule is enforced against the plain case: an untracked or modified file is rejected on every request, and nothing is cached. However, `git update-index --assume-unchanged/--skip-worktree`, or a clean filter or textconv added to .git/config, makes `git diff --quiet` report "unchanged" for a modified file. The file can also change between the check and the run. An assistant with shell access to the mounted repository can also simply commit, so "committed" does not mean "reviewed". The header now says honestly that the other gates run working-tree code, which is why this is LOW rather than MEDIUM. Fix (cheap and robust): skip the working-tree check entirely. Run `git show HEAD:scripts/gates/<name>.ps1` into a temporary file under .artifacts and execute that copy. This removes the index, filter and race issues; only what is in a commit runs.
   PowerShell notes (no issue found): `& git ... *> $null` followed by `$LASTEXITCODE` works in 5.1 with `$ErrorActionPreference='Continue'`, because the redirected stderr records are discarded and are not terminating. Arguments containing spaces in `$backend`/`$script` are quoted by PowerShell's native argument passing. `-notmatch` is case-insensitive, so `AUTH-E2E` passes the regex and Test-Path on the case-insensitive file system. That only matters if git also matches the pathspec, and then the HEAD comparison still applies, so it fails safe. `-cnotmatch` would be stricter.

4. NIT - remoteWrite (src/main.tsx:23) releases `pending` without try/finally. Today every awaited path is caught: patch is inside try/catch, and `loadCard(...).catch(()=>c)` handles the refetch. So the guard is always released, but a future edit could easily break that; a `finally` would be more robust. Also, if the refetch after a successful write fails, the old card (with the old revision) is kept, so the next click gets a 409 with the «на другом устройстве» toast. That is self-correcting, because the 409 path refetches.

5. NIT - the in-place refetch after a 409 (src/main.tsx:23, list effect) keeps the old items visible, as requested. On success, though, it replaces the list with the first page only, so pages already loaded with «ещё» and the scroll position are lost. On error it replaces the visible items with the error panel. Both are acceptable. Merging by uuid, or keeping items on error with a toast, would be smoother.

6. NIT (backend 4819cbf) - the damaged-lease check (scripts/auth-e2e.mjs:124) replaces the last two characters with 'AA'. A lease is 81 bytes, 108 RawURL characters, decoded strictly, with no padding bits (internal/platform/lease/lease.go), so the change always alters MAC bits unless the lease already ends in 'AA' (1 in 4096). In that case the write succeeds, the cleanup PATCH gets a 409, and the run fails once and then heals on the next run. Fix: replace the final character with one that is guaranteed to differ, e.g. `lease.slice(0,-1) + (lease.endsWith('A') ? 'B' : 'A')`.

7. NIT - the backend working tree now has untracked files: internal/application/catalog/search.go, search_test.go and internal/platform/postgres/catalog_search.go. If the auth-e2e image builds from the working tree, the author's two PASS runs included code that is not in 4819cbf. The uncommitted postgres changes noted in finding 10 are gone (committed in 64288af).

## Status of earlier findings

- 1 MEDIUM - fixed. The remote effect no longer skips demo ids. `reader = authenticated ? apiClient : guestClient`. The demo page is used only for 404 or error on a demo id. Residual UX points in findings 1 and 2 above.
- 2 MEDIUM - fixed. 409 leads to `setListGen(g=>g+1)`, and the effect keeps `prev` (same kind, not loading, no error) while it refetches. No `location.reload`, and the dead setState has been removed.
- 3 MEDIUM - fixed. Details under Verified.
- 4 LOW - fixed. A `pending` ref Set keyed by uuid is shared by the list toggle and card writes. serverToggleLater releases it in try/finally, and remoteWrite releases it on every path (finding 4 above). The lease promise is cached and reset only if it is still the same rejected promise.
- 5 LOW - fixed. `guestClient` (session `{state:'guest'}`) is used whenever the viewer is not authenticated, including status 'error' with a 'recovering' scope.
- 6 LOW - fixed:
  - the count, sort and category filters are hidden when `serverList` is set;
  - the poster number is rendered only when `videos.includes(v)`, so server cards get none;
  - a card with an empty channel shows the text «Канал неизвестен» instead of a link;
  - the sidebar watch-later counter shows only when `!signedIn`.
- 7 LOW - fixed. The `moreReq` AbortController is aborted when the list effect reruns, a second click is ignored while a request is in flight, a page is appended only if `prev.kind===kind && prev.next===cur.next`, items are deduplicated by uuid, and `moreReq` is cleared in finally only if it is still the same controller.
- 8 MEDIUM - fixed for the stated threat (untracked or modified scripts are rejected on every request, nothing is cached, the header is honest). Residual hardening in finding 3.
- 9 LOW - fixed. Reserved id 'E2eQaVideo0'. Exact replay is checked (same revision and change_seq), 410 is checked without a lease and with a damaged lease, and the run ends with a PATCH `added:false`.
- 10 NIT - addressed in docs/task-log.md (pin 80ac923, branch coverage 98.28%, which matches the coverage run below).

## Verified

- StateWriter (src/shared/library/lists.ts) against backend docs/adr/0006-account-locked-commands.md and internal/transport/business/api.go operationError:
  - The key is reused only when the stored fingerprint for that video equals `JSON.stringify({expected_revision, ...change})`, so a replay always carries an identical body and can never hit the 409 key-reuse branch.
  - A changed expected_revision or a different change gets a fresh key. A different key order in `change` also gets a fresh key, which fails safe.
  - "Definite" means any HTTP status except 429 and 5xx. 200, 409, 410 and 422 drop the key; network, timeout, abort, 429 and 5xx keep it. Reusing a key in those cases is always safe, because the server either replays the receipt or executes the command fresh.
  - On 410 a fresh key is correct: 410 comes from a lease that is invalid or absent on a fresh execution, and the server stores no receipt in that case. The 410 retry happens only on attempt 0, after `#lease=null`.
  - A replay after the lease has been renewed is fine, because the lease is not part of the request hash and the replay happens before the lease check.
  - Concurrent first writes share one lease request, and a rejected lease promise is forgotten (test "concurrent first writes share one lease request...").
- main.tsx:
  - All hooks (useState/useRef/useEffect, including useLocal) are called unconditionally at the top of App. The only early returns are inside nested helpers such as reviewSection, not inside App before its hooks.
  - The card branch condition is `remote&&(remote.loading||remote.card||!current)`, with 404 leading to «Видео пока нет в YouPoisk» and error leading to the error panel.
  - The remote effect depends on `[route, authView.status]` and is aborted on rerun.
  - After a write, the card is refetched with `apiClient` and set only if `prev.id` matches.
- auth-e2e repeatability:
  - The card GET returns 200 with my_state for a video that is in the catalog but was removed from the library by the previous run.
  - The POST uses that revision.
  - The 410 and 409 probes change no state, so the final `added:false` with `toggled.revision` is current. ADR-0005/0006 say explicit membership removal keeps the carrier and its revision, so the next run starts from a consistent state.
  - The global catalog keeps one row, which is acceptable.
  - The damaged lease is invalid with probability 4095/4096 (finding 6).
- gate-runner.ps1: Resolve-Gate runs on every request with nothing cached; regex, fixed directory and Test-Path -LiteralPath; PowerShell 5.1 semantics as described in finding 3.
- Frontend unit tests: `timeout 150 node --experimental-test-coverage --test tests/*.test.mjs` gave 67/67 PASS, exit 0. lists.ts: 100% lines, 98.28% branches, 100% functions. client.ts: 100% lines, 96.77% branches.

## Not verified

- I could not run the frontend gate (pnpm build including typecheck, test:api, test:extension): there is no pnpm in the review shell. Its PASS is author-reported.
- I could not run backend auth-e2e, so "PASS twice in a row" is author-reported. There is no Docker or network in the review shell, and the run may have included the untracked search files (finding 7).
- There was no browser run of the card or list UI. The flash and loading behaviour in finding 1 is derived from the code.
- I did not execute gate-runner.ps1 under Windows PowerShell 5.1; the PowerShell analysis is from reading the code.

No source edits were made by the reviewer; only this report file was written.
