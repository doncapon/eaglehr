import { Controller, Get } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";
import { ApplicationsService } from "./applications.service";

@Controller("me/applications")
export class MeApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  mine(@CurrentUser() user: JwtPayload) {
    return this.applicationsService.myApplications(user.sub);
  }
}
