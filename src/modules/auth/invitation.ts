import { z } from "zod";

export const invitationToken = z.string().regex(/^[a-f0-9]{32,128}$/i);
export const passwordInput = z.object({
  password: z.string().min(12).max(128),
  confirmPassword: z.string()
}).refine(value => value.password === value.confirmPassword);
