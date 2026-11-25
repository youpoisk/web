# CI сайта и расширения — YP-068

Workflow verify.yml запускается на push/pull_request/workflow_dispatch. Node24.22.3 и pnpm11.25.0 закреплены; frozen-lockfile запрещает незаметное изменение зависимостей. Checkout/setup-node закреплены SHA официальных релизов, contents:read, credentials не сохраняются. Нет production секретов, публикации или pull_request_target.

Gates: pnpm build (контракт/validators/typecheck/TypeScript/Vite), pnpm test:api (100% core lines/functions), pnpm extension:verify (contract/worker bundle/unit/Firefox build/lint), pnpm audit --audit-level high. Уязвимость high/critical либо недоступность registry ломает gate; исключений и continue-on-error нет. Dev зависимости тоже проверяются.

Используется импортированный backend contract с commit/hash provenance; CI не требует доступа к другому приватному репозиторию. При изменении backend API сначала импортировать его проверенный коммит и regenerate validators/worker. Live API, браузерный вход, production адреса и публикация не заменяются этим gate.

Git remote пока отсутствует: локальные команды проверяются, успешный облачный запуск не заявляется. После назначения remote/push проверить первый run и настроить required check.

Источники pins: https://github.com/actions/checkout/releases/tag/v7.0.1 ; https://github.com/actions/setup-node/releases/tag/v7.1.0 .
