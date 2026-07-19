import { z } from "zod";
import { ApplicationStatusSchema } from "./enums";

export const ApplyToJobSchema = z.object({
  coverLetter: z.string().max(5000).optional(),
  expectedSalaryKobo: z.number().int().nonnegative().optional(),
});
export type ApplyToJobInput = z.infer<typeof ApplyToJobSchema>;

export const UpdateApplicationStatusSchema = z.object({
  status: ApplicationStatusSchema,
});
export type UpdateApplicationStatusInput = z.infer<typeof UpdateApplicationStatusSchema>;
