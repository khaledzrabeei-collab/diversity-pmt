#!/usr/bin/env bash
# Application-data rehearsal only. Never accepts a hosted database URL.
set -euo pipefail
if [[ "${GITHUB_ACTIONS:-}" != "true" || "${REQUIRE_AUTH_ACCEPTANCE:-}" != "1" || "${NEXT_PUBLIC_SUPABASE_URL:-}" != "http://127.0.0.1:54321" ]]; then
  echo 'Restore rehearsal requires the disposable GitHub Actions Supabase environment.' >&2
  exit 1
fi
container=supabase_db_diversity-pmt
scratch=$(mktemp -d)
trap 'rm -rf -- "$scratch"' EXIT
tables=(organizations organization_memberships projects project_memberships audit_events)
args=()
for table in "${tables[@]}"; do args+=(--table="public.$table"); done
snapshot() {
  for table in "${tables[@]}"; do
    docker exec "$container" psql -X -U postgres -d postgres -v ON_ERROR_STOP=1 -Atc \
      "select '$table', count(*), md5(coalesce(string_agg(to_jsonb(t)::text, E'\\n' order by to_jsonb(t)::text), '')) from public.$table t;"
  done
  docker exec "$container" psql -X -U postgres -d postgres -v ON_ERROR_STOP=1 -Atc \
    'select last_value, is_called from public.audit_events_id_seq;'
}
# Existing browser fixtures supply synthetic accounts, memberships, projects and audit events.
count=$(docker exec "$container" psql -X -U postgres -d postgres -Atc 'select count(*) from public.projects;')
[[ "$count" =~ ^[1-9][0-9]*$ ]] || { echo 'Expected nonempty synthetic fixtures.' >&2; exit 1; }
snapshot > "$scratch/before"
docker exec "$container" pg_dump -U postgres -d postgres --data-only --disable-triggers "${args[@]}" > "$scratch/application.sql"
test -s "$scratch/application.sql"
docker exec "$container" psql -X -U postgres -d postgres -v ON_ERROR_STOP=1 -c \
  'truncate public.audit_events, public.project_memberships, public.projects, public.organization_memberships, public.organizations restart identity;'
empty=$(docker exec "$container" psql -X -U postgres -d postgres -Atc 'select count(*) from public.projects;')
[[ "$empty" == '0' ]]
docker exec -i "$container" psql -X -U postgres -d postgres -v ON_ERROR_STOP=1 --single-transaction < "$scratch/application.sql" > "$scratch/restore.log"
snapshot > "$scratch/after"
diff -u "$scratch/before" "$scratch/after"
echo 'Application data restore passed: five table counts/content digests and audit sequence match.'
# Recheck actual permissions and audit triggers after restoration.
npm run db:test
