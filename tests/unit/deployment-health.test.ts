import { describe, expect, it, vi } from "vitest";
import { verifyDeploymentHealth } from "../../scripts/verify-deployment-health";

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
    await expect(verifyDeploymentHealth("https://example.vercel.app", "", request)).rejects.toThrow();
    expect(request).not.toHaveBeenCalled();
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
