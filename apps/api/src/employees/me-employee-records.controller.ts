import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import {
  CreateLeaveRequestSchema,
  EmployeePersonalDetailsSchema,
  type CreateLeaveRequestInput,
  type EmployeePersonalDetailsInput,
} from "@eaglehr/types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { EmployeesService } from "./employees.service";

@Controller("me/employee-records")
export class MeEmployeeRecordsController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  mine(@CurrentUser() user: JwtPayload) {
    return this.employeesService.listMyEmployeeRecords(user.sub);
  }

  @Patch(":employeeId")
  updatePersonalDetails(
    @CurrentUser() user: JwtPayload,
    @Param("employeeId") employeeId: string,
    @Body(new ZodValidationPipe(EmployeePersonalDetailsSchema)) body: EmployeePersonalDetailsInput,
  ) {
    return this.employeesService.updateOwnPersonalDetails(user.sub, employeeId, body);
  }

  @Get(":employeeId/leave-requests")
  async listLeaveRequests(@CurrentUser() user: JwtPayload, @Param("employeeId") employeeId: string) {
    await this.employeesService.findEmployeeForUserOrThrow(user.sub, employeeId);
    return this.employeesService.listLeaveRequestsForEmployee(employeeId);
  }

  @Post(":employeeId/leave-requests")
  async createLeaveRequest(
    @CurrentUser() user: JwtPayload,
    @Param("employeeId") employeeId: string,
    @Body(new ZodValidationPipe(CreateLeaveRequestSchema)) body: CreateLeaveRequestInput,
  ) {
    await this.employeesService.findEmployeeForUserOrThrow(user.sub, employeeId);
    return this.employeesService.createLeaveRequest(employeeId, user.sub, body);
  }

  @Patch(":employeeId/leave-requests/:leaveRequestId/cancel")
  async cancelLeaveRequest(
    @CurrentUser() user: JwtPayload,
    @Param("employeeId") employeeId: string,
    @Param("leaveRequestId") leaveRequestId: string,
  ) {
    await this.employeesService.findEmployeeForUserOrThrow(user.sub, employeeId);
    return this.employeesService.cancelLeaveRequest(employeeId, user.sub, leaveRequestId);
  }
}
