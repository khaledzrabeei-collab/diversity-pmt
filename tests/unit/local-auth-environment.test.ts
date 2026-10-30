import { describe, expect, it } from "vitest";
import { localAuthEnabled } from "../support/local-auth-environment";

const configured = {
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "synthetic-public-key",
  SUPABASE_TEST_SERVICE_ROLE_KEY: "synthetic-test-key"
};

describe("authentication acceptance environment", () => {
  it("allows complete isolated configuration", () => {
    expect(localAuthEnabled({ ...configured, REQUIRE_AUTH_ACCEPTANCE: "1" })).toBe(true);
  });
  it("allows unconfigured development without accepting integration", () => {
    expect(localAuthEnabled({})).toBe(false);
  });
  it.each([
    "https://example.supabase.co", "http://127.0.0.1.evil.test",
    "http://user:password@127.0.0.1:54321", "http://127.0.0.1:54321/proxy",
    "http://127.0.0.1:54321?target=hosted", "invalid-url"
  ])("rejects unsafe or malformed target %s", (url) => {
    expect(localAuthEnabled({ ...configured, NEXT_PUBLIC_SUPABASE_URL: url })).toBe(false);
    expect(() => localAuthEnabled({ ...configured, NEXT_PUBLIC_SUPABASE_URL: url,
      REQUIRE_AUTH_ACCEPTANCE: "1" })).toThrow("No tests were accepted");
  });
  it.each(["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_TEST_SERVICE_ROLE_KEY"])(
    "fails the required job when %s is absent", (key) => {
      expect(() => localAuthEnabled({ ...configured, [key]: "", REQUIRE_AUTH_ACCEPTANCE: "1" }))
        .toThrow("No tests were accepted");
    }
  );
});
