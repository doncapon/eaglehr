import { randomBytes } from "node:crypto";
import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import type { LoginInput, RegisterInput } from "@eaglehr/types";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  async register(input: RegisterInput) {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      },
    });

    await this.sendVerificationEmail(user.id, user.email, user.firstName);

    return this.issueTokens(user.id, user.email);
  }

  async sendVerificationEmail(userId: string, email: string, firstName: string) {
    // Only one live token per user — clear any previous ones before issuing a new one.
    await this.prisma.emailVerificationToken.deleteMany({ where: { userId } });

    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);
    await this.prisma.emailVerificationToken.create({ data: { userId, token, expiresAt } });

    const webAppUrl = this.config.get<string>("WEB_APP_URL") ?? "http://localhost:3000";
    await this.mail.sendEmailVerification({
      to: email,
      firstName,
      verifyUrl: `${webAppUrl}/verify-email?token=${token}`,
    });
  }

  async resendVerificationEmail(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.isEmailVerified) {
      throw new ConflictException("Your email is already verified");
    }
    await this.sendVerificationEmail(user.id, user.email, user.firstName);
    return { success: true };
  }

  async verifyEmail(token: string) {
    const record = await this.prisma.emailVerificationToken.findUnique({ where: { token } });
    if (!record) {
      throw new BadRequestException("This verification link is invalid or has already been used");
    }
    if (record.expiresAt < new Date()) {
      await this.prisma.emailVerificationToken.delete({ where: { id: record.id } });
      throw new BadRequestException("This verification link has expired. Please request a new one");
    }

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { isEmailVerified: true } }),
      this.prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
    ]);

    return { success: true };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Always return success — don't leak whether an email is registered.
    if (!user) {
      return { success: true };
    }

    await this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
    await this.prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });

    const webAppUrl = this.config.get<string>("WEB_APP_URL") ?? "http://localhost:3000";
    await this.mail.sendPasswordReset({
      to: user.email,
      firstName: user.firstName,
      resetUrl: `${webAppUrl}/reset-password?token=${token}`,
    });

    return { success: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await this.prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record) {
      throw new BadRequestException("This password reset link is invalid or has already been used");
    }
    if (record.expiresAt < new Date()) {
      await this.prisma.passwordResetToken.delete({ where: { id: record.id } });
      throw new BadRequestException("This password reset link has expired. Please request a new one");
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
    ]);

    return { success: true };
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.issueTokens(user.id, user.email);
  }

  async refresh(userId: string, email: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.issueTokens(user.id, email);
  }

  /** Public entry point for other modules (e.g. employee-onboarding completion) that need to
   * log a user in immediately after an action, without duplicating the JWT-signing logic. */
  issueTokensForUser(userId: string, email: string) {
    return this.issueTokens(userId, email);
  }

  private issueTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get<string>("JWT_ACCESS_SECRET"),
      expiresIn: this.config.get<string>("JWT_ACCESS_EXPIRES_IN") ?? "15m",
    });
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.config.get<string>("JWT_REFRESH_EXPIRES_IN") ?? "30d",
    });

    return { accessToken, refreshToken };
  }
}
