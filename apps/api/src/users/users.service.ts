import { Injectable, NotFoundException } from "@nestjs/common";
import type { UpdateUserInput } from "@eaglehr/types";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getSafeUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async updateUser(userId: string, input: UpdateUserInput) {
    const user = await this.prisma.user.update({ where: { id: userId }, data: input });
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
