import { Injectable, NotFoundException } from "@nestjs/common";
import type { OrganizationDocumentType, ReviewVerificationInput, VerificationQueryInput } from "@eaglehr/types";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminVerificationsService {
  constructor(private readonly prisma: PrismaService) {}

  listJobSeekers(query: VerificationQueryInput) {
    return this.prisma.jobSeekerProfile.findMany({
      where: query.status ? { verificationStatus: query.status } : { verificationStatus: { not: "UNVERIFIED" } },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { updatedAt: "desc" },
    });
  }

  async reviewJobSeeker(profileId: string, input: ReviewVerificationInput) {
    const profile = await this.prisma.jobSeekerProfile.findUnique({ where: { id: profileId } });
    if (!profile) {
      throw new NotFoundException("Job seeker profile not found");
    }
    return this.prisma.jobSeekerProfile.update({
      where: { id: profileId },
      data: {
        verificationStatus: input.status,
        verificationNote: input.note ?? null,
        verifiedAt: input.status === "APPROVED" ? new Date() : null,
      },
    });
  }

  async getJobSeekerDocumentPath(profileId: string) {
    const profile = await this.prisma.jobSeekerProfile.findUnique({ where: { id: profileId } });
    if (!profile?.idDocumentUrl) {
      throw new NotFoundException("No verification document on file");
    }
    return { subdir: "id-documents", filename: profile.idDocumentUrl };
  }

  listOrganizations(query: VerificationQueryInput) {
    return this.prisma.organization.findMany({
      where: query.status ? { verificationStatus: query.status } : { verificationStatus: { not: "UNVERIFIED" } },
      include: { verificationDocuments: true },
      orderBy: { updatedAt: "desc" },
    });
  }

  async reviewOrganization(organizationId: string, input: ReviewVerificationInput) {
    const organization = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!organization) {
      throw new NotFoundException("Organization not found");
    }
    return this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        verificationStatus: input.status,
        verificationNote: input.note ?? null,
        verifiedAt: input.status === "APPROVED" ? new Date() : null,
      },
    });
  }

  async getOrganizationDocumentPath(organizationId: string, type: OrganizationDocumentType) {
    const document = await this.prisma.organizationVerificationDocument.findUnique({
      where: { organizationId_type: { organizationId, type } },
    });
    if (!document) {
      throw new NotFoundException("Document not found");
    }
    return { subdir: "org-documents", filename: document.fileUrl };
  }
}
