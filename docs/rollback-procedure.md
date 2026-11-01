# Application rollback procedure

Status: prepared procedure, not a completed hosted rollback rehearsal. No deployment alias or database was changed while preparing this record.

## Select and review the target

Record the environment, Vercel project/team, current deployment URL and commit, previous known-good immutable deployment URL and commit, applied migration versions, operator and incident/acceptance link. Confirm both deployments belong to the same intended project. Do not select a target only by its age: it must be compatible with the database schema and environment configuration currently in use.

The existing staging deployment is documented in staging-rollout.md. It is evidence of a prior deployment, not automatically a suitable target for every future schema version. Required environment reviewers and recovery objectives remain outstanding.

## Rehearse after hosting and release gates are resolved

1. Use an isolated staging project and synthetic fixtures. Capture the current release metadata and a verified backup; confirm a forward recovery path.
2. Verify the candidate and prior deployment health and run login/project-access checks. Preserve the prior deployment.
3. An authorized operator uses the reviewed CLI's `vercel rollback <known-good-deployment-url>` with the correct project/team context. Review the target before confirming; do not substitute an arbitrary URL or automatically roll back on every health failure.
4. Confirm the canonical staging domain now resolves to the selected release. Verify the exact health payload, anonymous login redirection, a provisioned login, project visibility and role restrictions. Check provider logs without collecting credentials.
5. Confirm migration versions and application data were not rolled back or overwritten. Record elapsed recovery time and any failed checks.
6. Return to the intended candidate through the reviewed release process, repeat smoke checks, and obtain owner acceptance of the evidence.

A Vercel application rollback does not undo database migrations, restore Auth users or restore Storage objects. For incompatible schema changes, stop and use a reviewed forward fix or separately approved data-recovery plan. See recovery-rehearsal.md for the narrower application-data restore already tested in CI.

## Protected health checks

The release workflow requires `VERCEL_AUTOMATION_BYPASS_SECRET` in the selected GitHub Environment before any migration is applied. `scripts/verify-deployment-health.ts` accepts only a direct HTTPS `*.vercel.app` origin, sends the secret in a header, refuses redirects, and requires HTTP 200 plus the exact Diversity PMT liveness payload. It never prints the secret or response body. The provider's deployment protection remains enabled. Liveness alone does not establish functional acceptance or verify which commit serves the canonical domain.

References: [Vercel rollback CLI](https://vercel.com/docs/cli/rollback) and [automation protection bypass](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation).
