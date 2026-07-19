import { Body, Controller, Get, Patch } from "@nestjs/common";
import { UpdateUserSchema, type UpdateUserInput } from "@eaglehr/types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  me(@CurrentUser() user: JwtPayload) {
    return this.usersService.getSafeUser(user.sub);
  }

  @Patch("me")
  update(@CurrentUser() user: JwtPayload, @Body(new ZodValidationPipe(UpdateUserSchema)) body: UpdateUserInput) {
    return this.usersService.updateUser(user.sub, body);
  }
}
