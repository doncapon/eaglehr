import { randomBytes } from "node:crypto";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import type {
  CompleteEmployeeOnboardingInput,
  CreateEmployeeInput,
  CreateEmployeeNoteInput,
  CreateLeaveRequestInput,
  EmployeeDocumentType,
  EmployeePersonalDetailsInput,
  EmployeeQueryInput,
  LeaveRequestQueryInput,
  ReviewLeaveRequestInput,
  UpdateEmployeeInput,
} from "@eaglehr/types";
import { Prisma } from "@eaglehr/db";
import { AuthService } from "../auth/auth.service";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";

const EMPLOYEE_DOCUMENT_SUBDIR = "employee-documents";
const ONBOARDING_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
    private readonly auth: AuthService,
  ) {}

  async findOrgEmployeeOrThrow(organizationId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({ where: { id: employeeId, organizationId } });
    if (!employee) {
      throw new NotFoundException("Employee not found");
    }
    return employee;
  }

  list(organizationId: string, query: EmployeeQueryInput) {
    return this.prisma.employee.findMany({
      where: {
        organizationId,
        ...(query.status ? { status: query.status } : {}),
        ...(query.department ? { department: query.department } : {}),
        ...(query.q
          ? {
              OR: [
                { firstName: { contains: query.q, mode: "insensitive" as const } },
                { lastName: { contains: query.q, mode: "insensitive" as const } },
                { jobTitle: { contains: query.q, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(organizationId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
        documents: { orderBy: { uploadedAt: "desc" } },
        notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { firstName: true, lastName: true } } } },
        leaveRequests: {
          orderBy: { createdAt: "desc" },
          include: {
            requestedBy: { select: { firstName: true, lastName: true } },
            reviewedBy: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
    if (!employee) {
      throw new NotFoundException("Employee not found");
    }
    return employee;
  }

  /** Read-only: resolves what a "convert to employee" form should pre-fill, without creating anything. */
  async prefillFromApplication(organizationId: string, applicationId: string) {
    const application = await this.resolveHiredOrgApplication(organizationId, applicationId);
    const user = application.jobSeekerProfile.user;

    return {
      applicationId: application.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? undefined,
      city: application.jobSeekerProfile.currentCity ?? undefined,
      state: application.jobSeekerProfile.currentState ?? undefined,
      jobTitle: application.job.title,
    };
  }

  private async resolveHiredOrgApplication(organizationId: string, applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true, jobSeekerProfile: { include: { user: true } }, employee: true },
    });
    if (!application || application.job.organizationId !== organizationId) {
      throw new NotFoundException("Application not found");
    }
    if (application.status !== "HIRED") {
      throw new BadRequestException("Only hired applications can be converted to an employee record");
    }
    if (application.employee) {
      throw new ConflictException("This application has already been converted to an employee record");
    }
    return application;
  }

  async create(organizationId: string, input: CreateEmployeeInput) {
    let userId: string | undefined;
    if (input.applicationId) {
      const application = await this.resolveHiredOrgApplication(organizationId, input.applicationId);
      userId = application.jobSeekerProfile.userId;
    }

    try {
      return await this.prisma.employee.create({
        data: { ...input, organizationId, userId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("This application has already been converted to an employee record");
      }
      throw error;
    }
  }

  async update(organizationId: string, employeeId: string, input: UpdateEmployeeInput) {
    await this.findOrgEmployeeOrThrow(organizationId, employeeId);
    return this.prisma.employee.update({ where: { id: employeeId }, data: input });
  }

  async addNote(organizationId: string, employeeId: string, authorUserId: string, input: CreateEmployeeNoteInput) {
    await this.findOrgEmployeeOrThrow(organizationId, employeeId);
    return this.prisma.employeeNote.create({
      data: { employeeId, authorUserId, body: input.body },
    });
  }

  async listNotes(organizationId: string, employeeId: string) {
    await this.findOrgEmployeeOrThrow(organizationId, employeeId);
    return this.prisma.employeeNote.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { firstName: true, lastName: true } } },
    });
  }

  async uploadDocument(
    organizationId: string,
    employeeId: string,
    type: EmployeeDocumentType,
    file: Express.Multer.File | undefined,
  ) {
    await this.findOrgEmployeeOrThrow(organizationId, employeeId);
    if (!file) {
      throw new BadRequestException("Please upload a file");
    }
    return this.prisma.employeeDocument.create({
      data: { employeeId, type, fileUrl: file.filename },
    });
  }

  async listDocuments(organizationId: string, employeeId: string) {
    await this.findOrgEmployeeOrThrow(organizationId, employeeId);
    return this.prisma.employeeDocument.findMany({ where: { employeeId }, orderBy: { uploadedAt: "desc" } });
  }

  async getDocumentPath(organizationId: string, employeeId: string, documentId: string) {
    await this.findOrgEmployeeOrThrow(organizationId, employeeId);
    const document = await this.prisma.employeeDocument.findFirst({ where: { id: documentId, employeeId } });
    if (!document) {
      throw new NotFoundException("Document not found");
    }
    return { subdir: EMPLOYEE_DOCUMENT_SUBDIR, filename: document.fileUrl };
  }

  /** Employee record for a logged-in user, e.g. for self-service leave requests. Not scoped to an organization. */
  async findEmployeeForUserOrThrow(userId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({ where: { id: employeeId, userId } });
    if (!employee) {
      throw new NotFoundException("Employee record not found");
    }
    return employee;
  }

  listMyEmployeeRecords(userId: string) {
    return this.prisma.employee.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { organization: { select: { id: true, name: true } } },
    });
  }

  async updateOwnPersonalDetails(userId: string, employeeId: string, input: EmployeePersonalDetailsInput) {
    await this.findEmployeeForUserOrThrow(userId, employeeId);
    return this.prisma.employee.update({ where: { id: employeeId }, data: input });
  }

  private daysRequestedFor(input: CreateLeaveRequestInput): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((input.endDate.getTime() - input.startDate.getTime()) / msPerDay) + 1;
  }

  createLeaveRequest(employeeId: string, requestedByUserId: string, input: CreateLeaveRequestInput) {
    return this.prisma.leaveRequest.create({
      data: {
        employeeId,
        requestedByUserId,
        type: input.type,
        startDate: input.startDate,
        endDate: input.endDate,
        reason: input.reason,
        daysRequested: this.daysRequestedFor(input),
      },
    });
  }

  listLeaveRequestsForEmployee(employeeId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
      include: {
        requestedBy: { select: { firstName: true, lastName: true } },
        reviewedBy: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async listOrgLeaveRequests(organizationId: string, query: LeaveRequestQueryInput) {
    return this.prisma.leaveRequest.findMany({
      where: {
        employee: { organizationId },
        ...(query.status ? { status: query.status } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        requestedBy: { select: { firstName: true, lastName: true } },
        reviewedBy: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async reviewLeaveRequest(
    organizationId: string,
    employeeId: string,
    leaveRequestId: string,
    reviewerUserId: string,
    input: ReviewLeaveRequestInput,
  ) {
    await this.findOrgEmployeeOrThrow(organizationId, employeeId);
    const leaveRequest = await this.prisma.leaveRequest.findFirst({ where: { id: leaveRequestId, employeeId } });
    if (!leaveRequest) {
      throw new NotFoundException("Leave request not found");
    }
    if (leaveRequest.status !== "PENDING") {
      throw new BadRequestException("Only pending leave requests can be reviewed");
    }
    return this.prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status: input.status,
        reviewedByUserId: reviewerUserId,
        reviewedAt: new Date(),
        reviewNote: input.reviewNote,
      },
    });
  }

  async cancelLeaveRequest(employeeId: string, requestingUserId: string, leaveRequestId: string) {
    const leaveRequest = await this.prisma.leaveRequest.findFirst({ where: { id: leaveRequestId, employeeId } });
    if (!leaveRequest) {
      throw new NotFoundException("Leave request not found");
    }
    if (leaveRequest.requestedByUserId !== requestingUserId) {
      throw new ForbiddenException("You can only cancel your own leave requests");
    }
    if (leaveRequest.status !== "PENDING") {
      throw new BadRequestException("Only pending leave requests can be cancelled");
    }
    return this.prisma.leaveRequest.update({ where: { id: leaveRequestId }, data: { status: "CANCELLED" } });
  }

  /** HR sends a self-service onboarding link so the employee fills in their own
   * personal/sensitive fields, instead of HR guessing or typing them on their behalf. */
  async createOnboardingInvite(organizationId: string, employeeId: string) {
    const employee = await this.findOrgEmployeeOrThrow(organizationId, employeeId);
    if (employee.userId) {
      throw new ConflictException("This employee is already linked to an account");
    }
    if (!employee.email) {
      throw new BadRequestException("Add an email address for this employee before sending an onboarding invite");
    }

    const token = randomBytes(24).toString("hex");
    const onboardingTokenExpiresAt = new Date(Date.now() + ONBOARDING_TTL_MS);
    await this.prisma.employee.update({
      where: { id: employeeId },
      data: { onboardingToken: token, onboardingTokenExpiresAt, onboardingCompletedAt: null },
    });

    const organization = await this.prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
    const webAppUrl = this.config.get<string>("WEB_APP_URL") ?? "http://localhost:3000";
    await this.mail.sendEmployeeOnboardingInvite({
      to: employee.email,
      firstName: employee.firstName,
      organizationName: organization.name,
      onboardingUrl: `${webAppUrl}/employee-onboarding/${token}`,
    });

    return { sent: true };
  }

  private async findByOnboardingTokenOrThrow(token: string) {
    const employee = await this.prisma.employee.findUnique({ where: { onboardingToken: token } });
    if (!employee) {
      throw new NotFoundException("This onboarding link is invalid or has already been used");
    }
    if (employee.onboardingCompletedAt) {
      throw new ConflictException("This onboarding link has already been used");
    }
    if (!employee.onboardingTokenExpiresAt || employee.onboardingTokenExpiresAt < new Date()) {
      throw new BadRequestException("This onboarding link has expired. Ask HR to send a new one");
    }
    return employee;
  }

  async getOnboardingInfo(token: string) {
    const employee = await this.findByOnboardingTokenOrThrow(token);
    const organization = await this.prisma.organization.findUniqueOrThrow({ where: { id: employee.organizationId } });
    return {
      firstName: employee.firstName,
      lastName: employee.lastName,
      jobTitle: employee.jobTitle,
      organizationName: organization.name,
    };
  }

  async completeOnboarding(token: string, input: CompleteEmployeeOnboardingInput) {
    const employee = await this.findByOnboardingTokenOrThrow(token);
    // Guaranteed non-null: createOnboardingInvite refuses to issue a token without one.
    const email = employee.email as string;

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    let userId: string;
    if (existingUser) {
      const passwordMatches = await bcrypt.compare(input.password, existingUser.passwordHash);
      if (!passwordMatches) {
        throw new UnauthorizedException("Incorrect password for the existing account with this email");
      }
      userId = existingUser.id;
    } else {
      const passwordHash = await bcrypt.hash(input.password, 12);
      const newUser = await this.prisma.user.create({
        data: { email, passwordHash, firstName: employee.firstName, lastName: employee.lastName },
      });
      userId = newUser.id;
    }

    await this.prisma.employee.update({
      where: { id: employee.id },
      data: {
        userId,
        phone: input.phone,
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
        maritalStatus: input.maritalStatus,
        addressLine: input.addressLine,
        city: input.city,
        state: input.state,
        emergencyContactName: input.emergencyContactName,
        emergencyContactPhone: input.emergencyContactPhone,
        emergencyContactRelationship: input.emergencyContactRelationship,
        nextOfKinName: input.nextOfKinName,
        nextOfKinPhone: input.nextOfKinPhone,
        nextOfKinRelationship: input.nextOfKinRelationship,
        nextOfKinAddress: input.nextOfKinAddress,
        bankName: input.bankName,
        bankAccountNumber: input.bankAccountNumber,
        bankAccountName: input.bankAccountName,
        taxId: input.taxId,
        onboardingCompletedAt: new Date(),
        onboardingToken: null,
      },
    });

    return this.auth.issueTokensForUser(userId, email);
  }
}
