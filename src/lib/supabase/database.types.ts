// Stage-1 schema contract. Regenerate from the migrated DB when integration is available:
// npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
type OrganizationRole = "admin" | "member" | "auditor";
type ProjectRole = "manager" | "finance" | "procurement" | "meal" | "viewer";
type ProjectStatus = "draft" | "active" | "archived";
type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
type Table<Row, Insert, Update = Partial<Insert>> = { Row: Row; Insert: Insert; Update: Update; Relationships: [] };
export type Database = {
  public: {
    Tables: {
      organizations: Table<{ id: string; name: string; created_at: string }, { id?: string; name: string; created_at?: string }>;
      organization_memberships: Table<
        { organization_id: string; user_id: string; role: OrganizationRole; created_at: string },
        { organization_id: string; user_id: string; role?: OrganizationRole; created_at?: string }
      >;
      projects: Table<
        { id: string; organization_id: string; code: string; name: string; status: ProjectStatus; created_by: string | null; created_at: string; updated_at: string },
        { id?: string; organization_id: string; code: string; name: string; status?: ProjectStatus; created_by?: string | null; created_at?: string; updated_at?: string }
      >;
      project_memberships: Table<
        { organization_id: string; project_id: string; user_id: string; role: ProjectRole; created_at: string },
        { organization_id: string; project_id: string; user_id: string; role?: ProjectRole; created_at?: string }
      >;
      audit_events: Table<
        { id: number; organization_id: string; actor_id: string | null; entity_type: string; entity_id: string; action: string; before_data: Json | null; after_data: Json | null; occurred_at: string },
        never,
        never
      >;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { organization_role: OrganizationRole; project_role: ProjectRole; project_status: ProjectStatus };
    CompositeTypes: { [_ in never]: never };
  };
};
