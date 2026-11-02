import { describe, expect, it, vi } from "vitest";
import { verifyDeploymentHealth } from "../../scripts/verify-deployment-health";

async function rejectedError(promise: Promise<unknown>): Promise<Error> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof Error) return error;
    throw new Error("Promise rejected with a non-Error value");
  }
  throw new Error("Expected promise to reject");
}

describe("protected deployment health", () => {
  it("uses a header and never follows redirects", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ status: "ok", service: "diversity-pmt" }));
    await verifyDeploymentHealth("https://example.vercel.app", "synthetic-secret", request);
    const [url, options] = request.mock.calls[0];
    expect(String(url)).toBe("https://example.vercel.app/api/health");
    expect(options?.redirect).toBe("manual");
    expect(options?.headers).toEqual({ "x-vercel-protection-bypass": "synthetic-secret" });
  });

  it.each(["http://example.vercel.app", "https://example.vercel.app.attacker.test", "https://example.vercel.app?token=x", "https://user:password@example.vercel.app", "https://example.vercel.app/other"])("rejects unsafe origin %s before sending credentials", async origin => {
    const request = vi.fn<typeof fetch>();
    await expect(verifyDeploymentHealth(origin, "synthetic-secret", request)).rejects.toThrow();
    expect(request).not.toHaveBeenCalled();
  });

  it("fails before requesting when protection credentials are missing", async () => {
    const request = vi.fn<typeof fetch>();
    await expect(verifyDeploymentHealth("https://example.vercel.app", "", request)).rejects.toThrow("Deployment protection secret is required");
    expect(request).not.toHaveBeenCalled();
  });

  it("reports the HTTP status without exposing a redirect destination", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, {
      status: 302,
      headers: { location: "https://private-marker.invalid/login" }
    }));
    const error = await rejectedError(verifyDeploymentHealth("https://example.vercel.app", "synthetic-secret", request));
    expect(error.message).toBe("Health request returned HTTP 302");
    expect(error.message).not.toContain("private-marker");
  });

  it("reports a non-JSON health response without logging its body", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response("private-body-marker", {
      headers: { "content-type": "text/html" }
    }));
    const error = await rejectedError(verifyDeploymentHealth("https://example.vercel.app", "synthetic-secret", request));
    expect(error.message).toBe("Health response content type was not application/json (present)");
    expect(error.message).not.toContain("private-body-marker");
  });

  it("reports payload mismatch flags without including response values", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ status: "private-status", service: "private-service" }));
    const error = await rejectedError(verifyDeploymentHealth("https://example.vercel.app", "synthetic-secret", request));
    expect(error.message).toBe("Health response payload mismatch (statusOk=false, serviceOk=false, keyCount=2)");
    expect(error.message).not.toContain("private-status");
    expect(error.message).not.toContain("private-service");
  });

  it("reports network error type but not the original error message", async () => {
    const request = vi.fn<typeof fetch>().mockRejectedValue(new Error("private-error-marker"));
    const error = await rejectedError(verifyDeploymentHealth("https://example.vercel.app", "synthetic-secret", request));
    expect(error.message).toBe("Health request failed before receiving a response (Error)");
    expect(error.message).not.toContain("private-error-marker");
  });

  it.each([
    new Response(null, { status: 302, headers: { location: "https://vercel.com/login" } }),
    new Response("Login page", { headers: { "content-type": "text/html" } }),
    Response.json({ status: "ok", service: "other" }),
    Response.json({ status: "ok", service: "diversity-pmt", unexpected: true }),
    Response.json({ status: "error", service: "diversity-pmt" }, { status: 503 })
  ])("rejects redirects, login pages and incorrect service responses", async response => {
    await expect(verifyDeploymentHealth("https://example.vercel.app", "synthetic-secret", vi.fn<typeof fetch>().mockResolvedValue(response))).rejects.toThrow();
  });
});
