import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MailModule } from "../mail/mail.module";
import { OrganizationsModule } from "../organizations/organizations.module";
import { EmployeeOnboardingController } from "./employee-onboarding.controller";
import { EmployeesService } from "./employees.service";
import { MeEmployeeRecordsController } from "./me-employee-records.controller";
import { OrganizationEmployeesController } from "./organization-employees.controller";
import { OrganizationLeaveRequestsController } from "./organization-leave-requests.controller";

@Module({
  imports: [OrganizationsModule, AuthModule, MailModule],
  controllers: [
    OrganizationEmployeesController,
    OrganizationLeaveRequestsController,
    MeEmployeeRecordsController,
    EmployeeOnboardingController,
  ],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
