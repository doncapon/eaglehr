import { Body, Controller, Param, Post } from "@nestjs/common";
import { ApplyToJobSchema, type ApplyToJobInput } from "@eaglehr/types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { ApplicationsService } from "./applications.service";

@Controller("jobs/:jobId/applications")
export class JobApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  apply(
    @CurrentUser() user: JwtPayload,
    @Param("jobId") jobId: string,
    @Body(new ZodValidationPipe(ApplyToJobSchema)) body: ApplyToJobInput,
  ) {
    return this.applicationsService.apply(jobId, user.sub, body);
  }
}
