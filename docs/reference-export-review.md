# Supplied export review — 31 October 2026

## Outcome and scope

The six supplied exports establish a concrete saved-data baseline. All four CSV files match output reproduced from the JSON backup using the previously inspected v20 application code, after normalizing BOM/newlines. The Excel report matches **12,151 compared parsed cell values**, with zero mismatches. This demonstrates internal consistency between these exports and the inspected export logic; it does not certify original workbook calculations, approved targets, financial policy or live database state.

No production data was imported, changed or deployed. Original Downloads files were read and SHA-256 checked before/after inspection. Exact inspection copies and detailed evidence are kept in ignored `references/private/exports-2026-10-31`. The JSON contains an access roster; raw records, account details and detailed financial output are not committed to Git. Embedded checklist/instruction text was treated as data, not authorization or execution instructions.

## Inventory

| Supplied file | Contents / finding | SHA-256 |
|---|---|---|
| Diversity-PMT-Indicators-2026-10.csv | 57 rows, 40 columns | f971dd502d2f3bfc1f5a6c8acaa5b0b8c4068b880c29085fea7092913402fd86 |
| Diversity-PMT-Indicators-2026-10 (1).csv | Byte-identical duplicate of the above | f971dd502d2f3bfc1f5a6c8acaa5b0b8c4068b880c29085fea7092913402fd86 |
| Diversity-PMT-Indicators-2026-10 (2).csv | Byte-identical duplicate of the above | f971dd502d2f3bfc1f5a6c8acaa5b0b8c4068b880c29085fea7092913402fd86 |
| Diversity-PMT-Approved-results-2026-10.csv | 22-column header, no data rows | ca6bf682a54bf3313caac872ded7037b56efb77fb4defd43ac0b0b4cf1e237f6 |
| Diversity-PMT-CBPF-YEM-25-S-NGO-37744-2026-10 (1).xlsx | Four protected, visible report sheets; no formulas or Excel error cells | ed943af511b4e4c529442305399c75bcb1fdd193e3a7df24f951718b8f036d7f |
| Diversity-PMT-backup (3).json | Three projects; exported 2026-10-30T22:35:01.629Z (31 October, 01:35 Yemen) | 3b9e95d4c9a53d57156870bdc1dfe396e17aa2cd03050358229cc6c156e8a39c |

The duplicate CSVs represent one snapshot, not separate months or projects. The header-only approved CSV is consistent with **no approved indicator review rounds** in the backup; it is not evidence of failed exporting.

## Current project census

| Project code | WBS rows | Indicators | Budget lines | Procurement items |
|---|---:|---:|---:|---:|
| CBPF-YEM-25-S-NGO-37744 | 215 | 57 | 39 | 33 |
| SETUP | 6 | 0 | 1 | 0 |
| 122 | 5 | 0 | 0 | 0 |

Preserve all three projects. The project whose ID is `starter` now has `starter:false` and a budget line: do not discard it based on its identifier or SETUP code. No duplicate task IDs, orphan parent references or dangling indicator-result links were found within these projects.

The main project's WBS contains 3 Outcomes, 5 Outputs, 35 Activities and 172 Sub-activities. Its indicators comprise FSAC 16, Health 16 and WASH 25. All 57 have result links in the current backup. The imported baseline recorded 43 tasks, 41 indicators and 32 procurement items; those historical import counts are not current totals. Earlier source documentation about 40 unlinked indicators must not be treated as the current state. Counts alone do not verify agreement with the approved proposal.

## Reconciliation details

| Excel sheet | Parsed rows including report headers | Compared cells | Mismatches |
|---|---:|---:|---:|
| Project summary | 27 | 65 | 0 |
| DIP | 221 (215 WBS rows) | 3,244 | 0 |
| Monthly update | 131 (125 eligible task rows) | 1,894 | 0 |
| Timeline | 221 (215 WBS rows) | 6,948 | 0 |

Compared exact strings/numbers after normalizing null/absent/empty cells to blank; no monetary rounding tolerance was applied. Source-saved timestamp, export timestamp, saved version and site URL (`Project summary!C10`, `C11`, `C12`, `C27`) were excluded from independent value verification. The workbook reports saved record version **160**, but the JSON backup does not include the workspace version, so identical version identity cannot be proven. Report generation used the backup export date for date-dependent states. Styles, print layout and workbook rendering were not part of this value reconciliation.

The report has no formulas, macros, external-link parts or defined names. It is a static protected snapshot, not an original calculation workbook. No formula recalculation was attempted.

## Data-quality findings and acceptance decisions

