# Verification record

Stage 1 status: implementation candidate; **not accepted and not deployed**.

## GitHub CI verified on 2026-10-31 (Asia/Aden)

Repository: https://github.com/khaledzrabeei-collab/diversity-pmt (observed public; owner informed). Main is connected and pushed. [Passing run 41143895379](https://github.com/khaledzrabeei-collab/diversity-pmt/actions/runs/41143895379) tested commit `aa1a3c1f068a239939043d0340ce647a822c55f4`.

- Application job passed: clean dependency install, strict TypeScript, 18 unit tests, production build, production dependency audit and unconfigured browser suite.
- Database/auth job passed on disposable Supabase: startup, migration reset, all 18 pgTAP authorization assertions, and 6 configured browser tests. One unconfigured-only test intentionally skipped in this job; covered by the application job. No required configured authentication tests skipped.
- Verified configured cases: health; unauthenticated redirect; administrator login/create/logout/access loss; assigned viewer access/no create controls; generic invalid-credential error; public registration rejected with `signup_disabled`.
- First runs exposed an ambiguous alert selector and `email_provider_disabled`. The selector now distinguishes the app error from Next.js's route announcer. Local email provider enabled while global public signup remains disabled, with an explicit regression test. Direct fixture authentication reports only status/code on failure.
- Raw reference exports and credentials were excluded from the push. No existing live-site changes, source-data imports or deployments were performed.

Still open: hosted environment and branch protections; staging secrets/projects; session-expiry/revocation/cache tests F-03b; staging/restore/rollback evidence F-08; accessibility/mobile review F-09; owner approval of role mapping and source discrepancies. Automated CI success does not close these gates or authorize production deployment. The earlier local limitations below are historical; GitHub CI now supplies database/auth execution evidence.

## Earlier local execution history

2026-10-31 follow-up: hardened the authentication CI configuration to fail instead of silently skipping when required credentials/local target are missing; disabled traces for authenticated runs. Strict TypeScript passed and 18 unit tests passed (8 project validation, 10 test-environment guard). Vite required approved execution outside the sandbox because subprocess creation was blocked. Database/authentication integration was not run. User confirmed no GitHub repository exists; Docker is unavailable and no remote is configured. Earlier build/browser results below precede this test-configuration change.

Local execution on 2026-10-29 (Windows, Node 24.16.0):

| Check | Result |
|---|---|
| Dependency installation | Completed; npm reported 0 vulnerabilities. Direct versions pinned and package-lock committed for repeatable installs |
| Strict TypeScript check | Passed |
| Vitest unit suite | 8 passed |
| Next.js production build | Passed: Next.js 16.4.3; all routes compiled and prerendered where applicable |
| Playwright with installed Chrome | 2 passed: liveness and unconfigured fail-closed navigation |
| Authentication browser checks | 4 skipped: no local Supabase environment. Not accepted |
| PostgreSQL/pgTAP authorization suite | 18 assertions authored, not executed. Docker absent; local Supabase CLI optional Windows binary also failed to install |
| Git whitespace check | Passed for staged implementation |
| CI and deployment workflows | Authored, not run on a Git host; no remote or environment credentials supplied |
| Existing reference source | Saved v20 source retrieved at 7475cbb2a6f1268cbfcc42893306a7db5352f9e8; inspected; source checkout unchanged |
| Existing domain/API regressions | 146 passed, 0 failed, 0 skipped through SWC transpilation; not a legacy typecheck/build or live D1 test |
| Supplied exports (2026-10-31) | Six files inventoried and hashed; all originals unchanged; four CSV outputs and 12,151 workbook values reconcile with JSON using inspected export code |
| Original workbook parity / live UI | Not verified: static report contains no formulas; backup has partial source metadata; same-named procurement candidate differs from recorded original hash; live UI unverified |
| Foundation typecheck after reference intake | Passed; private reference checkouts excluded from compilation scope |

Sandbox blocked Vite, Next.js TypeScript and Playwright subprocesses with EPERM; the affected checks passed after approved execution outside the sandbox. Dependency download required network approval and retries. The failed optional Supabase CLI package is an additional local tooling limitation; Docker is still required before integration testing even after reinstalling that binary.

Dependency versions: Next.js 16.4.3, React 19.3.1, Supabase SSR 0.12.7, Supabase JS 2.118.0. Exact remaining versions and integrity hashes are in package-lock.json. No hosted infrastructure has been supplied. Git remote/CI are now connected as recorded above. No business module is implemented or accepted.

Release gate remains closed until required tests, environment setup and owner acceptance are complete. Do not treat tests authored, YAML written or a successful static build as proof of integration or production readiness.
