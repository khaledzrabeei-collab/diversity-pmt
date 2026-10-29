# Staged implementation plan

Only stage 1 is authorized for implementation in this delivery. Later stages are a proposal, not begun work.

Discovery update: the existing site's v20 source is available and inspected, with 146 passing isolated regression checks. Workbooks remain missing. Before completing stage 1 acceptance, resolve D-01/D-02/D-03 migration and access choices; before business migration, preserve the legacy behavior catalogue and original source data. No source ZIP is currently needed for v20.

| Stage | Scope | Entry / exit gate |
|---|---|---|
| 0 — Evidence baseline | Inventory originals and source, inspect formulas/behavior, establish discrepancies and authoritative versions | Evidence supplied; domain owners approve baseline |
| 1 — Foundation | Git, TypeScript/Next.js, local environment, authentication, tenant/project RBAC, audit, project registry, migrations, CI/release scaffold | F-01 through F-09; access model and deployment decisions accepted. Code can proceed while evidence is missing, but is not production acceptance |
| 2 — Source intake | Immutable originals, provenance, mapping versions, staging/reconciliation UI, idempotent imports | M-SOURCE; information governance approved |
| 3 — DIP/WBS | Plan versions, hierarchy, assignments, dependencies, approved schedule/progress behavior | M-DIP; Programme accepts workbook parity |
| 4 — PITT | Approved indicators, targets, observations, disaggregation and reporting | M-PITT; MEAL accepts golden fixtures |
| 5 — BVA | Versioned budgets, actuals, mappings and approved reconciliation | M-BVA; Finance signs reconciliation |
| 6 — Procurement | Approved workflow and activity/budget links | M-PROC; Procurement signs off |
| 7 — Monitoring | Visits, findings, evidence and follow-up | M-MON; MEAL/Programme signs off |
| 8 — Portfolio | Authorized cross-project views over accepted module data | M-PORT; Finance/MEAL/leadership approve metrics |
| 9 — Production rollout | Access review, migration rehearsal, restore drill, pilot, training, operational ownership | Security/operations and business owners accept; staged rollout monitored |

Dependencies may change after reference inspection. No delivery dates are invented before discovery and staffing estimates. Scope changes require a traceability update and renewed affected acceptance tests. Backward compatibility must be demonstrated with previously approved fixtures.

Immediate inputs needed: authoritative workbooks and named acceptance owners. The existing site URL and saved-version source have now been obtained. Deployment inputs can follow: Git hosting destination, staging/production Supabase and Vercel projects (or approved alternative), hosting region and operational policy. Secrets belong in provider secret stores, not chat or Git.
