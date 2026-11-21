# Demo profile removal review (WEB-REL-001)

Commit: f9c18d7 "feat(release): remove the demo profile in favour of real accounts" (parent cbd43e3).
Independent reviewer, source review via device shell. Gate: FAIL.

## Scope result

The demo profile itself is gone. No match for демопрофил / демо-профил / ДЕМОПРОФИЛ / demoProfile / demo profile / demo-profile / «Выйти из демо» / demo-logout in src/, extension/, public/, README.md, index.html, scripts/ or the rebuilt dist/. Remaining "demo" hits are the shared demo VIDEO CATALOG (src/data/demo-videos.ts, scripts/demo-catalog.mjs, extension/demo*.js|html, popup example button, .demo-label CSS class name) and are out of WEB-REL-001 scope. All six former demoProfile gates now use `signedIn` (= authView.status==='authenticated'); `setDemoProfile` state is removed with no dead branches; sidebar/header avatar and name use `me`; every logout button calls `logout` -> `endAuth` -> `signOut` -> `session.logout()` (bearer POST /v1/auth/logout) and returns a guest view. Guest gates (profile/settings/notifications/friends/subscriptions page gate, reviews, share via requireProfile, feed friends/personal tabs, "Друзья уже посмотрели") are intact for guests.

The gate fails because a fake authentication flow and a fake local identity remain reachable for real accounts.

## Findings

1. HIGH - fake password-reset / e-mail-verification flow still shipped and reachable. src/main.tsx:20 renders /forgot-password, /reset-password, /verify-email as local mock pages: reset-password has an `<input type="password">` (also in dist/assets/index-*.js), submit only sets `sent` and shows «Демонстрационный запрос обработан. Письма не отправляются.», and the subtitle says «Макет: данные не отправляются на сервер. Не используйте настоящий пароль.». Entry points: «Забыли пароль?» link on the real /login and /register pages (src/main.tsx:20) and, for an authenticated real user, Settings -> Безопасность «Изменить пароль» / «Подтвердить почту» (src/main.tsx:23). This is the "фиктивный вход и связанные подсказки" the acceptance criterion requires removing, and it contradicts the task-log claim that this site has no password fields. Fix: delete the three mock routes from the `auth` route list and form, remove the «Забыли пароль?» link and the two Settings buttons (or point them at the broker's own reset/verify pages if the API provides them); keep the broker notice for /login and /register only.

2. MEDIUM - mock local `profile` (yp-profile, default {name:'Александр', login:'alexander', email:'alex@example.com', bio}) is still presented as the signed-in user's identity:
   - reviews are signed `{profile.name}` (src/main.tsx:18, reviewSection);
   - shared feed posts are stored with `author:profile.name` (src/main.tsx:30, share modal);
   - /profile subtitle shows `profile.bio` (src/main.tsx:26);
   - Settings -> Личные данные edits name/login/email of the mock object, «Профиль сохранён локально» (src/main.tsx:23), while the Безопасность block on the same page shows the real `me.email`.
   A real user therefore sees "Александр / alex@example.com" as their own data. Fix: use `me.name||me.login` for review/post authors, drop or hide the bio, and make the Settings profile form read-only from `me` (or remove it) until a server profile-update endpoint exists; stop reading yp-profile.

3. MEDIUM - public README still says real auth is absent. README.md:3 «Backend и настоящая аутентификация пока не подключены ... не вводите настоящие пароли». After cbd43e3/f9c18d7 this is a false public instruction. Fix: describe the broker login/register/logout and that passwords are entered only on the API page.

4. LOW - local prototype data and seeded fixtures appear inside real accounts and are shared across accounts on one browser. useLocal keys (yp-ratings, yp-later seeded with two videos, yp-friends seeded with Анна/Марк, yp-requests, yp-follows, yp-posts seeded post, yp-reviews, yp-personal) are not namespaced per account (src/main.tsx:9). Nothing is sent to the server, so this is not an import into server accounts, but a second real user signing in on the same browser sees the first user's local reviews/posts/friends, and fixture friends/notifications («Демонстрационное уведомление», src/main.tsx:27; «Отправлено ... в макете», src/main.tsx:30) are shown as account data. Fix (or record as an explicit decision): key account-only local state by account id or clear it on sign-out/account change; label remaining fixtures as examples.

5. LOW / informational - leftover prototype labels: footer «Макет · 2026» and stat «видео в макете» (src/main.tsx:26,29). Not demo-profile text; tidy before release. dist/extension/backend-integration-plan.md (untracked internal plan in extension/) is copied into the production bundle; exclude internal docs from the extension copy.

## Verified
- `git show f9c18d7`: diff limited to src/main.tsx, src/style.css (demo-logout -> account-logout), todo.md, docs/task-log.md; no historical commits or internal reports rewritten.
- Text search of src/, extension/, public/, README.md, index.html, scripts/, dist/ for the demo-profile terms: no matches.
- Every former demoProfile gate replaced by signedIn; avatar/name from `me`; logout path endAuth -> signOut -> session.logout; guest gates unchanged in behaviour.
- No new token, credential or password handling in main.tsx; no storage/URL token use added by this commit (localStorage use is the pre-existing useLocal UI state and the authSession port from cbd43e3).
- `node --test tests/*.test.mjs`: 56/56 PASS.

## Not verified
- pnpm build / typecheck PASS, dist freshness and the browser check (/login shows only the broker «Войти» and guest continue) are author-reported; pnpm symlinks do not resolve in the review shell. Note that /forgot-password etc. would still show the mock form in a browser.
- RU/EN, mobile/desktop and E2E guest -> register/login -> profile -> logout on a production candidate (deferred by the author to YP-070/YP-086).
- docs/reviews/broker-runtime-integration.md (cbd43e3 review) not present; auth runtime internals not re-reviewed here.

No source edits were made by the reviewer; only this report file was written.
