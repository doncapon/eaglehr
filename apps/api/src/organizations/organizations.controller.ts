import { Body, Controller, Delete, Get, Param, Patch, Post, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  CreateOrganizationSchema,
  InviteMemberSchema,
  OrganizationDocumentTypeSchema,
  UpdateMemberRoleSchema,
  UpdateOrganizationSchema,
  type CreateOrganizationInput,
  type InviteMemberInput,
  type OrganizationDocumentType,
  type UpdateMemberRoleInput,
  type UpdateOrganizationInput,
} from "@eaglehr/types";
import type { Response } from "express";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { createVerificationUploadOptions, verificationFilePath } from "../common/storage/verification-document-storage";
import { Roles } from "./decorators/roles.decorator";
import { OrganizationMemberGuard } from "./guards/organization-member.guard";
import { RolesGuard } from "./guards/roles.guard";
import { OrganizationsService } from "./organizations.service";

@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(CreateOrganizationSchema)) body: CreateOrganizationInput,
  ) {
    return this.organizationsService.create(user.sub, body);
  }

  @Get()
  listMine(@CurrentUser() user: JwtPayload) {
    return this.organizationsService.listForUser(user.sub);
  }

  @Post("invitations/:token/accept")
  acceptInvitation(@CurrentUser() user: JwtPayload, @Param("token") token: string) {
    return this.organizationsService.acceptInvitation(token, user.sub, user.email);
  }

  @Get(":organizationId")
  @UseGuards(OrganizationMemberGuard)
  findOne(@Param("organizationId") organizationId: string) {
    return this.organizationsService.findOneOrThrow(organizationId);
  }

  @Patch(":organizationId")
  @UseGuards(OrganizationMemberGuard, RolesGuard)
  @Roles("OWNER", "ADMIN")
  update(
    @Param("organizationId") organizationId: string,
    @Body(new ZodValidationPipe(UpdateOrganizationSchema)) body: UpdateOrganizationInput,
  ) {
    return this.organizationsService.update(organizationId, body);
  }

  @Get(":organizationId/members")
  @UseGuards(OrganizationMemberGuard)
  listMembers(@Param("organizationId") organizationId: string) {
    return this.organizationsService.listMembers(organizationId);
  }

  @Patch(":organizationId/members/:memberId")
  @UseGuards(OrganizationMemberGuard, RolesGuard)
  @Roles("OWNER", "ADMIN")
  updateMemberRole(
    @Param("organizationId") organizationId: string,
    @Param("memberId") memberId: string,
    @Body(new ZodValidationPipe(UpdateMemberRoleSchema)) body: UpdateMemberRoleInput,
  ) {
    return this.organizationsService.updateMemberRole(organizationId, memberId, body);
  }

  @Delete(":organizationId/members/:memberId")
  @UseGuards(OrganizationMemberGuard, RolesGuard)
  @Roles("OWNER", "ADMIN")
  removeMember(@Param("organizationId") organizationId: string, @Param("memberId") memberId: string) {
    return this.organizationsService.removeMember(organizationId, memberId);
  }

  @Post(":organizationId/invitations")
  @UseGuards(OrganizationMemberGuard, RolesGuard)
  @Roles("OWNER", "ADMIN")
  invite(
    @CurrentUser() user: JwtPayload,
    @Param("organizationId") organizationId: string,
    @Body(new ZodValidationPipe(InviteMemberSchema)) body: InviteMemberInput,
  ) {
    return this.organizationsService.invite(organizationId, user.sub, body);
  }

  @Get(":organizationId/invitations")
  @UseGuards(OrganizationMemberGuard, RolesGuard)
  @Roles("OWNER", "ADMIN")
  listInvitations(@Param("organizationId") organizationId: string) {
    return this.organizationsService.listInvitations(organizationId);
  }

  @Post(":organizationId/verification/documents/:type")
  @UseGuards(OrganizationMemberGuard, RolesGuard)
  @Roles("OWNER", "ADMIN")
  @UseInterceptors(FileInterceptor("file", createVerificationUploadOptions("org-documents")))
  uploadVerificationDocument(
    @Param("organizationId") organizationId: string,
    @Param("type", new ZodValidationPipe(OrganizationDocumentTypeSchema)) type: OrganizationDocumentType,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.organizationsService.uploadVerificationDocument(organizationId, type, file);
  }

  @Get(":organizationId/verification/documents/:type")
  @UseGuards(OrganizationMemberGuard)
  async downloadVerificationDocument(
    @Param("organizationId") organizationId: string,
    @Param("type", new ZodValidationPipe(OrganizationDocumentTypeSchema)) type: OrganizationDocumentType,
    @Res() res: Response,
  ) {
    const { subdir, filename } = await this.organizationsService.getVerificationDocumentPath(organizationId, type);
    res.download(verificationFilePath(subdir, filename));
  }

  @Post(":organizationId/verification/submit")
  @UseGuards(OrganizationMemberGuard, RolesGuard)
  @Roles("OWNER", "ADMIN")
  submitForVerification(@Param("organizationId") organizationId: string) {
    return this.organizationsService.submitForVerification(organizationId);
  }
}
