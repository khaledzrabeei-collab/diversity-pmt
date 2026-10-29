import { z } from "zod";
export const projectInput = z.object({
  organizationId: z.uuid(),
  code: z.string().trim().min(2).max(32).regex(/^[A-Z0-9][A-Z0-9_-]+$/, "Use uppercase letters, numbers, hyphens or underscores"),
  name: z.string().trim().min(2).max(160)
});
