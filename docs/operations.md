# Development, provisioning and deployment runbook

## Local environment

Use Node 22/24 and the committed npm lockfile. Docker Desktop with Linux containers is required for `npm run db:start`. Run `npm run db:reset` only on the disposable local project. Config disables signup; this does not configure an already-hosted Supabase project's settings automatically. If the CLI reports no matching binary after an interrupted optional dependency download, repair with `npm ci --include=optional` and verify `npx supabase --version` before proceeding.

Copy public URL/key from `npx supabase status` into `.env.local`. Legacy local anon key is compatible with the publishable-key environment variable. Keep service-role credentials out of runtime configuration. `SUPABASE_TEST_SERVICE_ROLE_KEY` is used only by loopback integration tests, never deployment or browser bundles.

## Initial operator provisioning

1. Apply migration using the CLI under controlled operator credentials.
2. In local Studio or hosted Supabase Auth administration, create the initial user's email/password via a secure channel and verify the email. No public sign-up endpoint is used. Do not copy passwords into SQL or Git.
3. Copy that user's UUID and run the following in the trusted SQL editor with real values (placeholders are intentionally invalid). Review organization names and user before running.

```sql
begin;
with created as (
  insert into public.organizations(name) values ('YOUR ORGANIZATION') returning id
)
insert into public.organization_memberships(organization_id,user_id,role)
select id, 'REPLACE_WITH_AUTH_USER_UUID'::uuid, 'admin' from created;
commit;
```

4. Sign in through the app and create a project. For each additional user, create their Auth account, add an organization_memberships row and a project_memberships row using matching organization_id/project_id. Use the documented role matrix. All membership changes trigger audit records; operator SQL actions have null actor_id unless an authenticated user context is supplied. Record operator identity separately in the change ticket.
5. Recovery currently uses the trusted administrator's Supabase Auth tooling and approved identity-verification process. Self-service recovery and membership UI are deferred; do not interpret them as delivered.

## Hosted configuration

Use distinct Supabase and Vercel projects for staging and production. Store only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in each Vercel project's runtime environment. Match Auth site URL to that environment, disable public signup, configure email delivery and verify rate limits. Approve MFA/SSO policy before production. Public signup disabled locally is not proof that hosted signup is disabled.

Create a Git remote when its destination is supplied; push the reviewed repository. Configure branch protection on main with both CI jobs required. In GitHub, create `staging` and `production` Environments, restrict deployments to main, require designated reviewers (especially production), and prevent self-approval. **Workflow YAML alone cannot enforce those repository settings.**

Repository setup is outstanding as of 2026-10-31: the owner confirmed no repository exists. Create an empty private `diversity-pmt` repository in the intended NGO account/organization without adding a README, license or .gitignore (these local files already exist). Supply its repository URL; authenticate Git through the provider's secure sign-in flow, never by pasting a token into chat. Before the first push, review tracked files and confirm `references/private`, `.env.local`, source exports and credentials remain excluded. Running the existing CI on GitHub provides a disposable Linux Docker environment for database/authentication checks without using the NGO's production data.

Per GitHub Environment:

| Type | Names |
|---|---|
| Secrets | SUPABASE_ACCESS_TOKEN, SUPABASE_DB_PASSWORD, VERCEL_TOKEN |
| Variables | SUPABASE_PROJECT_REF, VERCEL_ORG_ID, VERCEL_PROJECT_ID, VERCEL_CLI_VERSION |

Set VERCEL_CLI_VERSION to a reviewed exact semver. The workflow refuses an unset/floating version. Both staging and production deploy to their own Vercel project's production target, preventing production data from leaking into staging. Disable any independent automatic Vercel production deployment path that could bypass GitHub gates.

Run CI, then the manual Gated deployment workflow on main with a signed acceptance/validation ticket URL. CI reruns for that commit. The environment reviewer checks the migration and acceptance evidence before approving. The workflow dry-runs and applies additive migrations, builds, deploys, and probes liveness. A successful liveness probe does not complete acceptance: run login/project access/create/logout smoke tests and verify Auth settings. If Vercel deployment protection is enabled, configure an approved protected smoke-test mechanism; the unauthenticated curl may fail and must not be silently ignored.

## Release and rollback

Before production: evidence baseline accepted, role model approved, all required tests pass, no unexplained skipped tests, backup/PITR configured, restore rehearsal completed, region/retention/RPO/RTO approved, log access reviewed and operator designated. Stage 1 is a foundation candidate, not a production rollout authorization.

If app deployment fails after an additive migration, retain the prior deployment and investigate; migration changes remain. Revert to the previous known-good Vercel deployment for app regressions. For schema incidents, use a reviewed forward fix or an approved restore; never automate destructive rollback. Record commit, applied migration versions, provider deployment ID and acceptance link. Test backward-compatible changes in staging before production.

## Observability and maintenance

Monitor app availability and sanitized error counts, Auth failure spikes and DB health via provider tooling. Restrict audit history and infrastructure logs. Audit events cover project/org/membership mutations, not all reads or Auth lifecycle events. Use Supabase Auth logs for authentication. Alert thresholds, retention, on-call ownership and backup schedules require operational acceptance. Do not log full form bodies, session cookies, keys or original workbook rows.
