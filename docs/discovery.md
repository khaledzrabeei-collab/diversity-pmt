# Discovery and evidence register

Date: 2026-10-29. Scope: supplied workspace and conversation. No claim is made about files elsewhere on the user's device or cloud storage.

| Evidence ID | Evidence | Finding |
|---|---|---|
| E-01 | User platform specification | Confirmed stack, six eventual modules, multi-project access, immutable original source data, no invented formulas, acceptance gates, foundation-only first stage |
| E-02 | Configured workspace inspection | Folder was absent; created after Windows permission approval. No existing application, Git history or workbooks existed in that folder |
| E-03 | Conversation attachments | No workbook, application URL, repository or archive supplied at initial inspection |
| E-04 | Runtime inspection | Node 24.16.0, npm 11.13.0 and Git available; Docker and psql were not on PATH |

## Current behavior and discrepancies

Existing application behavior is **unverified**, not absent. The existing site link has been requested along with workbook files and source access. The site can establish visible behavior; it cannot alone establish hidden formulas, server permissions, historical changes or data integrity.

| Area | Confirmed current behavior | Discrepancy / risk | Required evidence |
|---|---|---|---|
| DIP/WBS | Unknown | Dates, hierarchy, progress rollups and dependencies may differ across workbooks | Authoritative workbook and source implementation |
| PITT | Unknown | Aggregation, disaggregation, denominators and reporting period rules not established | Indicator dictionary, formulas and approved examples |
| BVA | Unknown | Currency, exchange rates, sign conventions, commitments, periods and rounding not established | Approved budget/actuals workbook and reconciled report |
| Procurement | Unknown | Status lifecycle, lead time and links to budget/activity not established | Procurement workbook, SOP and application behavior |
| Monitoring | Unknown | Findings, evidence, verification and closure workflow not established | Monitoring templates and approved workflow |
| Portfolio | Unknown | Cross-project aggregation and comparability not established | Approved portfolio reports and inclusion rules |
| Authentication | Unknown | Existing identities and permissions cannot yet be mapped | Existing role list and account lifecycle policy |

No workbook-to-app discrepancy can responsibly be declared resolved yet.

## Inspection protocol when files arrive

1. Inventory filenames, revision, owner, authoritative status, size and SHA-256. Store originals read-only outside Git and production tables. Work only on copies.
2. Read workbook sheets including hidden sheets, tables, named ranges, formulas, cached results, validation lists, protection, dates/locale and external references. Never recalculate and overwrite an original. Flag missing cached values and external dependencies.
3. Trace representative values from input cells through formulas to reports, including zero, blank, negative and boundary-period cases. Record exact cells, formula text, units, dates and expected values.
4. Inspect source dependencies, entrypoints, persistence, authentication, authorization, import/export paths and tests. Inspect the existing site using non-mutating actions. Do not test writes against live data.
5. Record each discrepancy as D-ID, source locations, expected/observed result, severity, affected requirement, proposed disposition, decision owner and approval date. Resolve ambiguity with Finance/MEAL/Programme owners rather than choosing a formula.
6. Hash originals again after inspection. Save redacted fixtures only with authorization; keep real beneficiary, donor and financial records out of test logs and Git.

Open decisions: source of truth per module; organization/project membership scope; financial and indicator semantics; languages/RTL; hosting region; retention; RPO/RTO; SSO/MFA policy; attachment sensitivity. These do not block writing a provisional foundation, but block production acceptance where applicable.
