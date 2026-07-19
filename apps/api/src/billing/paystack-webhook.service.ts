import { Injectable } from "@nestjs/common";
import type { Prisma } from "@eaglehr/db";
import { AdminService } from "../admin/admin.service";
import { PrismaService } from "../prisma/prisma.service";
import { PaystackService } from "./paystack.service";

const MONTHLY_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;
const ANNUAL_PERIOD_MS = 365 * 24 * 60 * 60 * 1000;

interface PaystackChargeSuccessEvent {
  event: string;
  data: { reference: string };
}

function toJson(event: PaystackChargeSuccessEvent): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(event)) as Prisma.InputJsonValue;
}

@Injectable()
export class PaystackWebhookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
    private readonly admin: AdminService,
  ) {}

  async handleEvent(event: PaystackChargeSuccessEvent): Promise<void> {
    if (event.event !== "charge.success") {
      return;
    }

    const reference = event.data.reference;
    const payment = await this.prisma.payment.findUnique({ where: { paystackReference: reference } });
    if (!payment || payment.status === "SUCCESS") {
      // Unknown reference, or already processed by a prior webhook retry (idempotency guard).
      return;
    }

    const verified = await this.paystack.verifyTransaction(reference);
    if (verified.status !== "success") {
      await this.prisma.payment.update({
        where: { paystackReference: reference },
        data: { status: "FAILED", rawWebhookPayload: toJson(event) },
      });
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      let subscriptionId: string | undefined;

      if (payment.purpose === "SUBSCRIPTION" && payment.planId) {
        const plan = await tx.plan.findUniqueOrThrow({ where: { id: payment.planId } });
        const periodMs = plan.billingInterval === "ANNUAL" ? ANNUAL_PERIOD_MS : MONTHLY_PERIOD_MS;
        const currentPeriodEnd = new Date(Date.now() + periodMs);

        const existingSubscription = await tx.subscription.findFirst({
          where: { organizationId: payment.organizationId },
        });

        const subscription = existingSubscription
          ? await tx.subscription.update({
              where: { id: existingSubscription.id },
              data: {
                planId: plan.id,
                status: "ACTIVE",
                currentPeriodStart: new Date(),
                currentPeriodEnd,
              },
            })
          : await tx.subscription.create({
              data: {
                organizationId: payment.organizationId,
                planId: plan.id,
                status: "ACTIVE",
                currentPeriodStart: new Date(),
                currentPeriodEnd,
              },
            });

        subscriptionId = subscription.id;
      }

      if (payment.purpose === "JOB_BOOST" && payment.jobId) {
        const settings = await this.admin.getSettings();
        const boostExpiresAt = new Date(Date.now() + settings.boostDurationDays * 24 * 60 * 60 * 1000);
        await tx.job.update({ where: { id: payment.jobId }, data: { isBoosted: true, boostExpiresAt } });
      }

      if (payment.purpose === "COMPANY_BOOST") {
        const settings = await this.admin.getSettings();
        const boostExpiresAt = new Date(Date.now() + settings.boostDurationDays * 24 * 60 * 60 * 1000);
        await tx.organization.update({
          where: { id: payment.organizationId },
          data: { isBoosted: true, boostExpiresAt },
        });
      }

      await tx.payment.update({
        where: { paystackReference: reference },
        data: {
          status: "SUCCESS",
          paidAt: new Date(),
          paystackTransactionId: BigInt(verified.id),
          rawWebhookPayload: toJson(event),
          ...(subscriptionId ? { subscriptionId } : {}),
        },
      });
    });
  }
}
