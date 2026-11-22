# Independent follow-up — frontend 5cf4d26 + 9258249

Verdict: PASS. No actionable MEDIUM/HIGH. The original self-account-ui-review.md accepts 5cf4d26 under its earlier gray-zero requirement; this follow-up records the subsequent explicit product change rather than treating it as an original defect.

NavigationCount now suppresses undefined/loading/error values and zero by default, while preserving positive counts and accessible labels. Only the incoming Requests tab opts into showZero, matching the latest clarification; sidebar Messages/Friends keep the default. Guest Watchlist additionally checks for at least one valid catalog item before rendering its count, preventing a visible zero when local IDs are empty or no longer known. The changes leave exact server counts, common hook snapshot, account isolation, event queue and name-save behaviour unchanged. No API, authorization or database mutation added.

Independent typecheck:api PASS after9258249. The prior independent contract/source check,103CSP API tests/core100 and9extension tests PASS for5cf4d26 remain applicable; this follow-up is a render-condition-only delta. Author reports build PASS and guest-browser Watchlist0 absent. Authenticated latest Requests-tab zero was inspected statically, not browser-certified after the policy clarification. The reviewer did not log in to shared QA or displace the user's active web session; that limitation is explicit rather than substituted by an older CUA result.

The original report's LOW follow-ups on component/hook tests and count-error retry indication remain non-blocking. Only review artifacts were written; no repository edit/commit or working database write performed.
