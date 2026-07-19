import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { UpdateApplicationStatusSchema, type UpdateApplicationStatusInput } from "@eaglehr/types";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { OrganizationMemberGuard } from "../organizations/guards/organization-member.guard";
import { ApplicationsService } from "./applications.service";

@Controller("organizations/:organizationId")
@UseGuards(OrganizationMemberGuard)
export class OrganizationApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get("jobs/:jobId/applications")
  listForJob(@Param("organizationId") organizationId: string, @Param("jobId") jobId: string) {
    return this.applicationsService.listForOrgJob(organizationId, jobId);
  }

  @Patch("applications/:applicationId/status")
  updateStatus(
    @Param("organizationId") organizationId: string,
    @Param("applicationId") applicationId: string,
    @Body(new ZodValidationPipe(UpdateApplicationStatusSchema)) body: UpdateApplicationStatusInput,
  ) {
    return this.applicationsService.updateStatus(organizationId, applicationId, body);
  }
}
