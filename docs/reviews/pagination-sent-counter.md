# Pagination and sent-request counter reviews
Independent source reviews after commits adb8da8 and2ab39e5 found no MEDIUM+ findings. Reviewer inspected current files via read-only filesystem access; did not independently verify Git snapshots or execute tests.

Pagination: API page limits12, automatic load with retry button, stale/parallel request guards. LOW follow-ups: reset remembered cursor on identical list refresh; React adapter lifecycle tests. Browser scroll verification not completed.

Sent counter: outgoing_friend_requests is exact across all pages; zero visible in Sent/Requests tabs, zero hidden in sidebar. Send/cancel dispatch refresh; external changes refresh on visibility and30-second polling. Unknown/error counts hidden, not rendered as zero. Sidebar Friends remains incoming only.

Validation:105 CSP/API tests PASS, core lines/functions100%; production build PASS. Backend contract pinned11ed312. Existing large-bundle warning remains.
