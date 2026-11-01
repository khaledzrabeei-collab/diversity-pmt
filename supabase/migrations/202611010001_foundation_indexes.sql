-- Add covering indexes identified by the staging database advisor.
-- No records, role grants, RLS policies or business calculations change.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

create index project_memberships_org_project_idx
  on public.project_memberships(organization_id, project_id);
create index project_memberships_org_user_idx
  on public.project_memberships(organization_id, user_id);
create index projects_created_by_idx on public.projects(created_by);

commit;
