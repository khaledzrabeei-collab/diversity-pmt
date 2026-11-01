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
- Invitation/password setup added to support administrator onboarding. Typecheck and 25 unit tests passed locally. Full CI passed for application changes in run [41330639147](https://github.com/khaledzrabeei-collab/diversity-pmt/actions/runs/41330639147) and for the final upload exclusion fix in [41331158339](https://github.com/khaledzrabeei-collab/diversity-pmt/actions/runs/41331158339), commit `aa304f9`.
- Staging deployed successfully at https://diversity-pmt-staging.vercel.app, deployment `dpl_B7QUfC3THhsKeyUAeSDDTWAcCof4`. Vercel authentication protection retained. CLI smoke checks used Vercel's managed protection bypass; its token was not printed or committed.
- Live health returned the expected status/service JSON. Login returned HTTP 200 with private/no-store and no-referrer headers. Unauthenticated workspace redirected to login.
- First upload failed because `supabase/` also excluded the runtime client directory. Changed it to root-only `/supabase/` and excluded test-only config files; successful Vercel build confirms the corrected bundle.
- Hosted Auth site URL set to the staging URL. Custom invitation email template was rejected by the free default email service; no upgrade or custom SMTP was configured. The versioned template remains available for future SMTP setup.
- One requested administrator provisioned in a new `Diversity — Staging` organization using trusted operator access. No business projects/data created. An explicit single-use invite was generated and saved only in an ignored private local setup file; no email was sent, and no password was assigned by the agent. Password choice and the first real administrator login await the owner. Provisioning uses null application actor IDs, as documented for operator actions.

Secrets, invitation tokens and account credentials must not be recorded here. Owner identity and acceptance are distinct from technical test results. Stage 1 remains unaccepted until its remaining session, accessibility and operational gates are closed.

## Follow-up verification

Read-only staging checks confirmed one email-confirmed account with a recorded sign-in, one organization administrator, one project and one project-creation audit event. This supersedes the pending initial-login status above; it does not prove logout/relogin or owner acceptance.

Subsequently, the owner explicitly confirmed successful sign-out, password sign-in and continued project visibility. This closes the owner login check, not the remaining foundation acceptance gates. See foundation-acceptance.md.

Supabase advisors found three foreign keys without covering indexes (project membership organization/project, membership organization/user, and project creator). Additive migration `202611010001_foundation_indexes.sql` addresses these with bounded lock/statement timeouts. Unused-index notices on a newly provisioned database are informational; existing authorization/audit indexes are retained.

The advisor also reports leaked-password protection disabled. Supabase documents this as Pro-plan-and-above functionality: https://supabase.com/docs/guides/auth/password-security. No paid upgrade is authorized or performed. This remains a production security decision; the application and provider minimum password lengths are aligned to 12 characters. Neither setting alone is a substitute for leaked-password screening.

CI run [41332190740](https://github.com/khaledzrabeei-collab/diversity-pmt/actions/runs/41332190740) passed for commit `0e113b2`. The additive index migration was then applied successfully to staging, with no seeds or source imports. A subsequent advisor check returned no missing-foreign-key-index findings; unused-index notices remain informational and leaked-password protection remains an open warning. The reviewed partial Auth configuration pushed only the minimum password length from 6 to 12, leaving undeclared properties unchanged. A final read-only check confirmed one administrator, one confirmed user and one project remain present. These database/configuration changes required no application redeployment.


## Gated deployment follow-up — 2026-11-02

Run [41357321214](https://github.com/khaledzrabeei-collab/diversity-pmt/actions/runs/41357321214) passed the application and database/auth CI checks. The corrected scoped Supabase PAT worked for `supabase link`. The run then failed at `supabase db push --dry-run` because the GitHub Actions runner could not reach the direct database endpoint over IPv6. Migration apply and all Vercel pull/build/deploy steps were skipped. No database or deployment changes occurred, and production was not targeted.

Local branch `fix/staging-ipv4-session-pooler` prepares a staging-only migration path using the Supavisor session pooler with `--db-url`; production retains its prior path. The branch is not pushed. Before a further staging run, configure a GitHub `staging` Environment secret named `SUPABASE_DB_URL` using Supabase Connect's session-pooler URL on port 5432, with the database password percent-encoded. Do not record or send the secret value. The one previously authorized retry has been used; a further run requires fresh authorization.
