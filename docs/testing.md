# Test strategy and acceptance gates

Every release is a candidate until required automated tests pass and the named owner signs off. A skipped test is not evidence of passing. Stage 1 has not been accepted. See verification.md for actual executions.

Reference baseline E-07: six existing v20 domain/API suites passed 146 synthetic tests using SWC transpilation and Node's test runner (`node scripts/check-reference.cjs`, source checkout required). These establish existing code assertions for future differential tests. They do not count as new-module completion, workbook reconciliation, legacy typechecking or live integration. Preserve D-02/D-03 role-policy differences and D-06 procurement fallback as explicit acceptance cases.

Supplied snapshot baseline E-08/E-09: duplicate hashes checked, four CSV outputs reproduced, 12,151 workbook cell values matched exactly (blank normalization only; four metadata cells excluded). No originals were modified. Keep source data and security roster in ignored private evidence; do not run this dataset in public CI. Future redacted fixtures must cover 57 missing October plans/results vs zero, absent approvals, missing measurement types, native-baseline/Jira-lock distinction, non-UUID IDs, same-name/different-hash files and preserving extra projects. Reported consistency does not approve source formulas or replace M-SOURCE/M-DIP/M-PITT/M-BVA/M-PROC sign-off.

| Test ID | Acceptance criterion | Automation / verification |
|---|---|---|
| F-01 | Clean install, strict typecheck, tests and production build; liveness has no data | npm ci, typecheck, test, build; foundation.spec.ts |
| F-02 | Missing configuration exposes no simulated projects or bypass | unconfigured browser suite |
| F-03 | Valid login; invalid credentials; protected routes; sign-out; no session | authenticated.spec.ts and foundation.spec.ts |
| F-03b | Expired access token refresh, revoked/disabled account, concurrent logout, no shared response cache | Required staging manual/session tests; not yet automated |
| F-04 | Anonymous denied; tenant/project isolation; foreign org insert and project move denied; immediate assignment revocation | foundation.test.sql |
| F-05 | Viewer/auditor cannot write; member cannot self-promote | foundation.test.sql; viewer browser controls |
| F-06 | Project mutation creates attributed audit event; viewer cannot read audit; clients cannot forge/delete | foundation.test.sql |
| F-07 | Admin creates valid project; duplicate/invalid codes rejected; unknown payload fields stripped | projects.test.ts, foundation.test.sql, authenticated.spec.ts |
| F-08 | Protected staging release, migration success, real login/create/read/signout, backup restore evidence, rollback rehearsal | GitHub CI + deploy + staging checklist; credentials required |
| F-09 | Keyboard navigation, visible focus, labels, readable errors, mobile 375px and desktop 1440px | Manual/browser review; not yet signed off |

Unit tests validate meaningful input boundaries. SQL tests exercise actual PostgreSQL grants/RLS under anon/authenticated roles, including malicious direct API-equivalent requests. Browser integration tests provision only a disposable loopback Supabase instance using a test-only service key; they never provision hosted production accounts. Test fixtures are synthetic, identifiable and isolated. Do not publish authenticated traces/screenshots containing credentials or session data.

Additional pre-production security coverage: stale session tests F-03b, cross-tenant update/delete/read combinations for every new table, composite FK rejection, role changes with already-open sessions, migration replays, rate-limit settings, dependency vulnerability scan and hosting cache behavior. Audit administrative changes and review trusted operator access. Blocking high/critical findings require remediation or explicit owner-approved exception with expiry.

Future module gates:

| Gate | Required acceptance fixtures |
|---|---|
| M-SOURCE | Original hashes unchanged; immutable revisions; duplicate imports; failed imports leave no partial committed data; provenance; approved mappings |
| M-DIP | Hierarchy/dependency cycles, date boundaries, approved progress rules, baseline/version comparison |
| M-PITT | Approved indicator golden values, denominator/zero/blank cases, disaggregation, duplicate prevention, reporting periods |
| M-BVA | Finance-approved reconciliation by line/project/period/currency, approved rounding, negative/correction and missing-rate cases |
| M-PROC | Allowed/denied transitions, procurement-to-budget/WBS mapping, approved dates and lead times |
| M-MON | Evidence access, finding ownership, follow-up state, verification and closure |
| M-PORT | Source total reconciliation, currency/unit compatibility, permissions before aggregation, approved as-of date |

Gate record template: requirement IDs; source revisions/hashes; test run links and exact commit; passed/failed/skipped; remaining deviations; owner name; decision; date. Module status remains deferred/in-progress until all required tests pass and owner accepts. Workbooks, visible screenshots and source implementation disagreements require an explicit recorded decision, never silent formula replacement.
