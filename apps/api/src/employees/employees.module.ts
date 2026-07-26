import { Module } from "@nestjs/common";
import { OrganizationsModule } from "../organizations/organizations.module";
import { EmployeesService } from "./employees.service";
import { MeEmployeeRecordsController } from "./me-employee-records.controller";
import { OrganizationEmployeesController } from "./organization-employees.controller";
import { OrganizationLeaveRequestsController } from "./organization-leave-requests.controller";

@Module({
  imports: [OrganizationsModule],
  controllers: [OrganizationEmployeesController, OrganizationLeaveRequestsController, MeEmployeeRecordsController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
