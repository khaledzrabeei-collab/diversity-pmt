import { expect, test } from "@playwright/test";
test("F-01 liveness returns no operational data", async ({ request }) => {
  const result = await request.get("/api/health");
  expect(result.status()).toBe(200);
  expect(await result.json()).toEqual({ status: "ok", service: "diversity-pmt" });
});
test("F-02 unconfigured application fails closed", async ({ page }) => {
  test.skip(Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY), "Unconfigured mode only");
  await page.goto("/workspace");
  await expect(page).toHaveURL(/\/setup$/);
  await expect(page.getByRole("heading", { name: "Connect your workspace" })).toBeVisible();
});
test("F-03 configured application requires a session", async ({ page }) => {
  test.skip(!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, "Configured mode only");
  await page.goto("/workspace");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel("Email address")).toBeVisible();
});
