# Existing application review — saved version 20

Inspected 2026-10-29. Reference: [Program Management Site](https://programe-management-workspace.fmfyemen-tea-0291.chatgpt.site).

## Evidence and limits

Authenticated Sites metadata identifies project `appgprj_6ac959a8deb881919e3f2b25d933b0b5`, active with custom access. Retrieved source HEAD exactly matches latest saved version 20: `7475cbb2a6f1268cbfcc42893306a7db5352f9e8`. Source archive metadata: SHA-256 `2f8704d9c4e33119b9b242091b71fcbc3c124e50dcd227274ef0481b1f438a4b`, 78 files and 3,031,040 bytes. This is saved-version provenance, not independent confirmation of the currently deployed version.

The source copy is in ignored `references/private/site-source`. It was not modified, pushed or deployed. No live workspace records were fetched or changed. The public web reader could not access the restricted site. Source inspection found that workspace/planner GET handlers initialize a starter record when storage is empty, so a live UI visit cannot be assumed to be strictly non-mutating. Authenticated production UI behavior remains unverified.

No `.xlsx`, `.xls`, `.csv` or `.pdf` reference files were found in the retrieved checkout. Source documentation describes prior workbook/proposal reviews, but those descriptions are secondary evidence; they do not substitute for the original files.

## Architecture actually present

| Area | Source evidence | Observed implementation |
|---|---|---|
| Runtime | package.json; vite.config.ts; .openai/hosting.json | React 19.2.6, Next package 16.3.4, Vinext 1.0.0-beta.5, Cloudflare Worker, D1 binding DB; no R2 binding |
| Persistence | db/schema.ts:2; lib/workspace-store.ts:2 | One `workspaces` table; workspace JSON in `data`; integer version; timestamp. Store uses shared row ID `program` |
| Concurrency | lib/api-service.ts:20–30; lib/workspace-store.ts:2 | Expected workspace version checked, then SQL compare-and-swap; stale writes return 409 |
| Identity | lib/visitor.ts:8; lib/permissions.ts:9 | Trusts Sites-authenticated dispatch email and optional site-scoped user ID; admin bootstrap from PMT_OWNER_EMAILS |
| Authorization | lib/permissions.ts | Manager/staff/viewer; separate MEAL roles and scopes; account roster administrator-only |
| Read visibility | lib/permissions.ts visibleState; lib/api-service.ts payload | Non-admin response removes security roster but retains all workspace projects. Project assignments constrain edits, not general read visibility |
| Source links | lib/model.ts SourceRef/JiraRef/DipSync; import-service and dip-service | Original source references, Jira IDs/baseline metadata and review information are represented in records |
| Evidence/export | lib/project-export.ts; lib/export-service.ts; app/workspace.tsx | Evidence references/URLs, CSV/JSON and protected multi-sheet Excel snapshots. No attachment store established by this checkout |
| Audit/recovery | model.ts; planner-history.ts; planner-service.ts | Workspace history capped at 100 entries; separate planner recovery/change tracking and indicator approval histories |

The existing site is not a blank prototype. It has behavior and tests to preserve. The new repository remains a separate foundation candidate; it is not a replacement deployment.

## Existing module behavior

| Area | Confirmed from source / isolated tests | Not yet established |
|---|---|---|
| DIP/WBS | Outcome → Output → Activity → Sub-activity → Monthly cycle; stable IDs; default immediate-child averages; explicit weighted alternative; cancelled/unknown progress semantics; calculated parents; protected baseline vs revised dates; recurring months; monthly carry-forward; recovery; Jira refresh protections | Approved workbook parity and current live project contents |
| PITT / Indicators & MoVs | Outcome/output links; sum vs latest aggregation; explicit zero vs unreported; source-review flags; independent breakdown reconciliation; reference baseline separate from achievements; monthly plans/reports; scoped MEAL editing | Original indicator dictionary, authoritative target/unit conflicts and complete approved framework |
| Indicator approval | Draft → Submitted → Approved/Returned; reasons for return/reopen; locked submitted inputs; preserved approval snapshots; latest approved replacement per month; working vs approved exports | Whether organization policy permits reviewers approving their own submissions (current source permits in-scope managers) |
| Budget / Plans & forecasts | Budget lines, monthly actual/forecast, accrual, pending PO, two forecast modes, calculated remaining and variance | Finance-approved workbook reconciliation, currency precision, rounding and exchange-rate policy |
| Procurement | Linked task, required/actual dates, lead days, stage validation, delivery risk and activity-start timing | Authoritative business-day/calendar-day policy, fallback dates and approved process |
| Monitoring | Indicator/MoV and approval facilities exist | No dedicated visits/findings/follow-up module found in inspected navigation/domain schema |
| Portfolio | Multi-project selector exists | No dedicated cross-project portfolio dashboard found in inspected navigation/domain schema |

## Formula register: observed code, not newly approved requirements

Preserve these as regression candidates. Do not implement them in the new business modules until Finance/MEAL/Programme reconcile against authoritative evidence.

- **DIP:** `lib/model.ts:49–61`. Default progress is the mean of active immediate children; an unknown child propagates unknown. The weighted mode uses non-cancelled descendant leaves and stored weights. Parent actual end requires all active children completed with actual-end dates.
- **Budget:** `lib/model.ts:85`. Actual is summed over all stored months. Remaining is budget minus actual, accrual and pending PO. In normal mode total forecast combines actual before the selected month with forecasts from that month onward, plus accrual and pending PO. In `remaining` mode it combines all actual with all remaining forecasts, plus accrual and pending PO. Variance is budget minus total forecast. No exchange-rate or decimal rounding rule is inferred.
- **Procurement:** `lib/model.ts:86–91`. Latest request subtracts lead days from required delivery. Expected delivery adds lead days to actual request date **or order date as a fallback**. README describes PR-based lead time without explaining that fallback. Missing known lead time/date produces explicit review states. Linked-task start risk is separate from delivery deadline risk.
- **Working indicators:** `lib/indicator-domain.ts:185–193`. The helper exposes both all-saved-month achievement and cutoff achievement. UI progress uses cutoff achievement (`app/indicators.tsx:51–58`); CSV also uses cutoff values. Latest-value and legacy imported snapshot cases differ from additive counts. Preserve those distinctions rather than copying a similarly named helper output blindly.
- **Approved indicators:** `lib/indicator-domain.ts:175–179`. Uses latest approved round per month through cutoff. Counts sum approved months; rates use the latest approved month. Mixed measure/unit/aggregation combinations withhold a combined total. Reopened reports retain the prior approval until replaced.

## Discrepancies and decisions requiring acceptance

| ID | Finding | Impact / proposed disposition | Owner / gate |
|---|---|---|---|
| D-01 | Existing Sites/Cloudflare/D1/JSON versus requested Next.js/Supabase/PostgreSQL | Requires an explicit migration and identity plan, not redeployment of the old source into the new scaffold | Platform owner; F-08 and M-SOURCE |
| D-02 | Existing shared project reads versus foundation assignment-scoped reads | Intentional security design difference, not a proven defect in the legacy site's sharing contract. Confirm expected visibility before choosing the new policy | Programme/security; F-04 |
| D-03 | Legacy manager/staff/viewer plus independent MEAL manager/officer/assistant/focal/viewer versus provisional org/project roles | Current foundation cannot express owner-name task scopes, sector scopes, focal indicator assignments or MEAL overrides. No automatic one-to-one role mapping is safe | Access owner/MEAL; F-05, M-PITT |
| D-04 | Initial foundation project schema has code/name/status, while legacy projects also have dates/currency/source identities | Preserve as explicit migration fields before module intake; do not substitute defaults for missing original values | Programme/Finance; M-SOURCE |
| D-05 | Existing whole-workspace optimistic concurrency versus future normalized tables | Preserve stale-write rejection using agreed aggregate/row versions and transactional multi-entity operations | Platform; each mutation gate |
| D-06 | README says PR-based expected delivery; code falls back to order date | Confirm whether fallback is approved and add a golden fixture; do not silently alter either interpretation | Procurement; M-PROC |
| D-07 | Source documents report proposal/tracker coverage and target conflicts; originals absent | Retain unresolved discrepancy status. Do not copy described figures or add missing indicators automatically | MEAL/Programme; M-PITT |
| D-08 | Existing audit/history retention differs from new append-only audit table | Preserve historical entries/snapshots with source provenance; do not fabricate actor IDs or backfill missing history | Security/operations; M-SOURCE, F-06 |
| D-09 | Current approval workflow permits same-person review within management scope | Separation-of-duties policy is unresolved; no new prohibition or permission may be assumed | MEAL/governance; M-PITT |
| D-10 | Authenticated GET can initialize empty legacy storage | Avoid using a live navigation as proof of read-only inspection; new foundation intentionally has no implicit starter creation | Platform; F-02 |

None of these findings authorizes changing the legacy application or importing its live records.

## Executed reference checks

Ran the six existing synthetic domain/API suites: workflows, planner, permissions, export, indicators and indicator-review. **146 passed, 0 failed, 0 skipped.** No production API or D1 connection was used. Test names/fixtures are supplied by the source and prove those assertions only; they do not establish workbook correctness.

The legacy test script expects TypeScript 5's removed `moduleResolution=node` setting. The foundation uses TypeScript 7, so its compiler could not run that original build command. `node scripts/check-reference.cjs` instead transpiles unchanged source/tests with installed Next SWC into ignored `references/private/legacy-checks`, then runs Node's test runner. This is runtime regression evidence, **not a legacy typecheck, production build, DOM test or Worker/D1 integration test**. Results are retained in the ignored directory. Source Git status remained clean.

## Next evidence needed

Supply the authoritative DIP/WBS, PITT, BVA and procurement workbooks and any approved proposal/indicator dictionary used to reconcile them. A source ZIP is no longer needed for this saved version. Live-data migration, role-policy decisions and replacement deployment remain separate future acceptance steps.
