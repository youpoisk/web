# Guest browsing and demo profile review

Implementation: 32abdc8; corrections: 3e3ddad, 102d477, e6a40db.
Independent reviewer: /root/review_yp040. Final result: PASS.

Findings fixed:
- Published posts now store explicit visibility. Guest feed accepts only visibility=Все; legacy posts without visibility fail closed.
- Every hash navigation clears review editor, draft and composer.
- Explicit destination tab is preserved for notification → friend requests.

Validation: pnpm build PASS after each correction. Actual browser: guest catalog → profile gate → login → explicit demo profile → logout → guest catalog PASS. Reviewer follow-up was source review, not a separate browser run.

Scope: this is an honestly labelled local prototype preview, not server authentication. Native auth broker/session coordinator and real logout/session revocation remain open WEB-004/005. No credentials are accepted as authenticated by this UI.

Footer corrections 883eedf/e711f5b were independently reviewed PASS: youpoisk & x262e; ampersand #000; company Rose Quartz #f7cac9; existing brand elsewhere unchanged.