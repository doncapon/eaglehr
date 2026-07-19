import { BadRequestException, Controller, Headers, HttpCode, Post, Req, type RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import { Public } from "../auth/decorators/public.decorator";
import { PaystackService } from "./paystack.service";
import { PaystackWebhookService } from "./paystack-webhook.service";

@Controller("webhooks")
export class WebhooksController {
  constructor(
    private readonly paystack: PaystackService,
    private readonly webhookHandler: PaystackWebhookService,
  ) {}

  @Public()
  @Post("paystack")
  @HttpCode(200)
  async handle(@Req() req: RawBodyRequest<Request>, @Headers("x-paystack-signature") signature?: string) {
    const rawBody = req.rawBody;
    if (!rawBody || !this.paystack.verifySignature(rawBody, signature)) {
      throw new BadRequestException("Invalid signature");
    }

    await this.webhookHandler.handleEvent(JSON.parse(rawBody.toString("utf8")));
    return { received: true };
  }
}
