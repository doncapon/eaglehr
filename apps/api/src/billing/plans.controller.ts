import { Controller, Get } from "@nestjs/common";
import { Public } from "../auth/decorators/public.decorator";
import { BillingService } from "./billing.service";

@Controller("plans")
export class PlansController {
  constructor(private readonly billingService: BillingService) {}

  @Public()
  @Get()
  list() {
    return this.billingService.listPlans();
  }
}
