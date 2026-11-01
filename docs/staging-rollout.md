# Staging rollout record

Environment: candidate foundation only; not production acceptance.

- Supabase project `hyirrltuwyniunenzqvc` verified as `diversity-pmt-staging`, active in eu-west-1.
- Vercel project `prj_6WgSwDwrfDHTk6hVVLX5GnqxJr8t`, team `team_x8PHFiO9KH5Zs0HxaP3Vhscj`, slug `diversity-pmt-staging`.
- Both public Supabase environment variables saved in the dedicated Vercel staging project's Production environment. No service key is supplied to application runtime.
- Read-only schema inspection returned no public/private/migration tables before applying the foundation. Auth account count was zero.
- Dry run listed only `202610290001_foundation.sql`; applied successfully. All five public tables verified with RLS enabled. No source data or sample projects imported.
- Hosted public signup disabled through a reviewed partial configuration diff; email provider stays enabled. Undeclared settings left unchanged.
- Vercel configured for Next.js, Node 24.x and `npm ci`. Upload exclusions explicitly protect private exports, credentials, tests and local generated output.
- Initial staging deployment will be a manually initiated CLI validation deployment after required CI passes. This is a documented staging setup path; the GitHub production release gate remains mandatory. No automatic Git deployments are connected. GitHub deployment secrets/reviewers and backup/rollback rehearsal remain outstanding.
- Invitation/password setup added to support administrator onboarding. Typecheck and 25 unit tests passed locally; browser CI, hosted auth URL/template, deployment smoke tests and invitation delivery remain pending.

Secrets, invitation tokens and account credentials must not be recorded here. Owner identity and acceptance are distinct from technical test results. Stage 1 remains unaccepted until its remaining session, accessibility and operational gates are closed.
