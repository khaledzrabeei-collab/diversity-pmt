-- Foundation only. No workbook values, financial calculations or indicator formulas.
begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create type public.organization_role as enum ('admin', 'member', 'auditor');
create type public.project_role as enum ('manager', 'finance', 'procurement', 'meal', 'viewer');
create type public.project_status as enum ('draft', 'active', 'archived');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 160),
  created_at timestamptz not null default now()
);
create table public.organization_memberships (
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  role public.organization_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index organization_memberships_user_idx on public.organization_memberships(user_id);
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  code text not null check (char_length(code) between 2 and 32 and code ~ '^[A-Z0-9][A-Z0-9_-]+$'),
  name text not null check (char_length(btrim(name)) between 2 and 160),
  status public.project_status not null default 'draft',
  created_by uuid default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code),
  unique (organization_id, id)
);
create table public.project_memberships (
  organization_id uuid not null,
  project_id uuid not null,
  user_id uuid not null,
  role public.project_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (project_id, user_id),
  foreign key (organization_id, project_id) references public.projects(organization_id, id) on delete restrict,
  foreign key (organization_id, user_id) references public.organization_memberships(organization_id, user_id) on delete restrict
);
create index project_memberships_user_idx on public.project_memberships(user_id);
create table public.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  actor_id uuid,
  entity_type text not null,
  entity_id text not null,
  action text not null check (action in ('INSERT','UPDATE','DELETE')),
  before_data jsonb,
  after_data jsonb,
  occurred_at timestamptz not null default now()
);
create index audit_events_org_time_idx on public.audit_events(organization_id, occurred_at desc);

-- SECURITY DEFINER helpers read protected memberships without recursive RLS.
-- Every helper derives the principal from auth.uid(), never a caller-supplied user ID.
create function private.org_role(org uuid) returns public.organization_role
language sql stable security definer set search_path = '' as $$
  select role from public.organization_memberships where organization_id = org and user_id = (select auth.uid())
$$;
create function private.can_read_project(org uuid, project uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(private.org_role(org) in ('admin', 'auditor'), false)
    or (private.org_role(org) is not null and exists (
      select 1 from public.project_memberships where organization_id = org and project_id = project and user_id = (select auth.uid())
    ))
$$;
revoke all on function private.org_role(uuid) from public;
revoke all on function private.can_read_project(uuid, uuid) from public;
grant execute on function private.org_role(uuid), private.can_read_project(uuid, uuid) to authenticated;

alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.projects enable row level security;
alter table public.project_memberships enable row level security;
alter table public.audit_events enable row level security;

-- Explicit grants prevent clients assigning roles, forging authors or moving projects.
revoke all on public.organizations, public.organization_memberships, public.projects, public.project_memberships, public.audit_events from anon, authenticated;
grant select on public.organizations, public.organization_memberships, public.projects, public.project_memberships, public.audit_events to authenticated;
grant insert (organization_id, code, name) on public.projects to authenticated;
grant update (code, name, status) on public.projects to authenticated;

create policy organization_read on public.organizations for select to authenticated using (private.org_role(id) is not null);
create policy organization_membership_read on public.organization_memberships for select to authenticated using (
  user_id = (select auth.uid()) or private.org_role(organization_id) in ('admin', 'auditor')
);
create policy project_read on public.projects for select to authenticated using (private.can_read_project(organization_id, id));
create policy project_insert on public.projects for insert to authenticated with check (private.org_role(organization_id) = 'admin');
create policy project_update on public.projects for update to authenticated using (private.org_role(organization_id) = 'admin') with check (private.org_role(organization_id) = 'admin');
create policy project_membership_read on public.project_memberships for select to authenticated using (
  user_id = (select auth.uid()) or private.org_role(organization_id) in ('admin', 'auditor')
);
create policy audit_read on public.audit_events for select to authenticated using (private.org_role(organization_id) in ('admin', 'auditor'));

create function private.touch_project() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = clock_timestamp(); return new; end
$$;
create trigger project_updated before update on public.projects for each row execute function private.touch_project();

create function private.audit_change() returns trigger language plpgsql security definer set search_path = '' as $$
declare old_row jsonb; new_row jsonb; row_data jsonb; org uuid;
begin
  if TG_OP <> 'INSERT' then old_row := to_jsonb(old); end if;
  if TG_OP <> 'DELETE' then new_row := to_jsonb(new); end if;
  row_data := coalesce(new_row, old_row);
  if TG_TABLE_NAME = 'organizations' then org := (row_data->>'id')::uuid;
  else org := (row_data->>'organization_id')::uuid; end if;
  insert into public.audit_events(organization_id, actor_id, entity_type, entity_id, action, before_data, after_data)
  values (org, auth.uid(), TG_TABLE_NAME,
    coalesce(row_data->>'id', concat_ws(':', row_data->>'organization_id', row_data->>'project_id', row_data->>'user_id')),
    TG_OP, old_row, new_row);
  return null;
end
$$;
revoke all on function private.audit_change(), private.touch_project() from public;
create trigger organization_audit after insert or update on public.organizations for each row execute function private.audit_change();
create trigger project_audit after insert or update or delete on public.projects for each row execute function private.audit_change();
create trigger organization_membership_audit after insert or update or delete on public.organization_memberships for each row execute function private.audit_change();
create trigger project_membership_audit after insert or update or delete on public.project_memberships for each row execute function private.audit_change();
commit;
