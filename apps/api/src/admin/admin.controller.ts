import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { UpdatePlatformSettingsSchema, type UpdatePlatformSettingsInput } from "@eaglehr/types";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { AdminService } from "./admin.service";
import { PlatformAdminGuard } from "./guards/platform-admin.guard";

@Controller("admin/settings")
@UseGuards(PlatformAdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  get() {
    return this.adminService.getSettings();
  }

  @Patch()
  update(@Body(new ZodValidationPipe(UpdatePlatformSettingsSchema)) body: UpdatePlatformSettingsInput) {
    return this.adminService.updateSettings(body);
  }
}
