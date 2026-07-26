import { Module } from "@nestjs/common";
import { OrganizationsModule } from "../organizations/organizations.module";
import { EmployeesService } from "./employees.service";
import { OrganizationEmployeesController } from "./organization-employees.controller";

@Module({
  imports: [OrganizationsModule],
  controllers: [OrganizationEmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
