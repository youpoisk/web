# Проверки расширения

## Воспроизводимый запуск

- `pnpm test:extension:coverage` — unit/regression, 100% строк и функций для `extension/auth/{backend,session,sync}.mjs`. Покрытие ветвей измеряется отдельно, не объявляется 100%.
- `pnpm extension:verify` — контракт, standalone validators, bundle drift, unit coverage, обычная Firefox-сборка и Mozilla lint.
- `pnpm extension:verify -- --api` либо `node scripts/extension-verify.mjs --api` — дополнительно последовательные auth/business/sync/import API probes, Firefox DOM/ACK и controlled-stop.
- `pnpm test:api` и `pnpm build` — общий API/core coverage и сборка сайта.

Для `--api` нужны локальные Docker API/PostgreSQL на127.0.0.1:18080 и подготовленный зарезервированный `qa_block_probe`. Native-сессии не завершают web-вход пользователя. Все probes восстанавливают исходные значения; Firefox имеет независимый host recovery, в том числе при контролируемой остановке браузера. При принудительном убийстве самого Node host cleanup гарантировать нельзя.

Каждый общий gate сохраняет отдельный каталог `.artifacts/extension-verification/<UUID>/` с commit, dirty marker, версиями runtime, логами этапов и результатом. Firefox дополнительно сохраняет отдельные run metadata/result с SHA256 worker. QA-пакеты из `.artifacts/firefox-extension` с добавленными probes нельзя устанавливать пользователю или отправлять в магазин: для этого создаётся новая обычная сборка.

## Проверенная матрица EXT-015

| Сценарий | Проверка |
|---|---|
| sender/frame/live URL, readonly content DTO | unit Chrome/Firefox adapters |
| login/refresh/logout, lost refresh response | unit + real API + Firefox IDB |
| state/review independent revisions, null/false, watchlist12 | unit + real API/PostgreSQL |
| outbox crash/lost ACK, original key/body/lease | unit + real Firefox injected ACK failure; revision increases once |
| new-video add receipt → queued state revision | unit + disposable PostgreSQL catalog/commands |
| offline chain, website conflict, preview fence | unit + real API primitives |
| snapshots/delta/tombstones/cursor restart, owner isolation | unit + real API + disposable PostgreSQL + Firefox IDB |
| import preview/commit/retry, preserved source | unit + real API |
| queue keep/discard/explicit epoch resume | unit + native IDB transaction tests |
| quota, unexpected IDB close, closed UI/tab, late response | unit/fault matrix |
| rating UI, cancel delete, expiry race, SPA, Shorts, missing metadata | controlled DOM fixture in real headless Firefox |
| accidental QA/demo/credential packaging | normal-package whitelist regression |
| interrupted Firefox fixture restoration | controlled-stop + independent host repair |

Последний полный gate:112tests; auth/transport/sync100% lines/functions, branches86.24%. Shared API/core100% lines/functions. Mozilla lint0errors/0warnings. Real API/Firefox/controlled-stop PASS, QA restored.

## Открытые внешние проверки

Пользователь выбрал Firefox. Его функциональные проверки выполняются через официальный Mozilla web-ext в отдельном headless-профиле. Контролируемый DOM-стенд проверяет код панели, но не доказывает совместимость с каждой текущей вёрсткой настоящего YouTube и не является визуальным просмотром основного профиля.

Установленный Chrome/MV3 и ручная YouTube-проверка остаются release gates для Chrome Store; unit VM не выдаётся за установленный Chrome. Сейчас публикация не выполняется: production URL сайта/API ещё не предоставлены, пользователь поручил только подготовить пакет. Полный нагрузочный baseline backend10k accounts/500 independent active actors (TST-007) также не считается выполненным этим extension smoke.
