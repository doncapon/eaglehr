import { z } from "zod";
import { EmploymentTypeSchema, NigeriaStateSchema, VerificationStatusSchema, WorkModeSchema } from "./enums";

export const UpdateJobSeekerProfileSchema = z.object({
  headline: z.string().max(200).optional(),
  summary: z.string().max(3000).optional(),
  resumeUrl: z.string().url().optional(),
  yearsOfExperience: z.number().int().nonnegative().optional(),
  currentState: NigeriaStateSchema.optional(),
  currentCity: z.string().optional(),
  desiredEmploymentTypes: z.array(EmploymentTypeSchema).optional(),
  desiredWorkMode: WorkModeSchema.optional(),
  expectedSalaryMinKobo: z.number().int().nonnegative().optional(),
  expectedSalaryMaxKobo: z.number().int().nonnegative().optional(),
  skills: z.array(z.string()).optional(),
  linkedinUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  isOpenToWork: z.boolean().optional(),
});
export type UpdateJobSeekerProfileInput = z.infer<typeof UpdateJobSeekerProfileSchema>;

export const SubmitJobSeekerVerificationSchema = z.object({
  nin: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "NIN must be exactly 11 digits"),
});
export type SubmitJobSeekerVerificationInput = z.infer<typeof SubmitJobSeekerVerificationSchema>;

export const ReviewVerificationSchema = z.object({
  status: VerificationStatusSchema.extract(["APPROVED", "REJECTED"]),
  note: z.string().max(500).optional(),
});
export type ReviewVerificationInput = z.infer<typeof ReviewVerificationSchema>;
