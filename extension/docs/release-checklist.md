# EXT-020 — подготовка выпуска без публикации

Решение заказчика: production адресов пока нет, подготовить пакет без публикации. Store availability и production readiness остаются открытыми.

## Воспроизводимая подготовка

1. Завершить unit/API gates: `node scripts/extension-verify.mjs --api` (QA smokes последовательны, восстанавливают данные и исходный Firefox origin).
2. Выполнить `node scripts/prepare-extension-release.mjs`. Это чистые development сборки, SHA256 каждого файла, детерминированные ZIP, release.json с commit/dirty marker и документы. Скрипт не подписывает, не загружает и не публикует ничего.
3. Сверить SHA256 архивов и повторную сборку. QA-модифицированные smoke каталоги не являются пакетами для пользователя.
4. Для production после получения адресов: `node scripts/prepare-extension-release.mjs --production --site-origin=https://SITE --api-origin=https://API`. Подставить реальные origins. Loopback и недостающий адрес отклоняются. Зафиксировать release commit без tracked changes, получить новый report.

## Внешние условия выпуска

- [ ] Реальные HTTPS сайт/API, точные CORS/browser origins и политика данных по публичной ссылке, контакт и юридические сведения издателя.
- [ ] Установленный Chrome smoke с сервером: отдельная auth session, rating/review/later, offline/restart/lost ACK, SPA/Shorts, истёкшая/отозванная/удалённая учётная запись, ручной visual layout настоящего YouTube.
- [ ] Firefox manual live YouTube smoke на финальной чистой версии и сценарий обновления dev→signed без утраты pending. Автотест изолированного Firefox/DOM не заменяет визуальную проверку.
- [ ] Provider-confirmed channel fixture/end-to-end проверка реального переноса, включая server-side revocation proof. DOM UC/handle не заменяет provider verification.
- [ ] Проверить актуальные условия YouTube, Mozilla/Chrome policies и data usage declarations; screenshots только актуальные без QA/личных данных.
- [ ] Доступ к developer account, signing/Store submission и внешнее review. Не менять signature preferences и не публиковать dev loopback package.
- [ ] Capacity/load acceptance backend (10 тыс. пользователей/500 одновременно) и прочие общесервисные MVP gates проверяются отдельно.

## Откат

Перед откатом синхронизировать или явно оставить/удалить ожидающие изменения, отозвать сессию. Не интерпретировать v2 storage как старую v1 библиотеку. Server-accepted данные не откатываются удалением addon. Историю source/пакетов не перезаписывать; новая подготовка сохраняется в новом каталоге.
