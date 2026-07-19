import { z } from "zod";
import { VerificationStatusSchema } from "./enums";

export const UpdatePlatformSettingsSchema = z.object({
  boostPriceKobo: z.number().int().positive().optional(),
  boostDurationDays: z.number().int().positive().optional(),
});
export type UpdatePlatformSettingsInput = z.infer<typeof UpdatePlatformSettingsSchema>;

export const VerificationQuerySchema = z.object({
  status: VerificationStatusSchema.optional(),
});
export type VerificationQueryInput = z.infer<typeof VerificationQuerySchema>;
