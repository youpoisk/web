# Independent review — frontend a821654

Gate: FAIL pending P2 correction.

## P2 — Duplicate sibling keys in settings composition

Location: src/main.tsx, settings branch (line 51 in this reviewed source; PrivacyPanel/BlocksPanel/SecuritySessions bindings).

All three panels are siblings in the same settings Fragment and are rendered together in All, each with key={authView.user.id}. The new SecuritySessions adds a third collision. Switching All / Privacy / Security reconciles changing sibling sets with non-unique identity, allowing retained/duplicated panels or misplaced local state. This is the same failure class as the previously corrected people-search/friends-list duplicate keys. Use distinct keys such as owner+':privacy', owner+':blocks', owner+':sessions'; regression should switch settings tabs and leave settings for feed, ensuring no private settings panel remains or duplicates. This finding is based on exact JSX composition; parent independently reports observing related duplication while investigating the user's UI report. Do not defer this wiring correction to a new feature.

## Other reviewed paths

SecuritySessions reads only own active sessions with limit50/cursor, deduplicates IDs and retries a failed page. Immediate reading/busy refs prevent competing UI read/write actions; generation/serial checks ignore obsolete completions. Individual revoke uses explicit confirmation; the current marker selects the auth-coordinator logout path rather than direct revoke. Bulk revoke explicitly warns that it covers unloaded devices, calls the server bulk operation (not a loop over loaded rows), clears obsolete items/cursor and refreshes. Network/HTTP failure does not claim successful revocation. Helpers preserve cursor/signal and propagate errors without storing credentials. Target ownership is enforced by the already reviewed backend rather than client assumptions.

Independent checks: pnpm typecheck:api PASS; pnpm test:api PASS 93/93 under disallow-code-generation-from-strings; gated handwritten core lines/functions100 and new devices.ts branches100. React component interactions were inspected statically; author reports selected-probe browser revoke followed by401 and preserving other sessions. Reviewer did not mutate QA data, edit repository files or commit. Bulk live logout was not performed.
