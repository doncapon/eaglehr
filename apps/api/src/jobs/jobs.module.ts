import { Module } from "@nestjs/common";
import { OrganizationsModule } from "../organizations/organizations.module";
import { JobsPublicController } from "./jobs-public.controller";
import { JobsService } from "./jobs.service";
import { OrganizationJobsController } from "./organization-jobs.controller";

@Module({
  imports: [OrganizationsModule],
  controllers: [JobsPublicController, OrganizationJobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
