import { z } from "zod";
import { LeaveRequestStatusSchema, LeaveTypeSchema } from "./enums";

export const CreateLeaveRequestSchema = z
  .object({
    type: LeaveTypeSchema,
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    reason: z.string().max(2000).optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });
export type CreateLeaveRequestInput = z.infer<typeof CreateLeaveRequestSchema>;

export const ReviewLeaveRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewNote: z.string().max(2000).optional(),
});
export type ReviewLeaveRequestInput = z.infer<typeof ReviewLeaveRequestSchema>;

export const LeaveRequestQuerySchema = z.object({
  status: LeaveRequestStatusSchema.optional(),
});
export type LeaveRequestQueryInput = z.infer<typeof LeaveRequestQuerySchema>;
