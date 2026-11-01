# Foundation recovery rehearsal

The CI database-and-auth job runs `scripts/rehearse-local-restore.sh` after authenticated browser acceptance. The script requires GitHub Actions, the local-auth acceptance flag and the exact loopback Supabase URL. It targets only the fixed local Docker database container and accepts no database URL or hosted credentials.

## Coverage

1. Require nonempty synthetic projects from the browser tests.
2. Capture row counts and deterministic content digests for organizations, organization memberships, projects, project memberships and audit events, plus audit identity sequence state.
3. Dump those tables with PostgreSQL's matching container tools. The backup is temporary and is never uploaded as an artifact.
4. Truncate those application tables in the disposable database; confirm projects are empty.
5. Restore in a single transaction with stop-on-error, temporarily suppressing only application triggers and re-enabling them in that transaction. Foreign-key constraints remain enforced. This preserves original audit history rather than generating duplicate events.
6. Require identical counts, content digests and sequence state; rerun the PostgreSQL authorization/audit suite.

The temporary files are removed on exit. On failure the CI job fails, and the existing always-run Supabase teardown removes the disposable environment. Hosted staging is not accessed.

The initial run 41336728185 correctly failed because PostgreSQL refused blanket trigger suppression for protected foreign-key triggers. The corrected procedure does not require that privilege and leaves referential integrity checks enabled.

Corrected commit `2f28358` passed the restore rehearsal and both CI jobs in [run 41337241177](https://github.com/khaledzrabeei-collab/diversity-pmt/actions/runs/41337241177). All five application table counts/content digests and the audit sequence matched, and the existing 18 PostgreSQL authorization/audit assertions passed again after restore. This is partial F-08 evidence, subject to the limits below.

## Limits and production gate

This rehearses application-data restoration into the same migrated schema with existing synthetic Auth users. It does not establish recovery of Auth accounts, Storage objects, secrets, infrastructure, schema loss or a whole hosted project. It is not a scheduled production backup service or a point-in-time recovery guarantee.

Before production acceptance, agree recovery time and acceptable data-loss objectives, backup destination/encryption/access/retention, and the permitted recovery operator. Rehearse a complete restore into a separate authorized environment, including Auth identity relationships, schema/migration versions and any future Storage objects; verify row reconciliation, RLS, audit integrity and actual login. Record elapsed restore time, backup age and owner acceptance. Application rollback also needs an independent rehearsal; do not reverse migrations or restore over live data without a reviewed recovery procedure.
