import { Injectable } from "@nestjs/common";
import type { UpdatePlatformSettingsInput } from "@eaglehr/types";
import { PrismaService } from "../prisma/prisma.service";

const SETTINGS_ID = "singleton";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  getSettings() {
    return this.prisma.platformSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID },
      update: {},
    });
  }

  updateSettings(input: UpdatePlatformSettingsInput) {
    return this.prisma.platformSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...input },
      update: input,
    });
  }
}
