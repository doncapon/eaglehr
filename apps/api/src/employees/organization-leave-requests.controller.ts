import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { LeaveRequestQuerySchema, type LeaveRequestQueryInput } from "@eaglehr/types";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { OrganizationMemberGuard } from "../organizations/guards/organization-member.guard";
import { EmployeesService } from "./employees.service";

@Controller("organizations/:organizationId/leave-requests")
@UseGuards(OrganizationMemberGuard)
export class OrganizationLeaveRequestsController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  list(
    @Param("organizationId") organizationId: string,
    @Query(new ZodValidationPipe(LeaveRequestQuerySchema)) query: LeaveRequestQueryInput,
  ) {
    return this.employeesService.listOrgLeaveRequests(organizationId, query);
  }
}
