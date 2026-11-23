# EXT-001: контракт расширения и backend

Статус: спецификация интеграции. Runtime пока local v1; следующие этапы подключают контракт по очереди. Снимок API: backend4ddb58b, OpenAPI73операции. Chrome MV3 остаётся основным target; Firefox — отдельная dev-сборка по запросу заказчика. /shorts не поддерживается.

## Границы и идентификаторы

YouTube video ID (11символов) используется для observation/resolution через GET /v1/videos/by-youtube/{youtube_id} и POST /v1/me/videos. Внутренний video UUID из ответа используется для всех личных команд. Имя канала и @handle не заменяют UC identity: server channel UUID принимается только после подтверждения UC. Handle-only channel rating остаётся local-only (EXT-019), не отправляется наугад.

Content script не выбирает account, API origin, HTTP route, JWT, refresh, lease, revision или operation_id. Worker сам определяет текущую сессию и маршруты. Страница передаёт только ограниченный контекст текущего watch-видео и пользовательский patch. Метаданные из DOM — недоверенное наблюдение, не проверенная server identity.

## Runtime v2 (EXT-002)

| Команда | Отправитель | Payload | Ответ |
|---|---|---|---|
| YP_GET_CURRENT_VIDEO_STATE | top-frame YouTube watch; доверенный UI | videoId текущего видео | version, options.enabled/site, videos с единственным текущим видео (или пусто); без библиотеки/credentials |
| YP_UPDATE_CURRENT_VIDEO | top-frame YouTube watch; доверенный UI | video metadata + patch rating/later/review/mark | такой же ограниченный снимок после записи |
| YP_GET_ACCOUNT_LIBRARY | только popup/options | без payload | local/account library DTO без auth secrets |
| YP_OPTIONS | только options | enabled, site | options и library DTO без auth secrets |

Message type не предоставляет полномочий. Проверяются runtime.id, точный extension origin + allowlisted popup.html/options.html, frame0, sender.url и актуальный tab.url /watch?v. Options не открывает произвольные API origins: site — только пользовательская навигация. Auth/import/sync команды добавляются только в своих этапах и доступны trusted UI. Legacy YP_GET/YP_UPDATE после миграции адаптера не считаются допустимыми content командами. Неизвестные поля отклоняются, не отбрасываются молча.

## Состояния — независимые измерения

| Измерение | Значения | Правило |
|---|---|---|
| auth | guest, authenticated, session-expired | guest local namespace; успешный вход не импортирует local; expired сохраняет account outbox, не делает его гостевым |
| transport | online, offline | timeout/5xx не означает logout; новая команда остаётся в namespace владельца |
| sync | idle, syncing, conflict, error | offline не является доказательством успешного sync; conflict требует решения владельца |
| operation | pending, synced, error, conflict | operation_id(UUID), kind, target, expected_revision, исходный lease и payload неизменны при retry |

Credentials доступны только worker/trusted storage; UI получает безопасное состояние входа. Опции и legacy local data не смешиваются с account cache/outbox. Показ оценки до подтверждения сервера должен явно иметь pending/error, а не synced. Состояния из этой таблицы появятся в UI лишь после EXT-004/006/008/009, сейчас они не имитируются.

## Кнопки → команды API

| Действие | Намерение | API и результат |
|---|---|---|
| Оценка1..10 / снять оценку | video_state rating integer/null | PATCH /v1/me/videos/{UUID}/state; null сохраняется, не заменяется отсутствием |
| Посмотрю позже / снять | video_state later true/false | тот же PATCH, false отправляется явно |
| Просмотрено / Неинтересно / снять | video_state mark watched/not_interested/null | not_interested снимает later; later=true снимает not_interested; несовместимый patch422 |
| Добавить / удалить из библиотеки (если появится UI) | video_state added true/false | false сохраняется в payload; удаление по серверным правилам, не подразумевается снятием одной оценки |
| Сохранить / изменить / удалить рецензию | отдельный video_review text/string/null | PUT /v1/me/videos/{UUID}/review, собственная video_reviews.revision, отдельно от VideoState.revision; кнопка сохранения, без скрытой публикации |
| Рекомендовать (если действие будет показано) | открыть карточку видео на сайте для редактирования оценки/рецензии | Отдельного composer/post нет (YP-099): сохранённые оценки и рецензии автоматически попадают в ленты по privacy. Кнопка не создаёт отдельную публикацию. |
| Оценка канала | channel_rating integer/null | PUT /v1/me/channels/{UUID}/rating только с подтверждённым UC; provisional alias local-only |
| Войти / выйти | auth | отдельная extension session, worker login/refresh/logout (EXT-004/005), не изменяет web session |
| Повторить / конфликт | исходная operation / reconcile | retry сохраняет key/lease/payload;409 GET+явное решение, не last-write-wins |

API writes используют expected_revision, Idempotency-Key UUID и X-Offline-Lease. Порядок intents сохраняется отдельно по (kind,target): video_state и video_review имеют независимые revision, channel_rating — свою. expected_revision берётся из соответствующего GET state/review/channel, а не из соседнего вида операции. Account lock/change_seq не объединяет эти счётчики. На новую команду новый key; неопределённый ответ повторяет прежний key. После lease expiry не создаётся новый lease для старой команды автоматически. 401 — единственный bounded refresh retry,403 не refresh;410 — reconcile,429 Retry-After. DELETE UI действует по общему правилу5с отмены перед network request. Ответ старого owner/epoch не меняет новое состояние.

## Перенос и приёмка следующих этапов

Новая авторизация не импортирует legacy_local_v1. Только preview+явное подтверждение владельцем (EXT-012); backup не содержит JWT/refresh/lease. Worker restart не должен терять durable outbox (EXT-006/008), refresh attempt сохраняется до отправки (EXT-005). Content DTO не содержит чужие videos, user email, токены, lease или всю очередь. EXT-002 regression cases: iframe/foreign origin/поддельный popup URL/stale videoId/переход SPA/auth command от страницы/неизвестное поле; допустимые null/false/mark/review не теряются.

## EXT-012 actual import boundary
Explicit trusted preview/commit uses existing typed per-row personal commands, batches12, captured revisions and durable fixed operation keys. import_id and batch progress live only in this extension profile; server stores ordinary transactional idempotency receipts, not a separate import manifest. Existing-server values kept by default, conflicting/pending objects require explicit reconciliation. Source legacy backup is never deleted. Ratings/reviews follow normal account privacy; legacy recommended flag is not a separate post or DM action. See DEC-EXT-012-ROW-API in todo.md for the deliberate scope choice.

