import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export async function verifyDeploymentHealth(deployment: string, secret: string, request: typeof fetch = fetch) {
  const url = new URL(deployment);
  if (url.protocol !== "https:" || !url.hostname.endsWith(".vercel.app") || url.username || url.password || url.port || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("Expected a direct HTTPS Vercel deployment origin");
  }
  if (!secret.trim()) throw new Error("Deployment protection secret is required");
  const response = await request(new URL("/api/health", url), {
    headers: { "x-vercel-protection-bypass": secret },
    redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(15_000)
  });
  if (response.status !== 200) throw new Error("Deployment health request did not return HTTP 200");
  if (!response.headers.get("content-type")?.includes("application/json")) throw new Error("Deployment health did not return JSON");
  const body = await response.json();
  if (!body || body.status !== "ok" || body.service !== "diversity-pmt" || Object.keys(body).length !== 2) {
    throw new Error("Deployment health returned an unexpected service payload");
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifyDeploymentHealth(process.env.DEPLOY_URL ?? "", process.env.VERCEL_AUTOMATION_BYPASS_SECRET ?? "")
    .then(() => console.log("Diversity PMT deployment health verified"))
    .catch(() => { console.error("Deployment health verification failed; review configuration and provider status."); process.exitCode = 1; });
}
