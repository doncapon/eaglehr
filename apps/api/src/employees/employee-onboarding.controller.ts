import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CompleteEmployeeOnboardingSchema, type CompleteEmployeeOnboardingInput } from "@eaglehr/types";
import { Public } from "../auth/decorators/public.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { EmployeesService } from "./employees.service";

@Controller("employee-onboarding")
export class EmployeeOnboardingController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Public()
  @Get(":token")
  getInfo(@Param("token") token: string) {
    return this.employeesService.getOnboardingInfo(token);
  }

  @Public()
  @Post(":token/complete")
  complete(
    @Param("token") token: string,
    @Body(new ZodValidationPipe(CompleteEmployeeOnboardingSchema)) body: CompleteEmployeeOnboardingInput,
  ) {
    return this.employeesService.completeOnboarding(token, body);
  }
}
