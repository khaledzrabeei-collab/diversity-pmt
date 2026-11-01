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

Supabase advisors found three foreign keys without covering indexes (project membership organization/project, membership organization/user, and project creator). Additive migration `202611010001_foundation_indexes.sql` addresses these with bounded lock/statement timeouts. Unused-index notices on a newly provisioned database are informational; existing authorization/audit indexes are retained.

The advisor also reports leaked-password protection disabled. Supabase documents this as Pro-plan-and-above functionality: https://supabase.com/docs/guides/auth/password-security. No paid upgrade is authorized or performed. This remains a production security decision; the application and provider minimum password lengths are being aligned to 12 characters. Neither setting alone is a substitute for leaked-password screening.
