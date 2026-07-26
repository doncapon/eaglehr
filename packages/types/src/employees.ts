import { z } from "zod";
import { EmployeeStatusSchema, EmploymentTypeSchema, GenderSchema, MaritalStatusSchema, NigeriaStateSchema } from "./enums";

export const CreateEmployeeSchema = z.object({
  applicationId: z.string().uuid().optional(),

  // Personal
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: GenderSchema.optional(),
  maritalStatus: MaritalStatusSchema.optional(),
  addressLine: z.string().optional(),
  city: z.string().optional(),
  state: NigeriaStateSchema.optional(),

  // Employment
  employeeNumber: z.string().optional(),
  department: z.string().optional(),
  jobTitle: z.string().min(1),
  employmentType: EmploymentTypeSchema,
  startDate: z.coerce.date(),
  managerId: z.string().uuid().optional(),

  // Emergency contact
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),

  // Next of kin
  nextOfKinName: z.string().optional(),
  nextOfKinPhone: z.string().optional(),
  nextOfKinRelationship: z.string().optional(),
  nextOfKinAddress: z.string().optional(),

  // Bank details (fields only — no payroll processing)
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountName: z.string().optional(),

  // Tax + leave
  taxId: z.string().optional(),
  leaveBalanceDays: z.number().int().min(0).optional(),
});
export type CreateEmployeeInput = z.infer<typeof CreateEmployeeSchema>;

export const UpdateEmployeeSchema = CreateEmployeeSchema.partial().extend({
  status: EmployeeStatusSchema.optional(),
  endDate: z.coerce.date().optional(),
});
export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeSchema>;

export const CreateEmployeeNoteSchema = z.object({
  body: z.string().min(1).max(5000),
});
export type CreateEmployeeNoteInput = z.infer<typeof CreateEmployeeNoteSchema>;

export const EmployeeQuerySchema = z.object({
  q: z.string().optional(),
  department: z.string().optional(),
  status: EmployeeStatusSchema.optional(),
});
export type EmployeeQueryInput = z.infer<typeof EmployeeQuerySchema>;
