# Access-control matrix

Provisional least-privilege design. User confirmed RBAC, not these exact role names. Memberships are database records, never user-editable auth metadata.

| Capability | Anonymous | Org member, unassigned | Assigned project role | Org auditor | Org admin | Trusted operator |
|---|---|---|---|---|---|---|
| Sign in | Yes | Yes | Yes | Yes | Yes | Account dependent |
| Read organization identity | No | Own org | Own org | Own org | Own org | Provisioning access |
| List projects | No | None | Assigned projects only | All in own org | All in own org | Privileged |
| Create project | No | No | No | No | Own org | Privileged |
| Update project metadata/status via DB API | No | No | No | No | Own org | Privileged |
| Delete projects | No | No | No | No | No | Exceptional controlled operation |
| Read memberships | No | Own rows | Own rows | Own org | Own org | Privileged |
| Change memberships / roles | No | No | No | No | No app endpoint in stage 1 | Runbook only |
| Read audit history via DB API | No | No | No | Own org | Own org | Privileged |
| Insert/update/delete audit directly | No | No | No | No | No | DBA technically privileged |
| Business module data/actions | None | None | Not implemented | Not implemented | Not implemented | Not implemented |

Project roles reserved: manager, finance, procurement, meal, viewer. In this stage all five grant the same **assigned-project read** capability. They do not authorize business operations that do not yet exist. Proposed future responsibilities: manager DIP; finance BVA; procurement procurement; MEAL PITT/monitoring; viewer read-only. Exact read/write/approve/export permissions require domain-owner acceptance before those modules ship. No implicit financial approval authority is granted.

Tenant isolation: organization admins and auditors can read their organization only. Membership in one project does not expose another. Composite foreign keys prevent project memberships crossing organizations. Client grants prevent changing a project's organization, author or timestamps. RLS is applied on direct API access as well as through the UI.

Trusted operator means a designated person using Supabase administrative tools under operational access controls. Service-role credentials bypass RLS; they are forbidden in the app runtime and browser. Supabase organization/project administration is separate from application org-admin roles. Administrative access must be recorded and reviewed.

Revocation: removing project membership immediately removes scoped visibility on the next query. Remove dependent project memberships before organization membership. Role changes are audited. Account suspension requires Supabase Auth administrative action; server checks use getUser to validate the current account. Existing already-rendered browser content cannot be recalled; authorization applies to subsequent requests.
