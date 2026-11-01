import { requireUser } from "@/modules/auth/session";
import { setPassword } from "@/modules/auth/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Set password | Diversity PMT", referrer: "no-referrer" as const };

export default async function Password({ searchParams }: {
  searchParams: Promise<{ error?: string }>
}) {
  await requireUser();
  const params = await searchParams;
  return <main className="setup"><section className="panel">
    <h1>Set your password</h1>
    <p>Use a unique password of 12–128 characters.</p>
    {params.error && <p role="alert">Unable to set your password. Check that both entries match and meet the length requirement, then try again.</p>}
    <form action={setPassword}>
      <label>New password<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label>
      <label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label>
      <button type="submit">Save password</button>
    </form>
  </section></main>;
}
