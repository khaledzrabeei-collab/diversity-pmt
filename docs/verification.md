# Verification record

Stage 1 status: implementation candidate; **not accepted and not deployed**.

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

Dependency versions: Next.js 16.4.3, React 19.3.1, Supabase SSR 0.12.7, Supabase JS 2.118.0. Exact remaining versions and integrity hashes are in package-lock.json. No hosted infrastructure or Git remote has been supplied. No business module is implemented or accepted.

Release gate remains closed until required tests, environment setup and owner acceptance are complete. Do not treat tests authored, YAML written or a successful static build as proof of integration or production readiness.
