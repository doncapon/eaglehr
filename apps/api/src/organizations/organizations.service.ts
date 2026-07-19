import { randomBytes } from "node:crypto";
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ORGANIZATION_DOCUMENT_TYPES,
  ORGANIZATION_DOCUMENT_TYPE_LABELS,
  type CompanyQueryInput,
  type CreateOrganizationInput,
  type InviteMemberInput,
  type OrganizationDocumentType,
  type UpdateMemberRoleInput,
  type UpdateOrganizationInput,
} from "@eaglehr/types";
import { slugify } from "../common/utils/slugify";
import { deleteVerificationFile } from "../common/storage/verification-document-storage";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const ORG_DOCUMENT_SUBDIR = "org-documents";

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async create(userId: string, input: CreateOrganizationInput) {
    const baseSlug = slugify(input.name) || "org";
    let slug = baseSlug;
    let suffix = 1;
    while (await this.prisma.organization.findUnique({ where: { slug } })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    return this.prisma.organization.create({
      data: {
        name: input.name,
        slug,
        industry: input.industry,
        size: input.size,
        websiteUrl: input.websiteUrl,
        rcNumber: input.rcNumber,
        members: {
          create: { userId, role: "OWNER" },
        },
      },
      include: { members: true },
    });
  }

  listForUser(userId: string) {
    return this.prisma.organization.findMany({
      where: { members: { some: { userId } } },
      orderBy: { createdAt: "asc" },
    });
  }

  async findOneOrThrow(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: { verificationDocuments: true },
    });
    if (!organization) {
      throw new NotFoundException("Organization not found");
    }
    return organization;
  }

  /** Companies directory — only orgs with at least one published job are worth browsing. */
  /** Lazily flips expired boosts back off — cheap enough to run before every public listing query. */
  private async expireStaleBoosts() {
    await this.prisma.organization.updateMany({
      where: { isBoosted: true, boostExpiresAt: { lt: new Date() } },
      data: { isBoosted: false },
    });
  }

  async publicList(query: CompanyQueryInput) {
    await this.expireStaleBoosts();

    const where = {
      jobs: { some: { status: "PUBLISHED" as const } },
      ...(query.q ? { name: { contains: query.q, mode: "insensitive" as const } } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          industry: true,
          size: true,
          logoUrl: true,
          websiteUrl: true,
          isBoosted: true,
          verificationStatus: true,
          _count: { select: { jobs: { where: { status: "PUBLISHED" } } } },
        },
        orderBy: [{ isBoosted: "desc" }, { name: "asc" }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.organization.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }

  async publicFindBySlug(slug: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        industry: true,
        size: true,
        logoUrl: true,
        websiteUrl: true,
        verificationStatus: true,
        jobs: {
          where: { status: "PUBLISHED" },
          orderBy: [{ isBoosted: "desc" }, { publishedAt: "desc" }],
          select: {
            id: true,
            title: true,
            slug: true,
            employmentType: true,
            workMode: true,
            state: true,
            city: true,
            salaryMinKobo: true,
            salaryMaxKobo: true,
            salaryIsPublic: true,
            isBoosted: true,
          },
        },
      },
    });
    if (!organization) {
      throw new NotFoundException("Company not found");
    }
    return organization;
  }

  async update(organizationId: string, input: UpdateOrganizationInput) {
    await this.findOneOrThrow(organizationId);
    return this.prisma.organization.update({ where: { id: organizationId }, data: input });
  }

  listMembers(organizationId: string) {
    return this.prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { joinedAt: "asc" },
    });
  }

  async updateMemberRole(organizationId: string, memberId: string, input: UpdateMemberRoleInput) {
    const member = await this.prisma.organizationMember.findFirst({ where: { id: memberId, organizationId } });
    if (!member) {
      throw new NotFoundException("Member not found");
    }
    if (member.role === "OWNER" && input.role !== "OWNER") {
      await this.assertNotLastOwner(organizationId, memberId);
    }
    return this.prisma.organizationMember.update({ where: { id: memberId }, data: { role: input.role } });
  }

  async removeMember(organizationId: string, memberId: string) {
    const member = await this.prisma.organizationMember.findFirst({ where: { id: memberId, organizationId } });
    if (!member) {
      throw new NotFoundException("Member not found");
    }
    if (member.role === "OWNER") {
      await this.assertNotLastOwner(organizationId, memberId);
    }
    await this.prisma.organizationMember.delete({ where: { id: memberId } });
    return { success: true };
  }

  private async assertNotLastOwner(organizationId: string, excludeMemberId: string) {
    const ownerCount = await this.prisma.organizationMember.count({
      where: { organizationId, role: "OWNER", id: { not: excludeMemberId } },
    });
    if (ownerCount === 0) {
      throw new ConflictException("Organization must have at least one owner");
    }
  }

  async invite(organizationId: string, invitedByUserId: string, input: InviteMemberInput) {
    const existingMember = await this.prisma.organizationMember.findFirst({
      where: { organizationId, user: { email: input.email } },
    });
    if (existingMember) {
      throw new ConflictException("This user is already a member of the organization");
    }

    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + INVITATION_TTL_MS);

    const [invitation, organization, inviter] = await Promise.all([
      this.prisma.organizationInvitation.create({
        data: {
          organizationId,
          email: input.email,
          role: input.role,
          token,
          invitedByUserId,
          expiresAt,
        },
      }),
      this.prisma.organization.findUniqueOrThrow({ where: { id: organizationId } }),
      this.prisma.user.findUniqueOrThrow({ where: { id: invitedByUserId } }),
    ]);

    const webAppUrl = this.config.get<string>("WEB_APP_URL") ?? "http://localhost:3000";
    await this.mail.sendOrganizationInvitation({
      to: invitation.email,
      organizationName: organization.name,
      inviterName: `${inviter.firstName} ${inviter.lastName}`,
      acceptUrl: `${webAppUrl}/invitations/${invitation.token}`,
    });

    return invitation;
  }

  listInvitations(organizationId: string) {
    return this.prisma.organizationInvitation.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * The invitee must already be authenticated with an account matching the
   * invited email (register/login happens as a separate step first) — this
   * keeps the accept flow a simple, guarded membership upsert rather than an
   * unauthenticated account-creation endpoint.
   */
  async acceptInvitation(token: string, userId: string, userEmail: string) {
    const invitation = await this.prisma.organizationInvitation.findUnique({ where: { token } });
    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }
    if (invitation.status !== "PENDING") {
      throw new ConflictException("Invitation is no longer valid");
    }
    if (invitation.expiresAt < new Date()) {
      await this.prisma.organizationInvitation.update({ where: { token }, data: { status: "EXPIRED" } });
      throw new ConflictException("Invitation has expired");
    }
    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw new ForbiddenException("This invitation was sent to a different email address");
    }

    await this.prisma.$transaction([
      this.prisma.organizationMember.upsert({
        where: { organizationId_userId: { organizationId: invitation.organizationId, userId } },
        create: { organizationId: invitation.organizationId, userId, role: invitation.role },
        update: { role: invitation.role },
      }),
      this.prisma.organizationInvitation.update({ where: { token }, data: { status: "ACCEPTED" } }),
    ]);

    return this.prisma.organization.findUnique({ where: { id: invitation.organizationId } });
  }

  async uploadVerificationDocument(
    organizationId: string,
    type: OrganizationDocumentType,
    file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException("Please upload a file");
    }

    const existing = await this.prisma.organizationVerificationDocument.findUnique({
      where: { organizationId_type: { organizationId, type } },
    });

    const document = await this.prisma.organizationVerificationDocument.upsert({
      where: { organizationId_type: { organizationId, type } },
      create: { organizationId, type, fileUrl: file.filename },
      update: { fileUrl: file.filename, uploadedAt: new Date() },
    });

    if (existing && existing.fileUrl !== file.filename) {
      await deleteVerificationFile(ORG_DOCUMENT_SUBDIR, existing.fileUrl);
    }

    return document;
  }

  async submitForVerification(organizationId: string) {
    const organization = await this.findOneOrThrow(organizationId);
    if (!organization.rcNumber) {
      throw new BadRequestException("Add your CAC/RC registration number before submitting for verification");
    }

    const uploadedTypes = new Set(organization.verificationDocuments.map((document) => document.type));
    const missing = ORGANIZATION_DOCUMENT_TYPES.filter((type) => !uploadedTypes.has(type));
    if (missing.length > 0) {
      const labels = missing.map((type) => ORGANIZATION_DOCUMENT_TYPE_LABELS[type]).join(", ");
      throw new BadRequestException(`Please upload the following documents first: ${labels}`);
    }

    return this.prisma.organization.update({
      where: { id: organizationId },
      data: { verificationStatus: "PENDING", verificationNote: null },
    });
  }

  async getVerificationDocumentPath(organizationId: string, type: OrganizationDocumentType) {
    const document = await this.prisma.organizationVerificationDocument.findUnique({
      where: { organizationId_type: { organizationId, type } },
    });
    if (!document) {
      throw new NotFoundException("Document not found");
    }
    return { subdir: ORG_DOCUMENT_SUBDIR, filename: document.fileUrl };
  }
}
