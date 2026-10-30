/** Never permit the provisioning suite to target hosted data. */
export function localAuthEnabled(env: Record<string, string | undefined>): boolean {
  let local = false;
  try {
    const url = new URL(env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    local = url.protocol === "http:" && url.hostname === "127.0.0.1"
      && !url.username && !url.password && url.pathname === "/"
      && !url.search && !url.hash;
  } catch { /* Missing or malformed configuration is disabled. */ }
  const enabled = Boolean(local && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    && env.SUPABASE_TEST_SERVICE_ROLE_KEY);
  if (env.REQUIRE_AUTH_ACCEPTANCE === "1" && !enabled) {
    throw new Error("Authentication acceptance requires isolated loopback Supabase and both test keys. No tests were accepted.");
  }
  return enabled;
}
