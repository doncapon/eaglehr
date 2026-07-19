import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class OrganizationMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const organizationId = request.params.organizationId as string;
    const userId = request.user?.sub;

    if (!organizationId || !userId) {
      throw new ForbiddenException("Not a member of this organization");
    }

    const member = await this.prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
    });

    if (!member) {
      throw new ForbiddenException("Not a member of this organization");
    }

    request.orgRole = member.role;
    request.orgMember = member;
    return true;
  }
}
