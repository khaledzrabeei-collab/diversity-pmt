"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";
export async function signIn(formData: FormData) {
  if (!getPublicEnv().success) redirect("/setup");
  const credentials = z.object({ email: z.email().max(254), password: z.string().min(1).max(1024) })
    .safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!credentials.success) redirect("/login?error=credentials");
  const client = await createClient();
  const { error } = await client.auth.signInWithPassword(credentials.data);
  if (error) redirect("/login?error=credentials");
  redirect("/workspace");
}
export async function signOut() {
  const client = await createClient();
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) redirect("/workspace?error=signout");
  redirect("/login");
}
