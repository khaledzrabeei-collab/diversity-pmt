import { describe, expect, it } from "vitest";
import { projectInput } from "../../src/modules/projects/validation";
describe("F-07 project boundary validation", () => {
  const valid = { organizationId: "10000000-0000-4000-8000-000000000001", code: "NGO-001", name: "Health response" };
  it("accepts project identity without inventing module data", () => expect(projectInput.parse(valid)).toEqual(valid));
  it.each([
    { code: "bad code" }, { code: "A" }, { code: "a".repeat(33) },
    { name: " " }, { name: "x".repeat(161) }, { organizationId: "forged" }
  ])("rejects invalid input %j", (change) => expect(projectInput.safeParse({ ...valid, ...change }).success).toBe(false));
  it("strips role and financial data from the create payload", () => {
    expect(projectInput.parse({ ...valid, role: "admin", budget: 999 })).toEqual(valid);
  });
});
