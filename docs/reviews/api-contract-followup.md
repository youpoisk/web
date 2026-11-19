# Frontend contract follow-up — f663cf4

Gate: PASS. Both original P2 findings are resolved; no additional findings in this delta.

Import now reads the exact recorded commit's api/openapi.json with git show and compares normalized working bytes before writing anything. A missing/untracked contract cannot claim provenance from an unrelated commit. The recursive validator runs before importer writes and before generator resolution in every mode; it rejects external $ref/$dynamicRef and $id rebasing. Safe internal references remain accepted.

Independently repeated the original staging-only reproductions with a copied fixed script: untracked contract import exits1; a committed contract with the previously successful external relative sentinel schema exits1; generate against the external-ref mirror exits1. Staging mirror, manifest and types hashes remained unchanged during rejection. Real frontend read-only api:check and api:check-source both pass after the fix.

The original report remains at review.md with both independently reproduced defects. No source edits/commits or real environment/secret reads occurred. Full build is author-verified rather than independently repeated; existing extension9/9 checks had passed in the original review. This closes the contract prerequisite gate, not runtime frontend/auth integration.