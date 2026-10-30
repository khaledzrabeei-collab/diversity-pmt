import { expect, test } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { localAuthEnabled } from "../support/local-auth-environment";

// Test-only administrative client. Never imported by src or run on hosted data.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
const enabled = localAuthEnabled(process.env);
test.describe("F-03/F-07 authenticated local acceptance", () => {
  test.skip(!enabled, "Requires isolated local Supabase and test service-role key");
  let admin: SupabaseClient;
  const suffix = randomUUID();
  const password = `Test-${randomUUID()}-aA1!`;
  const email = `admin-${suffix}@example.test`;
  const viewerEmail = `viewer-${suffix}@example.test`;
  const organizationId = randomUUID();
  const projectId = randomUUID();

  test.beforeAll(async () => {
    admin = createClient(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } });
    const a = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    const v = await admin.auth.admin.createUser({ email: viewerEmail, password, email_confirm: true });
    if (a.error || v.error) throw new Error("Test account provisioning failed");
    const org = await admin.from("organizations").insert({ id: organizationId, name: "Isolated acceptance fixture" });
    if (org.error) throw org.error;
    const memberships = await admin.from("organization_memberships").insert([
      { organization_id: organizationId, user_id: a.data.user!.id, role: "admin" },
      { organization_id: organizationId, user_id: v.data.user!.id, role: "member" }
    ]);
    if (memberships.error) throw memberships.error;
    const project = await admin.from("projects").insert({ id: projectId, organization_id: organizationId, code: "ASSIGNED", name: "Assigned fixture" });
    if (project.error) throw project.error;
    const assignment = await admin.from("project_memberships").insert({ organization_id: organizationId, project_id: projectId, user_id: v.data.user!.id, role: "viewer" });
    if (assignment.error) throw assignment.error;
    const authProbe = createClient(url!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const probe = await authProbe.auth.signInWithPassword({ email, password });
    if (probe.error) throw new Error(`Fixture sign-in failed: status=${probe.error.status}, code=${probe.error.code}`);
    await authProbe.auth.signOut({ scope: "local" });
  });

  test("admin signs in, creates project, signs out and loses page access", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in to workspace" }).click();
    await expect(page).toHaveURL(/\/workspace$/);
    await page.getByLabel("Project code").fill("NEW-001");
    await page.getByLabel("Project name").fill("New acceptance project");
    await page.getByRole("button", { name: "Create project", exact: true }).click();
    await expect(page.getByRole("heading", { name: "New acceptance project" })).toBeVisible();
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/workspace");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("viewer sees assignment and cannot access create controls", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill(viewerEmail);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in to workspace" }).click();
    await expect(page.getByRole("heading", { name: "Assigned fixture" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create project", exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "New acceptance project" })).toHaveCount(0);
  });

  test("invalid credentials receive a generic error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("invalid-password");
    await page.getByRole("button", { name: "Sign in to workspace" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Unable to sign in" })).toBeVisible();
  });
  // Fixtures remain in disposable local DB for failure inspection; db reset removes them.
});
