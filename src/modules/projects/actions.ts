"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/modules/auth/session";
import { projectInput } from "./validation";
export async function createProject(formData: FormData) {
  const { supabase } = await requireUser();
  const input = projectInput.safeParse(Object.fromEntries(formData));
  if (!input.success) redirect("/workspace?error=validation");
  // RLS is the authorization boundary, including for forged organization IDs.
  const { error } = await supabase.from("projects").insert({
    organization_id: input.data.organizationId, code: input.data.code, name: input.data.name
  });
  if (error) redirect("/workspace?error=project");
  revalidatePath("/workspace");
  redirect("/workspace?created=1");
}
