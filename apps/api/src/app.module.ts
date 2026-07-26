import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AdminModule } from "./admin/admin.module";
import { ApplicationsModule } from "./applications/applications.module";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { BillingModule } from "./billing/billing.module";
import { EmployeesModule } from "./employees/employees.module";
import { HealthController } from "./health/health.controller";
import { JobSeekerProfilesModule } from "./job-seeker-profiles/job-seeker-profiles.module";
import { JobsModule } from "./jobs/jobs.module";
import { OrganizationsModule } from "./organizations/organizations.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    JobSeekerProfilesModule,
    JobsModule,
    ApplicationsModule,
    EmployeesModule,
    BillingModule,
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
