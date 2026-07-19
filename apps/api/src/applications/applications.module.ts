import { Module } from "@nestjs/common";
import { OrganizationsModule } from "../organizations/organizations.module";
import { ApplicationsService } from "./applications.service";
import { JobApplicationsController } from "./job-applications.controller";
import { MeApplicationsController } from "./me-applications.controller";
import { OrganizationApplicationsController } from "./organization-applications.controller";

@Module({
  imports: [OrganizationsModule],
  controllers: [JobApplicationsController, MeApplicationsController, OrganizationApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
