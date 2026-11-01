import Link from "next/link";
import { redirect } from "next/navigation";
import { acceptInvitation } from "@/modules/auth/actions";
import { invitationToken } from "@/modules/auth/invitation";
import { getPublicEnv } from "@/lib/env";

export const dynamic = "force-dynamic";
export const metadata = { title: "Accept invitation | Diversity PMT", referrer: "no-referrer" as const };

export default async function Confirm({ searchParams }: {
  searchParams: Promise<{ token_hash?: string; error?: string }>
}) {
  if (!getPublicEnv().success) redirect("/setup");
  const params = await searchParams;
  const token = invitationToken.safeParse(params.token_hash);
  return <main className="setup"><section className="panel">
    <h1>Join your project workspace</h1>
    {params.error || !token.success ? <>
      <p role="alert">This invitation is invalid, expired or already used. Ask your administrator for a new invitation.</p>
      <Link href="/login">Return to sign in</Link>
    </> : <>
      <p>Accept your invitation, then choose a password for your account.</p>
      <form action={acceptInvitation}>
        <input type="hidden" name="token_hash" value={token.data} />
        <button type="submit">Accept invitation</button>
      </form>
    </>}
  </section></main>;
}
