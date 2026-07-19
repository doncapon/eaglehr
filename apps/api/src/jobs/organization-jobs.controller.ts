import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CreateJobSchema, UpdateJobSchema, type CreateJobInput, type UpdateJobInput } from "@eaglehr/types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { OrganizationMemberGuard } from "../organizations/guards/organization-member.guard";
import { JobsService } from "./jobs.service";

@Controller("organizations/:organizationId/jobs")
@UseGuards(OrganizationMemberGuard)
export class OrganizationJobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Param("organizationId") organizationId: string,
    @Body(new ZodValidationPipe(CreateJobSchema)) body: CreateJobInput,
  ) {
    return this.jobsService.createForOrg(organizationId, user.sub, body);
  }

  @Get()
  list(@Param("organizationId") organizationId: string) {
    return this.jobsService.listForOrg(organizationId);
  }

  @Get(":jobId")
  findOne(@Param("organizationId") organizationId: string, @Param("jobId") jobId: string) {
    return this.jobsService.findOrgJobOrThrow(organizationId, jobId);
  }

  @Patch(":jobId")
  update(
    @Param("organizationId") organizationId: string,
    @Param("jobId") jobId: string,
    @Body(new ZodValidationPipe(UpdateJobSchema)) body: UpdateJobInput,
  ) {
    return this.jobsService.update(organizationId, jobId, body);
  }

  @Delete(":jobId")
  remove(@Param("organizationId") organizationId: string, @Param("jobId") jobId: string) {
    return this.jobsService.remove(organizationId, jobId);
  }

  @Post(":jobId/publish")
  publish(@Param("organizationId") organizationId: string, @Param("jobId") jobId: string) {
    return this.jobsService.publish(organizationId, jobId);
  }
}
