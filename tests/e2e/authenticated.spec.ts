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
  let viewerId: string;

  test.beforeAll(async () => {
    admin = createClient(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } });
    const a = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    const v = await admin.auth.admin.createUser({ email: viewerEmail, password, email_confirm: true });
    if (a.error || v.error) throw new Error("Test account provisioning failed");
    viewerId = v.data.user!.id;
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
    const loginResponse = await page.goto("/login");
    expect(loginResponse?.headers()["cache-control"]).toContain("no-store");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in to workspace" }).click();
    await expect(page).toHaveURL(/\/workspace$/);
    await page.getByLabel("Project code").fill("NEW-001");
    await page.getByLabel("Project name").fill("New acceptance project");
    await page.getByRole("button", { name: "Create project", exact: true }).click();
    await expect(page.getByRole("heading", { name: "New acceptance project" })).toBeVisible();
    const workspaceResponse = await page.reload();
    expect(workspaceResponse?.headers()["cache-control"]).toContain("private");
    expect(workspaceResponse?.headers()["cache-control"]).toContain("no-store");
    const otherTab = await page.context().newPage();
    await otherTab.goto("/workspace");
    await expect(otherTab.getByRole("heading", { name: "New acceptance project" })).toBeVisible();
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/workspace");
    await expect(page).toHaveURL(/\/login$/);
    await otherTab.reload();
    await expect(otherTab).toHaveURL(/\/login$/);
    await otherTab.close();
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
  test("public self-registration remains disabled", async () => {
    const publicClient = createClient(url!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const result = await publicClient.auth.signUp({ email: `uninvited-${randomUUID()}@example.test`, password });
    expect(result.error?.code).toBe("signup_disabled");
    expect(result.data.session).toBeNull();
    expect(result.data.user).toBeNull();
  });
  test("an open viewer session loses project access after assignment revocation", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill(viewerEmail);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in to workspace" }).click();
    await expect(page.getByRole("heading", { name: "Assigned fixture" })).toBeVisible();
    try {
      const revoked = await admin.from("project_memberships").delete()
        .eq("project_id", projectId).eq("user_id", viewerId);
      if (revoked.error) throw revoked.error;
      await page.reload();
      await expect(page).toHaveURL(/\/workspace$/);
      await expect(page.getByRole("heading", { name: "Assigned fixture" })).toHaveCount(0);
      await expect(page.getByRole("heading", { name: "Your project workspace starts here" })).toBeVisible();
    } finally {
      const restored = await admin.from("project_memberships").upsert({
        organization_id: organizationId, project_id: projectId, user_id: viewerId, role: "viewer"
      });
      if (restored.error) throw restored.error;
    }
  });
  test("login supports keyboard input and workspace fits mobile and desktop", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/login");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByLabel("Email address").focus();
    await page.keyboard.type(email);
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Password", { exact: true })).toBeFocused();
    await page.keyboard.type(password);
    await page.keyboard.press("Tab");
    const signIn = page.getByRole("button", { name: "Sign in to workspace" });
    await expect(signIn).toBeFocused();
    expect(await signIn.evaluate(element => parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThan(0);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/workspace$/);
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.getByLabel("Project code")).toBeVisible();
      await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  });
  test("separate browser sessions do not share project responses", async ({ page, browser }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in to workspace" }).click();
    await expect(page.getByRole("heading", { name: "Assigned fixture" })).toBeVisible();
    const isolated = await browser.newContext({ baseURL: "http://localhost:3000" });
    const outsiderEmail = `outsider-${randomUUID()}@example.test`;
    const outsider = await admin.auth.admin.createUser({ email: outsiderEmail, password, email_confirm: true });
    if (outsider.error) throw outsider.error;
    try {
      const other = await isolated.newPage();
      await other.goto("/workspace");
      await expect(other).toHaveURL(/\/login$/);
      await other.getByLabel("Email address").fill(outsiderEmail);
      await other.getByLabel("Password", { exact: true }).fill(password);
      await other.getByRole("button", { name: "Sign in to workspace" }).click();
      await expect(other).toHaveURL(/\/workspace$/);
      for (let attempt = 0; attempt < 2; attempt++) {
        await page.reload();
        await expect(page.getByRole("heading", { name: "Assigned fixture" })).toBeVisible();
        await other.reload();
        await expect(other.getByRole("heading", { name: "Assigned fixture" })).toHaveCount(0);
        await expect(other.getByRole("button", { name: "Create project", exact: true })).toHaveCount(0);
      }
      // A real server-side account removal must invalidate the existing browser session.
      const removed = await admin.auth.admin.deleteUser(outsider.data.user.id);
      if (removed.error) throw removed.error;
      await other.reload();
      await expect(other).toHaveURL(/\/login$/);
    } finally {
      await isolated.close();
    }
  });
  // Fixtures remain in disposable local DB for failure inspection; db reset removes them.
  test("invitation needs explicit acceptance, permits password setup, and cannot be replayed", async ({ page, browser }) => {
    const invitedEmail = `invited-${randomUUID()}@example.test`;
    const invite = await admin.auth.admin.generateLink({ type: "invite", email: invitedEmail });
    if (invite.error) throw new Error(`Invitation provisioning failed: ${invite.error.code}`);
    const token = invite.data.properties.hashed_token;
    const invitationUrl = `/auth/confirm?token_hash=${encodeURIComponent(token)}`;
    await page.goto("/account/password");
    await expect(page).toHaveURL(/\/login$/);
    const response = await page.goto(invitationUrl);
    expect(response?.headers()["referrer-policy"]).toBe("no-referrer");
    await page.reload(); // Email scanners can GET the link without consuming it.
    await page.getByRole("button", { name: "Accept invitation" }).click();
    await expect(page).toHaveURL(/\/account\/password$/);
    await page.getByLabel("New password", { exact: true }).fill(password);
    await page.getByLabel("Confirm password").fill(password);
    await page.getByRole("button", { name: "Save password" }).click();
    await expect(page).toHaveURL(/\/workspace$/);
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.getByLabel("Email address").fill(invitedEmail);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in to workspace" }).click();
    await expect(page).toHaveURL(/\/workspace$/);
    const replayContext = await browser.newContext();
    try {
      const replay = await replayContext.newPage();
      await replay.goto(`http://localhost:3000${invitationUrl}`);
      await replay.getByRole("button", { name: "Accept invitation" }).click();
      await expect(replay.getByRole("alert").filter({ hasText: "invitation is invalid" })).toBeVisible();
      await replay.goto("http://localhost:3000/account/password");
      await expect(replay).toHaveURL(/\/login$/);
    } finally { await replayContext.close(); }
  });
});
