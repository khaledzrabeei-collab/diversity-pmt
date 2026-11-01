"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";
import { invitationToken, passwordInput } from "./invitation";
import { requireUser } from "./session";
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

export async function acceptInvitation(formData: FormData) {
  if (!getPublicEnv().success) redirect("/setup");
  const token = invitationToken.safeParse(formData.get("token_hash"));
  if (!token.success) redirect("/auth/confirm?error=link");
  const client = await createClient();
  const { error } = await client.auth.verifyOtp({ token_hash: token.data, type: "invite" });
  if (error) redirect("/auth/confirm?error=link");
  redirect("/account/password");
}

export async function setPassword(formData: FormData) {
  const { supabase } = await requireUser();
  const parsed = passwordInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/account/password?error=validation");
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) redirect("/account/password?error=update");
  redirect("/workspace");
}
