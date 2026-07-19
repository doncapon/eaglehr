import { Module } from "@nestjs/common";
import { MailModule } from "../mail/mail.module";
import { OrganizationMemberGuard } from "./guards/organization-member.guard";
import { RolesGuard } from "./guards/roles.guard";
import { OrganizationsController } from "./organizations.controller";
import { OrganizationsService } from "./organizations.service";
import { PublicCompaniesController } from "./public-companies.controller";

@Module({
  imports: [MailModule],
  controllers: [OrganizationsController, PublicCompaniesController],
  providers: [OrganizationsService, OrganizationMemberGuard, RolesGuard],
  exports: [OrganizationsService, OrganizationMemberGuard, RolesGuard],
})
export class OrganizationsModule {}
