import { z } from "zod";
import { NigeriaStateSchema, OrgIndustrySchema, OrgRoleSchema, OrgSizeSchema } from "./enums";

export const CreateOrganizationSchema = z.object({
  name: z.string().min(2),
  industry: OrgIndustrySchema.optional(),
  size: OrgSizeSchema.optional(),
  websiteUrl: z.string().url().optional(),
  rcNumber: z.string().optional(),
  addressLine: z.string().optional(),
  city: z.string().optional(),
  state: NigeriaStateSchema.optional(),
  contactPersonName: z.string().optional(),
  contactPersonPhone: z.string().optional(),
  taxId: z.string().optional(),
  foundingYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
});
export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;

export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;

export const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: OrgRoleSchema,
});
export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;

export const UpdateMemberRoleSchema = z.object({
  role: OrgRoleSchema,
});
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;

export const CompanyQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});
export type CompanyQueryInput = z.infer<typeof CompanyQuerySchema>;
