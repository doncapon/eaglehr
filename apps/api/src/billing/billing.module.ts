import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { AdminModule } from "../admin/admin.module";
import { OrganizationsModule } from "../organizations/organizations.module";
import { BillingService } from "./billing.service";
import { PaystackWebhookService } from "./paystack-webhook.service";
import { PaystackService } from "./paystack.service";
import { PlansController } from "./plans.controller";
import { SubscriptionsController } from "./subscriptions.controller";
import { WebhooksController } from "./webhooks.controller";

@Module({
  imports: [HttpModule, OrganizationsModule, AdminModule],
  controllers: [PlansController, SubscriptionsController, WebhooksController],
  providers: [BillingService, PaystackService, PaystackWebhookService],
})
export class BillingModule {}
