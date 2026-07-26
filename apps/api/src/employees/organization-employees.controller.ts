import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  CreateEmployeeNoteSchema,
  CreateEmployeeSchema,
  EmployeeDocumentTypeSchema,
  EmployeeQuerySchema,
  ReviewLeaveRequestSchema,
  UpdateEmployeeSchema,
  type CreateEmployeeInput,
  type CreateEmployeeNoteInput,
  type EmployeeDocumentType,
  type EmployeeQueryInput,
  type ReviewLeaveRequestInput,
  type UpdateEmployeeInput,
} from "@eaglehr/types";
import type { Response } from "express";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { createVerificationUploadOptions, verificationFilePath } from "../common/storage/verification-document-storage";
import { Roles } from "../organizations/decorators/roles.decorator";
import { OrganizationMemberGuard } from "../organizations/guards/organization-member.guard";
import { RolesGuard } from "../organizations/guards/roles.guard";
import { EmployeesService } from "./employees.service";

@Controller("organizations/:organizationId/employees")
@UseGuards(OrganizationMemberGuard)
export class OrganizationEmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  list(
    @Param("organizationId") organizationId: string,
    @Query(new ZodValidationPipe(EmployeeQuerySchema)) query: EmployeeQueryInput,
  ) {
    return this.employeesService.list(organizationId, query);
  }

  @Get("from-application/:applicationId/prefill")
  prefillFromApplication(@Param("organizationId") organizationId: string, @Param("applicationId") applicationId: string) {
    return this.employeesService.prefillFromApplication(organizationId, applicationId);
  }

  @Get(":employeeId")
  findOne(@Param("organizationId") organizationId: string, @Param("employeeId") employeeId: string) {
    return this.employeesService.findOne(organizationId, employeeId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("OWNER", "ADMIN")
  create(
    @Param("organizationId") organizationId: string,
    @Body(new ZodValidationPipe(CreateEmployeeSchema)) body: CreateEmployeeInput,
  ) {
    return this.employeesService.create(organizationId, body);
  }

  @Patch(":employeeId")
  @UseGuards(RolesGuard)
  @Roles("OWNER", "ADMIN")
  update(
    @Param("organizationId") organizationId: string,
    @Param("employeeId") employeeId: string,
    @Body(new ZodValidationPipe(UpdateEmployeeSchema)) body: UpdateEmployeeInput,
  ) {
    return this.employeesService.update(organizationId, employeeId, body);
  }

  @Get(":employeeId/notes")
  listNotes(@Param("organizationId") organizationId: string, @Param("employeeId") employeeId: string) {
    return this.employeesService.listNotes(organizationId, employeeId);
  }

  @Post(":employeeId/notes")
  addNote(
    @CurrentUser() user: JwtPayload,
    @Param("organizationId") organizationId: string,
    @Param("employeeId") employeeId: string,
    @Body(new ZodValidationPipe(CreateEmployeeNoteSchema)) body: CreateEmployeeNoteInput,
  ) {
    return this.employeesService.addNote(organizationId, employeeId, user.sub, body);
  }

  @Get(":employeeId/documents")
  listDocuments(@Param("organizationId") organizationId: string, @Param("employeeId") employeeId: string) {
    return this.employeesService.listDocuments(organizationId, employeeId);
  }

  @Post(":employeeId/documents/:type")
  @UseGuards(RolesGuard)
  @Roles("OWNER", "ADMIN")
  @UseInterceptors(FileInterceptor("file", createVerificationUploadOptions("employee-documents")))
  uploadDocument(
    @Param("organizationId") organizationId: string,
    @Param("employeeId") employeeId: string,
    @Param("type", new ZodValidationPipe(EmployeeDocumentTypeSchema)) type: EmployeeDocumentType,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.employeesService.uploadDocument(organizationId, employeeId, type, file);
  }

  @Get(":employeeId/documents/:documentId/download")
  async downloadDocument(
    @Param("organizationId") organizationId: string,
    @Param("employeeId") employeeId: string,
    @Param("documentId") documentId: string,
    @Res() res: Response,
  ) {
    const { subdir, filename } = await this.employeesService.getDocumentPath(organizationId, employeeId, documentId);
    res.download(verificationFilePath(subdir, filename));
  }

  @Get(":employeeId/leave-requests")
  async listLeaveRequests(@Param("organizationId") organizationId: string, @Param("employeeId") employeeId: string) {
    await this.employeesService.findOrgEmployeeOrThrow(organizationId, employeeId);
    return this.employeesService.listLeaveRequestsForEmployee(employeeId);
  }

  @Patch(":employeeId/leave-requests/:leaveRequestId")
  @UseGuards(RolesGuard)
  @Roles("OWNER", "ADMIN")
  reviewLeaveRequest(
    @CurrentUser() user: JwtPayload,
    @Param("organizationId") organizationId: string,
    @Param("employeeId") employeeId: string,
    @Param("leaveRequestId") leaveRequestId: string,
    @Body(new ZodValidationPipe(ReviewLeaveRequestSchema)) body: ReviewLeaveRequestInput,
  ) {
    return this.employeesService.reviewLeaveRequest(organizationId, employeeId, leaveRequestId, user.sub, body);
  }

  @Post(":employeeId/onboarding-invite")
  @UseGuards(RolesGuard)
  @Roles("OWNER", "ADMIN")
  sendOnboardingInvite(@Param("organizationId") organizationId: string, @Param("employeeId") employeeId: string) {
    return this.employeesService.createOnboardingInvite(organizationId, employeeId);
  }
}
