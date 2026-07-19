import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
  type VerifyEmailInput,
} from "@eaglehr/types";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { Public } from "./decorators/public.decorator";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard";
import type { JwtPayload } from "./strategies/jwt.strategy";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post("register")
  register(@Body(new ZodValidationPipe(RegisterSchema)) body: RegisterInput) {
    return this.authService.register(body);
  }

  @Public()
  @Post("login")
  login(@Body(new ZodValidationPipe(LoginSchema)) body: LoginInput) {
    return this.authService.login(body);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post("refresh")
  refresh(@CurrentUser() user: JwtPayload) {
    return this.authService.refresh(user.sub, user.email);
  }

  @Get("me")
  me(@CurrentUser() user: JwtPayload) {
    return this.usersService.getSafeUser(user.sub);
  }

  @Public()
  @Post("verify-email")
  verifyEmail(@Body(new ZodValidationPipe(VerifyEmailSchema)) body: VerifyEmailInput) {
    return this.authService.verifyEmail(body.token);
  }

  @Post("resend-verification-email")
  resendVerificationEmail(@CurrentUser() user: JwtPayload) {
    return this.authService.resendVerificationEmail(user.sub);
  }

  @Public()
  @Post("forgot-password")
  forgotPassword(@Body(new ZodValidationPipe(ForgotPasswordSchema)) body: ForgotPasswordInput) {
    return this.authService.forgotPassword(body.email);
  }

  @Public()
  @Post("reset-password")
  resetPassword(@Body(new ZodValidationPipe(ResetPasswordSchema)) body: ResetPasswordInput) {
    return this.authService.resetPassword(body.token, body.password);
  }
}
