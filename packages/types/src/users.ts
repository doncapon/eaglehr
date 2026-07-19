import { z } from "zod";

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
