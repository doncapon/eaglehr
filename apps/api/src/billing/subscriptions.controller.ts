import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CheckoutSchema, type CheckoutInput } from "@eaglehr/types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { Roles } from "../organizations/decorators/roles.decorator";
import { OrganizationMemberGuard } from "../organizations/guards/organization-member.guard";
import { RolesGuard } from "../organizations/guards/roles.guard";
import { BillingService } from "./billing.service";

@Controller("organizations/:organizationId/billing")
@UseGuards(OrganizationMemberGuard)
export class SubscriptionsController {
  constructor(private readonly billingService: BillingService) {}

  @Get("subscription")
  getSubscription(@Param("organizationId") organizationId: string) {
    return this.billingService.getSubscription(organizationId);
  }

  @Post("checkout")
  @UseGuards(RolesGuard)
  @Roles("OWNER", "ADMIN")
  checkout(
    @CurrentUser() user: JwtPayload,
    @Param("organizationId") organizationId: string,
    @Body(new ZodValidationPipe(CheckoutSchema)) body: CheckoutInput,
  ) {
    return this.billingService.checkout(organizationId, user.email, body);
  }

  @Post("boost-job/:jobId")
  @UseGuards(RolesGuard)
  @Roles("OWNER", "ADMIN")
  boostJob(
    @CurrentUser() user: JwtPayload,
    @Param("organizationId") organizationId: string,
    @Param("jobId") jobId: string,
  ) {
    return this.billingService.checkoutJobBoost(organizationId, jobId, user.email);
  }

  @Post("boost-company")
  @UseGuards(RolesGuard)
  @Roles("OWNER", "ADMIN")
  boostCompany(@CurrentUser() user: JwtPayload, @Param("organizationId") organizationId: string) {
    return this.billingService.checkoutCompanyBoost(organizationId, user.email);
  }
}
