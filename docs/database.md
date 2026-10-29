# Proposed database schema

## Stage 1 implemented

| Table | Key / relationships | Purpose and invariants |
|---|---|---|
| auth.users | Supabase managed UUID | Authentication identity; no passwords in public tables |
| organizations | UUID PK | Tenant; nonblank name |
| organization_memberships | PK organization_id + user_id; FKs org/auth | One org role per user per tenant |
| projects | UUID PK; org FK; unique org+code; unique org+id | Project identity and draft/active/archived status; no budgets or performance values |
| project_memberships | PK project_id+user_id; composite FKs org+project and org+user | Assignments cannot bridge tenants |
| audit_events | bigint identity PK, org FK | Trigger-generated mutation snapshots, actor and timestamp; no client writes |

UUIDs avoid meaningful sequential project identifiers. Timestamps use timestamptz. Project codes are uppercase technical identifiers scoped to an organization (assumption). Financial precision is not selected in stage 1. Deletion is restricted; archive is an available status, not a claim of immutable business closure. Audit retains project metadata/membership snapshots; minimize PII in names. Owner-level PostgreSQL access can alter audit rows, so external immutable retention is a production hardening decision.

## Deferred conceptual model — not migrations

Source review adds mandatory migration requirements: the legacy D1 `workspaces` table contains one versioned JSON document (row `program`). Preserve a read-only original snapshot and its source version/hash before normalization. Add a source-ID mapping rather than coercing legacy task/indicator IDs into UUIDs. Preserve unknown source fields, Jira identities, baseline/current dates, currency, monthly explicit-zero flags, approval snapshots, recovery history and provenance. Proposed scoped assignment entities must support project + owner, MEAL sector and focal-indicator permissions, subject to D-02/D-03 acceptance. New normalized updates must retain stale-write rejection and atomic multi-entity changes. No migration of live records has been performed.

Every project-owned table will include organization_id and project_id with a composite project FK, RLS and audited versioning. Each business row will have provenance to an import/manual revision; exact columns wait for source inspection.

| Domain | Proposed entities | Decisions required before DDL |
|---|---|---|
| Source preservation | source_assets, source_versions, import_batches, staging_rows, reconciliation_issues | Private object storage, original SHA-256, workbook/sheet/cell references, retention, encryption, permitted MIME/size, malware scanning |
| DIP/WBS | plan_versions, activities, activity_dependencies, assignments, reporting_periods | Hierarchy and cycle constraints; date semantics; progress calculations; approved baseline/actual separation |
| PITT | indicator_definitions, indicator_versions, disaggregation_dimensions, targets, observations, evidence_links | Units, aggregation type, denominator, zero/blank semantics, deduplication, frequency and approvals |
| BVA | budget_versions, budget_lines, actual_transactions, mapping_versions, exchange_rate_versions | Currency/precision, source transaction identity, fiscal periods, actual/commitment treatment, conversion and rounding |
| Procurement | procurement_plan_versions, procurement_items, procurement_events, supplier_refs | Status transitions, approved linkage to WBS/budget, lead time definitions and vendor data sensitivity |
| Monitoring | monitoring_visits, findings, follow_up_actions, evidence_refs | Location sensitivity, ownership, verification and closure workflow |
| Portfolio | approved reporting views/materializations | Compatible units/currencies, as-of/version rules, permitted aggregation and visibility |

Immutable originals are separate from mutable working records. Imports will write staging records first, validate against approved mappings, and commit a new version only after review. Reimport is keyed by source hash and mapping version; corrections append superseding revisions. Reject unknown formulas instead of guessing. Workbook formulas are evidence, never executable server code. Exports will guard against spreadsheet formula injection.

Migration policy: additive expand/contract changes, reviewed DDL, isolated local reset, staging migration and regression tests, backup before production changes, measured lock time and restore rehearsal. Never run db reset against a hosted production database. Rollbacks favor a forward corrective migration; no destructive automatic down migration is provided.
