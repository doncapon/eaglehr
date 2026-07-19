  import { z } from "zod";
import { EmploymentTypeSchema, JobStatusSchema, NigeriaStateSchema, WorkModeSchema } from "./enums";

export const CreateJobSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().min(20),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  employmentType: EmploymentTypeSchema,
  workMode: WorkModeSchema,
  state: NigeriaStateSchema,
  city: z.string().min(2),
  salaryMinKobo: z.number().int().nonnegative().optional(),
  salaryMaxKobo: z.number().int().nonnegative().optional(),
  salaryIsPublic: z.boolean().optional(),
  applicationDeadline: z.coerce.date().optional(),
}); 
export type CreateJobInput = z.infer<typeof CreateJobSchema>;

export const UpdateJobSchema = CreateJobSchema.partial();
export type UpdateJobInput = z.infer<typeof UpdateJobSchema>;

// Lets a query param be passed once (?employmentType=A) or repeated
// (?employmentType=A&employmentType=B) and always validates to an array.
function toArray<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((val) => {
    if (val === undefined) return undefined;
    return Array.isArray(val) ? val : [val];
  }, z.array(schema).optional());
}

export const JobQuerySchema = z.object({
  q: z.string().optional(),
  state: NigeriaStateSchema.optional(),
  employmentType: toArray(EmploymentTypeSchema),
  workMode: toArray(WorkModeSchema),
  industry: toArray(z.string()),
  status: JobStatusSchema.optional(),
  minSalaryKobo: z.coerce.number().int().nonnegative().optional(),
  maxSalaryKobo: z.coerce.number().int().nonnegative().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type JobQueryInput = z.infer<typeof JobQuerySchema>;
