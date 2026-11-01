import { signIn } from "@/modules/auth/actions";
import { getPublicEnv } from "@/lib/env";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in | Diversity PMT" };
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!getPublicEnv().success) redirect("/setup");
  const params = await searchParams;
  return <main className="auth-layout"><section className="auth-story"><div className="brand"><span className="brand-mark">D</span>Diversity PMT</div><p className="eyebrow">A shared foundation for humanitarian work</p><h1>Clear plans.<br />Accountable delivery.</h1><p>One secure workspace for your projects and the people delivering them.</p><span className="tag">Foundation · Stage 01</span></section><section className="auth-panel"><div className="panel"><p className="eyebrow">Your workspace</p><h2>Welcome back</h2><p className="muted">Sign in with your organization-provisioned account.</p>{params.error && <p role="alert" className="notice error">Unable to sign in. Check your credentials and try again.</p>}<form action={signIn}><label>Email address<input name="email" type="email" autoComplete="username" required maxLength={254} /></label><label>Password<input name="password" type="password" autoComplete="current-password" required maxLength={1024} /></label><button type="submit">Sign in to workspace <span aria-hidden="true">→</span></button></form><p className="small muted">For access or password recovery, contact your administrator.</p></div></section></main>;
}
