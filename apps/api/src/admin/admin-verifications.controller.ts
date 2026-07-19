import { Body, Controller, Get, Param, Patch, Query, Res, UseGuards } from "@nestjs/common";
import {
  OrganizationDocumentTypeSchema,
  ReviewVerificationSchema,
  VerificationQuerySchema,
  type OrganizationDocumentType,
  type ReviewVerificationInput,
  type VerificationQueryInput,
} from "@eaglehr/types";
import type { Response } from "express";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { verificationFilePath } from "../common/storage/verification-document-storage";
import { AdminVerificationsService } from "./admin-verifications.service";
import { PlatformAdminGuard } from "./guards/platform-admin.guard";

@Controller("admin/verifications")
@UseGuards(PlatformAdminGuard)
export class AdminVerificationsController {
  constructor(private readonly verificationsService: AdminVerificationsService) {}

  @Get("job-seekers")
  listJobSeekers(@Query(new ZodValidationPipe(VerificationQuerySchema)) query: VerificationQueryInput) {
    return this.verificationsService.listJobSeekers(query);
  }

  @Patch("job-seekers/:profileId")
  reviewJobSeeker(
    @Param("profileId") profileId: string,
    @Body(new ZodValidationPipe(ReviewVerificationSchema)) body: ReviewVerificationInput,
  ) {
    return this.verificationsService.reviewJobSeeker(profileId, body);
  }

  @Get("job-seekers/:profileId/document")
  async downloadJobSeekerDocument(@Param("profileId") profileId: string, @Res() res: Response) {
    const { subdir, filename } = await this.verificationsService.getJobSeekerDocumentPath(profileId);
    res.download(verificationFilePath(subdir, filename));
  }

  @Get("organizations")
  listOrganizations(@Query(new ZodValidationPipe(VerificationQuerySchema)) query: VerificationQueryInput) {
    return this.verificationsService.listOrganizations(query);
  }

  @Patch("organizations/:organizationId")
  reviewOrganization(
    @Param("organizationId") organizationId: string,
    @Body(new ZodValidationPipe(ReviewVerificationSchema)) body: ReviewVerificationInput,
  ) {
    return this.verificationsService.reviewOrganization(organizationId, body);
  }

  @Get("organizations/:organizationId/documents/:type")
  async downloadOrganizationDocument(
    @Param("organizationId") organizationId: string,
    @Param("type", new ZodValidationPipe(OrganizationDocumentTypeSchema)) type: OrganizationDocumentType,
    @Res() res: Response,
  ) {
    const { subdir, filename } = await this.verificationsService.getOrganizationDocumentPath(organizationId, type);
    res.download(verificationFilePath(subdir, filename));
  }
}
