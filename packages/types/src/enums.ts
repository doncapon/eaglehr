import { z } from "zod";

// Mirrors of the Prisma enums in packages/db/prisma/schema.prisma, kept as
// plain zod enums so the browser bundle (apps/web) never has to import
// @prisma/client just to know what values are valid.

export const ORG_ROLES = ["OWNER", "ADMIN", "RECRUITER"] as const;
export const OrgRoleSchema = z.enum(ORG_ROLES);
export type OrgRole = z.infer<typeof OrgRoleSchema>;

export const ORG_SIZES = ["SIZE_1_10", "SIZE_11_50", "SIZE_51_200", "SIZE_201_500", "SIZE_500_PLUS"] as const;
export const OrgSizeSchema = z.enum(ORG_SIZES);
export type OrgSize = z.infer<typeof OrgSizeSchema>;

export const ORG_SIZE_LABELS: Record<OrgSize, string> = {
  SIZE_1_10: "1-10 employees",
  SIZE_11_50: "11-50 employees",
  SIZE_51_200: "51-200 employees",
  SIZE_201_500: "201-500 employees",
  SIZE_500_PLUS: "500+ employees",
};

export const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "TEMPORARY"] as const;
export const EmploymentTypeSchema = z.enum(EMPLOYMENT_TYPES);
export type EmploymentType = z.infer<typeof EmploymentTypeSchema>;

export const WORK_MODES = ["REMOTE", "ONSITE", "HYBRID"] as const;
export const WorkModeSchema = z.enum(WORK_MODES);
export type WorkMode = z.infer<typeof WorkModeSchema>;

export const JOB_STATUSES = ["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"] as const;
export const JobStatusSchema = z.enum(JOB_STATUSES);
export type JobStatus = z.infer<typeof JobStatusSchema>;

export const APPLICATION_STATUSES = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEWING",
  "OFFERED",
  "HIRED",
  "REJECTED",
  "WITHDRAWN",
] as const;
export const ApplicationStatusSchema = z.enum(APPLICATION_STATUSES);
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;

export const INVITATION_STATUSES = ["PENDING", "ACCEPTED", "EXPIRED", "REVOKED"] as const;
export const InvitationStatusSchema = z.enum(INVITATION_STATUSES);
export type InvitationStatus = z.infer<typeof InvitationStatusSchema>;

export const BILLING_INTERVALS = ["MONTHLY", "ANNUAL"] as const;
export const BillingIntervalSchema = z.enum(BILLING_INTERVALS);
export type BillingInterval = z.infer<typeof BillingIntervalSchema>;

export const SUBSCRIPTION_STATUSES = ["TRIALING", "ACTIVE", "PAST_DUE", "CANCELED", "EXPIRED"] as const;
export const SubscriptionStatusSchema = z.enum(SUBSCRIPTION_STATUSES);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

export const PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILED", "ABANDONED"] as const;
export const PaymentStatusSchema = z.enum(PAYMENT_STATUSES);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const PAYMENT_PURPOSES = ["SUBSCRIPTION", "JOB_BOOST"] as const;
export const PaymentPurposeSchema = z.enum(PAYMENT_PURPOSES);
export type PaymentPurpose = z.infer<typeof PaymentPurposeSchema>;

export const VERIFICATION_STATUSES = ["UNVERIFIED", "PENDING", "APPROVED", "REJECTED"] as const;
export const VerificationStatusSchema = z.enum(VERIFICATION_STATUSES);
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;

export const ORGANIZATION_DOCUMENT_TYPES = ["CAC_CERTIFICATE", "PROOF_OF_ADDRESS", "REPRESENTATIVE_ID"] as const;
export const OrganizationDocumentTypeSchema = z.enum(ORGANIZATION_DOCUMENT_TYPES);
export type OrganizationDocumentType = z.infer<typeof OrganizationDocumentTypeSchema>;

export const ORGANIZATION_DOCUMENT_TYPE_LABELS: Record<OrganizationDocumentType, string> = {
  CAC_CERTIFICATE: "CAC certificate",
  PROOF_OF_ADDRESS: "Proof of address",
  REPRESENTATIVE_ID: "Representative's ID",
};

export const NIGERIA_STATES = [
  "ABIA",
  "ADAMAWA",
  "AKWA_IBOM",
  "ANAMBRA",
  "BAUCHI",
  "BAYELSA",
  "BENUE",
  "BORNO",
  "CROSS_RIVER",
  "DELTA",
  "EBONYI",
  "EDO",
  "EKITI",
  "ENUGU",
  "FCT_ABUJA",
  "GOMBE",
  "IMO",
  "JIGAWA",
  "KADUNA",
  "KANO",
  "KATSINA",
  "KEBBI",
  "KOGI",
  "KWARA",
  "LAGOS",
  "NASARAWA",
  "NIGER",
  "OGUN",
  "ONDO",
  "OSUN",
  "OYO",
  "PLATEAU",
  "RIVERS",
  "SOKOTO",
  "TARABA",
  "YOBE",
  "ZAMFARA",
] as const;
export const NigeriaStateSchema = z.enum(NIGERIA_STATES);
export type NigeriaState = z.infer<typeof NigeriaStateSchema>;

export const NIGERIA_STATE_LABELS: Record<NigeriaState, string> = {
  ABIA: "Abia",
  ADAMAWA: "Adamawa",
  AKWA_IBOM: "Akwa Ibom",
  ANAMBRA: "Anambra",
  BAUCHI: "Bauchi",
  BAYELSA: "Bayelsa",
  BENUE: "Benue",
  BORNO: "Borno",
  CROSS_RIVER: "Cross River",
  DELTA: "Delta",
  EBONYI: "Ebonyi",
  EDO: "Edo",
  EKITI: "Ekiti",
  ENUGU: "Enugu",
  FCT_ABUJA: "FCT (Abuja)",
  GOMBE: "Gombe",
  IMO: "Imo",
  JIGAWA: "Jigawa",
  KADUNA: "Kaduna",
  KANO: "Kano",
  KATSINA: "Katsina",
  KEBBI: "Kebbi",
  KOGI: "Kogi",
  KWARA: "Kwara",
  LAGOS: "Lagos",
  NASARAWA: "Nasarawa",
  NIGER: "Niger",
  OGUN: "Ogun",
  ONDO: "Ondo",
  OSUN: "Osun",
  OYO: "Oyo",
  PLATEAU: "Plateau",
  RIVERS: "Rivers",
  SOKOTO: "Sokoto",
  TARABA: "Taraba",
  YOBE: "Yobe",
  ZAMFARA: "Zamfara",
};
