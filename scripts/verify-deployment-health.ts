import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export async function verifyDeploymentHealth(deployment: string, secret: string, request: typeof fetch = fetch) {
  let url: URL;
  try {
    url = new URL(deployment);
  } catch {
    throw new Error("DEPLOY_URL is not a valid URL");
  }

  if (url.protocol !== "https:" || !url.hostname.endsWith(".vercel.app") || url.username || url.password || url.port || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("Expected a direct HTTPS Vercel deployment origin");
  }
  if (!secret.trim()) throw new Error("Deployment protection secret is required");

  let response: Response;
  try {
    response = await request(new URL("/api/health", url), {
      headers: { "x-vercel-protection-bypass": secret },
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000)
    });
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    throw new Error(`Health request failed before receiving a response (${errorName})`);
  }

  if (response.status !== 200) throw new Error(`Health request returned HTTP ${response.status}`);

  const contentType = response.headers.get("content-type");
  if (!contentType?.toLowerCase().includes("application/json")) {
    throw new Error(`Health response content type was not application/json (${contentType ? "present" : "missing"})`);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("Health response was not valid JSON");
  }

  const payload = typeof body === "object" && body !== null && !Array.isArray(body)
    ? body as Record<string, unknown>
    : null;
  const keyCount = payload ? Object.keys(payload).length : 0;
  const statusOk = payload?.status === "ok";
  const serviceOk = payload?.service === "diversity-pmt";
  if (!payload || !statusOk || !serviceOk || keyCount !== 2) {
    throw new Error(`Health response payload mismatch (statusOk=${statusOk}, serviceOk=${serviceOk}, keyCount=${keyCount})`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifyDeploymentHealth(process.env.DEPLOY_URL ?? "", process.env.VERCEL_AUTOMATION_BYPASS_SECRET ?? "")
    .then(() => console.log("Diversity PMT deployment health verified"))
    .catch((error: unknown) => {
      const detail = error instanceof Error ? error.message : "Unknown health verification error";
      console.error(`Deployment health verification failed: ${detail}`);
      process.exitCode = 1;
    });
}
