# Discovery and evidence register

Date: 2026-10-29. Scope: supplied workspace and conversation. No claim is made about files elsewhere on the user's device or cloud storage.

Updated 2026-10-31: six user-supplied exports have been inspected and reconciled. See [reference-export-review.md](reference-export-review.md) for current data, file hashes and D-11 through D-19. Original calculation workbooks are still not verified; a same-named procurement candidate has a different hash.

| Evidence ID | Evidence | Finding |
|---|---|---|
| E-01 | User platform specification | Confirmed stack, six eventual modules, multi-project access, immutable original source data, no invented formulas, acceptance gates, foundation-only first stage |
| E-02 | Configured workspace inspection | Folder was absent; created after Windows permission approval. No existing application, Git history or workbooks existed in that folder |
| E-03 | Conversation attachments | No workbook, application URL, repository or archive supplied at initial inspection |
| E-04 | Runtime inspection | Node 24.16.0, npm 11.13.0 and Git available; Docker and psql were not on PATH |
| E-05 | User-supplied existing site URL and authenticated Sites metadata | Program Management Site; active; custom access; latest saved version 20; source commit 7475cbb2a6f1268cbfcc42893306a7db5352f9e8 |
| E-06 | Retrieved source at the E-05 commit | Inspected architecture, permissions, modules, formula functions and source tests; checkout unchanged |
| E-07 | Six isolated reference domain/API suites | 146 passed, 0 failed, 0 skipped using SWC-transpiled source; no legacy typecheck/live integration claim |
| E-08 | Six supplied export files, 2026-10-31 | Exact private copies; originals unchanged by SHA-256; three working CSVs are duplicates; main project has 215 tasks/57 indicators/39 budget lines/33 procurement items |
| E-09 | CSV/Excel versus JSON reconciliation | Four CSV outputs match; 12,151 Excel cells match inspected export logic; four metadata cells excluded; no workbook-formula certification |
| E-10 | Same-named procurement workbook found in Downloads | Different hash from recorded import; retained as candidate revision, not substituted as authoritative original |

## Current behavior and discrepancies

Existing site supplied: [Program Management Site](https://programe-management-workspace.fmfyemen-tea-0291.chatgpt.site). Source inspection and isolated regression checks succeeded; see [the existing-site review](existing-site-review.md). Authenticated production UI behavior and original workbook parity remain unverified. The ordinary web reader cannot access the custom-access site.

The latest saved version's archive provenance is SHA-256 `2f8704d9c4e33119b9b242091b71fcbc3c124e50dcd227274ef0481b1f438a4b`, 78 files, 3,031,040 bytes. Saved-version metadata alone does not establish which version is currently deployed. Source was retrieved into ignored `references/private/site-source` at the recorded commit; no live mutation or deployment was performed.

| Area | Confirmed current behavior | Discrepancy / risk | Required evidence |
|---|---|---|---|
| DIP/WBS | Five-level hierarchy, rollups, baseline/revisions, recurring months and recovery in source/tests | Workbook parity unverified | Authoritative workbook |
| PITT | Linked indicators, monthly reporting, breakdowns, scoped MEAL roles and approval snapshots | Source targets/units and proposal coverage unresolved | Indicator dictionary, originals and approved examples |
| BVA | Actual/forecast/accrual/pending-PO arithmetic in source/tests | Currency precision and Finance-approved reconciliation unverified | Approved budget/actuals workbook and reconciled report |
| Procurement | Lead-time/date calculations and linked-task risk in source/tests | Order-date fallback differs from README's PR-only description | Procurement workbook and SOP |
| Monitoring | Indicator/MoV features; no dedicated visit/finding module found | Requested broader monitoring scope not established | Monitoring templates and approved workflow |
| Portfolio | Project selection; no dedicated cross-project dashboard found | Cross-project aggregation and comparability not established | Approved portfolio reports and inclusion rules |
| Authentication | Sites dispatch identity and application roles in source | Read scopes and independent MEAL roles differ from new provisional model | Accepted access mapping and lifecycle policy |

Export-to-backup consistency has now been verified for the supplied snapshots (E-09). Original-workbook-to-app discrepancies remain open; consistent exports do not validate the original formulas or approved figures.

## Inspection protocol when files arrive

1. Inventory filenames, revision, owner, authoritative status, size and SHA-256. Store originals read-only outside Git and production tables. Work only on copies.
2. Read workbook sheets including hidden sheets, tables, named ranges, formulas, cached results, validation lists, protection, dates/locale and external references. Never recalculate and overwrite an original. Flag missing cached values and external dependencies.
3. Trace representative values from input cells through formulas to reports, including zero, blank, negative and boundary-period cases. Record exact cells, formula text, units, dates and expected values.
4. Inspect source dependencies, entrypoints, persistence, authentication, authorization, import/export paths and tests. Inspect the existing site using non-mutating actions. Do not test writes against live data.
5. Record each discrepancy as D-ID, source locations, expected/observed result, severity, affected requirement, proposed disposition, decision owner and approval date. Resolve ambiguity with Finance/MEAL/Programme owners rather than choosing a formula.
6. Hash originals again after inspection. Save redacted fixtures only with authorization; keep real beneficiary, donor and financial records out of test logs and Git.

Open decisions: source of truth per module; organization/project membership scope; financial and indicator semantics; languages/RTL; hosting region; retention; RPO/RTO; SSO/MFA policy; attachment sensitivity. These do not block writing a provisional foundation, but block production acceptance where applicable.
