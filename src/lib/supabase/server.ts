import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicEnv } from "@/lib/env";
import type { Database } from "./database.types";
export async function createClient() {
  const env = getPublicEnv();
  if (!env.success) throw new Error("Supabase environment is not configured");
  const store = await cookies();
  return createServerClient<Database>(env.data.url, env.data.key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (values) => {
        try { values.forEach(({ name, value, options }) => store.set(name, value, options)); }
        catch { /* Server Components cannot write cookies; proxy refreshes them. */ }
      }
    }
  });
}
