# Requirements traceability matrix

Status meanings: C = confirmed by user E-01; A = design assumption requiring acceptance; U = unknown pending evidence. Implemented does not mean accepted. Test IDs resolve in `docs/testing.md` or named suites.

| ID | Requirement | Basis | Implementation / planned artifact | Acceptance evidence | Stage / status |
|---|---|---|---|---|---|
| R-01 | Next.js, TypeScript, PostgreSQL/Supabase | C | package.json, src/app, migrations | F-01 build, typecheck, DB reset | 1 / implemented, verification pending |
| R-02 | Multiple projects with scoped access | C | organizations/projects/memberships and RLS | F-04 cross-tenant/project negative cases | 1 / implemented |
| R-03 | Role-based access | C; exact roles A | grants, RLS, access-control.md | F-05 escalation and writes denied | 1 / implemented; roles provisional |
| R-04 | Modular architecture | C | src/modules and architecture.md | Review dependency boundaries | 1 / implemented |
| R-05 | Inspect references and existing app first | C | discovery.md | E-02/E-03; file/cell/source trace on receipt | Discovery blocked by missing evidence |
| R-06 | Preserve agreed behavior and formulas | C; semantics U | discrepancy register and golden fixtures | Domain-owner signed reconciliation | Every module / pending |
| R-07 | Never overwrite source data | C | No importer in foundation; proposed immutable source/revision storage | Original hashes unchanged, import idempotency/reversal | 2 onward / deferred |
| R-08 | DIP/WBS | C; rules U | proposed activities, dependencies and plan versions | M-DIP approved hierarchy/date/progress cases | 3 / deferred |
| R-09 | PITT | C; rules U | indicator definitions, targets and observations | M-PITT approved calculations and disaggregations | 4 / deferred |
| R-10 | BVA | C; rules U | budgets, actuals and approved mappings | M-BVA Finance reconciled totals and edge cases | 5 / deferred |
| R-11 | Procurement | C; workflow U | procurement plans and state events | M-PROC approved transitions and reconciliation | 6 / deferred |
| R-12 | Monitoring | C; workflow U | visits, findings and follow-ups | M-MON permissions/evidence/closure cases | 7 / deferred |
| R-13 | Portfolio dashboards | C; metrics U | permission-filtered approved reporting views | M-PORT unauthorized rows excluded and totals reconciled | 8 / deferred |
| R-14 | Git and repeatable development environment | C | .gitignore, lockfile, README, Supabase config | F-01 clean checkout setup | 1 / prepared |
| R-15 | Authentication | C; password login A | Supabase Auth, proxy, server actions | F-03 sign-in/out, expired/revoked account, no session | 1 / implemented |
| R-16 | Deployment pipeline | C; Vercel/GitHub A | CI and manual release workflow | F-08 protected staging deployment and smoke tests | 1 / configured, not connected |
| R-17 | Acceptance before module completion | C | testing.md, implementation-plan.md | Signed gate record; no skipped mandatory tests | All stages / mandatory |
| R-18 | Auditability | A | DB-triggered audit events | F-06 attribution and tamper denial | 1 / implemented |
| R-19 | Admin creates project identity | A | createProject action, validation, RLS | F-07 duplicate/invalid/cross-tenant inputs | 1 / implemented |
| R-20 | No public registration | A | Supabase local config, no signup route | Deployment Auth settings verified | 1 / production setting pending |
| R-21 | Secure failure before configuration | A | setup route; no mock tenant/session | F-02 | 1 / implemented |

Acceptance owners proposed: platform/security owner for F tests; Programme for DIP; MEAL for PITT/monitoring; Finance for BVA; Procurement for procurement; leadership plus domain owners for portfolio. Actual names and sign-off authority remain to be supplied.