| ID | Verified finding / evidence | Required disposition before module acceptance |
|---|---|---|
| D-11 | All 57 October indicator entries are unreported and have no explicit monthly plan under the existing helper semantics. There are no confirmed October zeros | Preserve missing vs explicit-zero flags; MEAL must supply/confirm plans and reports. Do not infer zero achievement from an empty CSV cell |
| D-12 | The backup retains an import warning about a conflict between PMT summary budget and BVA line totals. Existing budget calculations reproduce the current saved line values | Finance must identify the approved total and document reconciliation. Do not change amounts or choose a budget based on the export alone; detailed values remain in private evidence |
| D-13 | 15 indicators retain unresolved source-review flags; 40 do not have an explicit current measurement type | Confirm units/denominators and measurement classification with MEAL. Preserved legacy data must not be silently normalized |
| D-14 | 16 procurement items explicitly lack known lead time; 16 lack required-delivery dates; 32 have no task link. No nonempty link points to a missing task | Confirm dates, lead-time basis and mappings. Missing is not zero days; do not invent historical dates or use name matching as an approved link |
| D-15 | Native planner baseline snapshot is absent, while all 215 tasks carry Jira baseline-lock metadata | Preserve both protections separately. “No baseline snapshot” in the report does not mean no approved/source date locks |
| D-16 | Legacy project IDs include non-UUID strings; SETUP/starter identity has live saved content; JSON has security roster and 100 retained history entries | Keep explicit source-ID mapping, preserve every project and historical record, and review account migration separately. No auto-seeding memberships from backup emails |
| D-17 | Source formula metadata is partial: 714 indicator entries (603 bare `=`), 488 budget entries (333 bare `=`), 221 procurement entries (52 bare `=`) | Bare `=` entries cannot reconstruct complete calculations. They may reflect shared-formula extraction; do not declare originals invalid or invent missing expressions. Obtain exact originals to resolve formula lineage |
| D-18 | A same-named procurement workbook in Downloads exists but its SHA-256 differs from the import record | Treat it as a separate candidate revision; do not substitute it as the original. Determine which version is authoritative |
| D-19 | Workbook version is 160; backup export has no workspace version field | Preserve export timestamps/hashes and record version as unknown for the JSON. Future backup format should carry explicit schema/source-version metadata after acceptance |

The import warnings also retain historical target/scale-up conflicts and original source-data limitations. Those are recorded claims, not newly verified discrepancies in the current 57-indicator definitions. They require the originals and owner decisions before closure.

## Source provenance recovered from the backup

The backup retains row-level source values and formula text for 41 indicators, all 39 main-project budget lines and 32 procurement items. It also contains source import metadata and supplementary checklist content. This is more provenance than the static Excel/CSV reports provide, but it does not reconstruct every original workbook.

| Original filename recorded by the application | Recorded original SHA-256 | Current availability |
|---|---|---|
| PMT_CBPF_37744_Updated(1).xlsm | c62351a0df94836df28f410d4d48aa5b91e034d8934467f1bdcf62c2fc56a69c | Not at that exact Downloads path |
| Budget Versus Actual - Updated(4).xlsx | 9cf697f0b39ffd6401ea589edd3510d69a0443729ebc2087984dfd96243d0b75 | Not at that exact Downloads path |
| Project indicators- CBPF-YEM-25-S-NGO-37744(2).xlsx | 2c5bec79b88956f157d4f1cd6f8cf29845b77583ae2be3776dde4fdbe6f2e500 | Not at that exact Downloads path |
| Final procurement plan and tracker - formula fixed.xlsx | 436b4b9ece8b1100a8f52f38012bec1e82e3abcff4fe75956667c6a69f401a48 | Same filename found, different content hash |

The procurement candidate hash is `61b9438768ceb447a4a14eb66dfe18ec931515e96513831e113de13a2aacdd76`. It contains `Final Plan` (225 formula cells) and `Procurement Checklists`; cached error cells were not found. Its formulas were not executed/recalculated, and the absence of cached errors is not formula correctness. The candidate was copied separately and its original hash remained unchanged.

## Acceptance impact and next work

E-08 (file inventory) and E-09 (export reconciliation) provide the saved-data baseline previously missing. Intake inspection is complete for these six exports. Actual application ingestion, schema migration and business-module implementation remain deferred. No foundation or module acceptance gate is automatically closed by consistent exports.

Prepare source-ID, permissions and provenance migration fixtures from a minimized/redacted copy, preserve working versus approved results, and retain the new discrepancy IDs in the acceptance matrix. The platform can continue foundation verification while exact originals and domain decisions are obtained; the user does not need to repeat these exports.

Reproduction: run `scripts/inspect-reference-exports.py` with the supplied bundled Python runtime, then `node scripts/reconcile-reference-exports.cjs` after preparing the existing v20 isolated reference compilation. Both scripts write only ignored inspection artifacts. The comparator exits nonzero on value mismatches or object mutation. The application typecheck passes after excluding private reference checkouts from its compilation scope.
