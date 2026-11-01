import { expect, it } from "vitest";
import { invitationToken, passwordInput } from "../../src/modules/auth/invitation";

it.each(["", "https://evil.test", "a".repeat(129), "not-a-token"])("rejects invalid invitation token %s", value => {
  expect(invitationToken.safeParse(value).success).toBe(false);
});
it("accepts a token hash without interpreting redirect instructions", () => {
  expect(invitationToken.safeParse("a".repeat(64)).success).toBe(true);
});
it("rejects short, overlong and mismatched passwords", () => {
  for (const password of ["short", "a".repeat(129)]) {
    expect(passwordInput.safeParse({ password, confirmPassword: password }).success).toBe(false);
  }
  expect(passwordInput.safeParse({ password: "a".repeat(12), confirmPassword: "different" }).success).toBe(false);
});
it("accepts matching passwords and strips unrelated fields", () => {
  expect(passwordInput.parse({ password: "a".repeat(12), confirmPassword: "a".repeat(12), role: "admin" }))
    .not.toHaveProperty("role");
});
