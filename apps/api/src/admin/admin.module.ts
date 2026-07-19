import { Module } from "@nestjs/common";
import { AdminVerificationsController } from "./admin-verifications.controller";
import { AdminVerificationsService } from "./admin-verifications.service";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { PlatformAdminGuard } from "./guards/platform-admin.guard";

@Module({
  controllers: [AdminController, AdminVerificationsController],
  providers: [AdminService, AdminVerificationsService, PlatformAdminGuard],
  exports: [AdminService],
})
export class AdminModule {}
