# Independent review — subscriptions All and avatar requirement

Verdict: PASS. No actionable MEDIUM/HIGH in frontend 70b9047 or requirement-only backend 70e02e2 and frontend d988477.

The authenticated subscriptions branch now renders two separately labelled sections on All. Each owns a distinct section key and a direction-scoped SubscriptionsList key. Following and followers therefore retain independent item/cursor/error/load state and call the existing direction-specific helpers. Dedicated tabs render only the corresponding section. Removing a following edge remains available only in the following list; the reverse edge is independent. Shared users may correctly occur in both sections. The known duplicate sibling-key failure is not reintroduced, and switching routes remains inside the existing keyed route boundary. This delta adds no API writes, mock fallback or privacy bypass.

Independent pnpm typecheck:api and pnpm test:api PASS (101/101, gated handwritten core lines/functions100). UI composition inspected directly. Author reports build PASS and CUA All4following+4followers, followed by follower-only section; reviewer did not execute browser interactions or mutate QA records.

YP-100 records a new upload task rather than claiming avatar runtime exists. It specifies server-side raster decode/limits/crop/re-encode to64x64, rejects SVG/animation, discards source/EXIF, binds modifications to the live owner, stores one current small payload atomically in PostgreSQL, preserves profile/block/inactive access policy and includes revision/cache/deletion/concurrency tests. Backup/WAL retention is explicitly distinguished from current live-row storage. No scope contradiction or material missing prerequisite requiring plan rejection found. Media decoder hardening, actual size/format limits, authorization/cache behaviour and one-row replacement must be verified during implementation; this is not certification of uploaded image safety or completed avatar support.

Frontend d988477 consistently connects the avatar plan to settings upload/replacement and own/foreign profile rendering, server-confirmed success, account-switch/cancel/error handling and revision refresh. It explicitly preserves the existing avatar until save succeeds and identifies previews as local-only. It makes no runtime completion claim. No additional MEDIUM+ findings.

No repository edits/commits, database writes or seed runs performed. Only this review artifact was written.
