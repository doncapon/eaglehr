import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateEmployeeInput,
  CreateEmployeeNoteInput,
  EmployeeDocumentType,
  EmployeeQueryInput,
  UpdateEmployeeInput,
} from "@eaglehr/types";
import { Prisma } from "@eaglehr/db";
import { PrismaService } from "../prisma/prisma.service";

const EMPLOYEE_DOCUMENT_SUBDIR = "employee-documents";

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

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
}
