# Diversity PMT

Stage 1 foundation for a humanitarian NGO's multi-project management platform. Next.js App Router, TypeScript and Supabase PostgreSQL/Auth. **Not yet accepted for production.** Business modules and financial/indicator calculations are intentionally not implemented.

## Start development

Prerequisites: Node.js 22 or 24, npm, Git, Docker Desktop running Linux containers (for local Supabase).

```sh
npm ci
npm run db:start
npm run db:reset
```

Copy `.env.example` to `.env.local`. Set the URL and public publishable/legacy anon key printed by `npx supabase status`. Never put a service-role key into a `NEXT_PUBLIC_*` variable. Follow [the provisioning runbook](docs/operations.md) to create an organization, administrator and assigned users. No source workbooks or sample NGO data are seeded.

```sh
npm run dev
npm run typecheck
npm test
npm run build
npm run db:test
npx playwright install chromium
npm run test:e2e
```

Without Supabase configuration the application displays a setup page, not a simulated dashboard. `/api/health` is a liveness probe only. Database/auth readiness must be tested separately.

## Repository

```text
src/app/                    Routes, layouts and presentation
src/modules/auth/           Session validation and authentication actions
src/modules/projects/       Project input contract and mutations
src/modules/registry.ts     Deferred module catalogue (no business logic)
src/lib/supabase/            Server-only database client
supabase/migrations/        Versioned foundation DDL, grants, RLS and audit
supabase/tests/             Transactional PostgreSQL authorization tests
tests/                     Unit and browser acceptance tests
docs/                      Evidence, requirements, design and release gates
.github/workflows/         CI and gated manual deployment
references/private/        Ignored location for locally supplied originals
```

## Review documents

- [Evidence and current behavior](docs/discovery.md)
- [Existing site source review and discrepancies](docs/existing-site-review.md)
- [Requirements traceability matrix](docs/requirements.md)
- [Database schema](docs/database.md)
- [Access-control matrix](docs/access-control.md)
- [Technical architecture](docs/architecture.md)
- [Test strategy and acceptance gates](docs/testing.md)
- [Staged implementation plan](docs/implementation-plan.md)
- [Operations and deployment](docs/operations.md)
- [Verification record](docs/verification.md)

Reference files must be supplied and reconciled before module implementation. No deploy credentials, Git remote or production tenant are presumed.
