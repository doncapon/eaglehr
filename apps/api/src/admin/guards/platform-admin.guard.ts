import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.sub;
    if (!userId) {
      throw new ForbiddenException("Not authorized");
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isPlatformAdmin) {
      throw new ForbiddenException("Platform admin access required");
    }

    return true;
  }
}
