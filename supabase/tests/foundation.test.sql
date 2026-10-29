begin;
create extension if not exists pgtap with schema extensions;
select plan(18);
insert into auth.users(id) values
('00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000003');
insert into public.organizations(id,name) values
('10000000-0000-0000-0000-000000000001','Test NGO A'),
('10000000-0000-0000-0000-000000000002','Test NGO B');
insert into public.organization_memberships(organization_id,user_id,role) values
('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','admin'),
('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','member'),
('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000003','admin');
insert into public.projects(id,organization_id,code,name) values
('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','A-01','Assigned project'),
('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','A-02','Unassigned project'),
('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','B-01','Other organization');
insert into public.project_memberships(organization_id,project_id,user_id,role) values
('10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','viewer');

set local role anon;
select throws_ok('select * from public.projects','42501',null,'F-03 Anonymous users cannot read projects');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
select is((select count(*)::int from public.projects),1,'F-04 Viewer sees only assigned project');
select is((select count(*)::int from public.organizations),1,'F-04 Organization isolation');
select throws_ok($$insert into public.projects(organization_id,code,name) values ('10000000-0000-0000-0000-000000000001','DENIED','Denied project')$$,'42501',null,'F-05 Viewer cannot create projects');
select throws_ok($$update public.organization_memberships set role='admin'$$,'42501',null,'F-05 No self escalation');
update public.projects set name='Tampered';
select is((select count(*)::int from public.projects where name='Tampered'),0,'F-05 Viewer cannot update projects');
select is((select count(*)::int from public.audit_events),0,'F-06 Viewer cannot read audit history');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
select is((select count(*)::int from public.projects),2,'F-04 Admin sees own organization projects');
select throws_ok($$insert into public.projects(organization_id,code,name) values ('10000000-0000-0000-0000-000000000002','DENIED','Cross org')$$,'42501',null,'F-04 Cross organization insert blocked');
select lives_ok($$insert into public.projects(organization_id,code,name) values ('10000000-0000-0000-0000-000000000001','A-03','New project')$$,'F-07 Admin creates project');
select throws_ok($$insert into public.projects(organization_id,code,name) values ('10000000-0000-0000-0000-000000000001','A-03','Duplicate')$$,'23505',null,'F-07 Duplicate project code rejected');
select throws_ok($$update public.projects set organization_id='10000000-0000-0000-0000-000000000002'$$,'42501',null,'F-04 Project organization is immutable to clients');
select throws_ok($$delete from public.audit_events$$,'42501',null,'F-06 Audit cannot be deleted');
select throws_ok($$insert into public.audit_events(organization_id,entity_type,entity_id,action) values ('10000000-0000-0000-0000-000000000001','fake','fake','INSERT')$$,'42501',null,'F-06 Audit cannot be forged');
select is((select count(*)::int from public.audit_events where entity_type='projects' and after_data->>'code'='A-03' and actor_id='00000000-0000-0000-0000-000000000001'),1,'F-06 Project mutation records actor');
reset role;
delete from public.project_memberships where user_id='00000000-0000-0000-0000-000000000002';
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
select is((select count(*)::int from public.projects),0,'F-04 Revocation immediately hides project');
reset role;
update public.organization_memberships set role='auditor' where user_id='00000000-0000-0000-0000-000000000002';
set local role authenticated;
select is((select count(*)::int from public.projects),3,'F-04 Auditor reads organization projects');
select throws_ok($$insert into public.projects(organization_id,code,name) values ('10000000-0000-0000-0000-000000000001','AUDIT','Denied')$$,'42501',null,'F-05 Auditor is read only');
select * from finish();
rollback;
