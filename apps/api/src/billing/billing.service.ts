import { randomUUID } from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import type { CheckoutInput } from "@eaglehr/types";
import { AdminService } from "../admin/admin.service";
import { PrismaService } from "../prisma/prisma.service";
import { PaystackService } from "./paystack.service";

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
    private readonly admin: AdminService,
  ) {}

  listPlans() {
    return this.prisma.plan.findMany({ where: { isActive: true }, orderBy: { priceKobo: "asc" } });
  }

  getSubscription(organizationId: string) {
    return this.prisma.subscription.findFirst({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      include: { plan: true },
    });
  }

  async checkout(organizationId: string, userEmail: string, input: CheckoutInput) {
    const plan = await this.prisma.plan.findUnique({ where: { id: input.planId } });
    if (!plan || !plan.isActive) {
      throw new NotFoundException("Plan not found");
    }

    const reference = `eaglehr_${randomUUID()}`;
    const result = await this.paystack.initializeTransaction({
      email: userEmail,
      amountKobo: plan.priceKobo,
      reference,
    });

    await this.prisma.payment.create({
      data: {
        organizationId,
        planId: plan.id,
        paystackReference: reference,
        amountKobo: plan.priceKobo,
        purpose: "SUBSCRIPTION",
      },
    });

    return { authorizationUrl: result.authorization_url, reference };
  }

  async checkoutJobBoost(organizationId: string, jobId: string, userEmail: string) {
    const job = await this.prisma.job.findFirst({ where: { id: jobId, organizationId } });
    if (!job) {
      throw new NotFoundException("Job not found");
    }

    const settings = await this.admin.getSettings();
    const reference = `eaglehr_boost_${randomUUID()}`;
    const result = await this.paystack.initializeTransaction({
      email: userEmail,
      amountKobo: settings.boostPriceKobo,
      reference,
    });

    await this.prisma.payment.create({
      data: {
        organizationId,
        jobId,
        paystackReference: reference,
        amountKobo: settings.boostPriceKobo,
        purpose: "JOB_BOOST",
      },
    });

    return { authorizationUrl: result.authorization_url, reference };
  }

  async checkoutCompanyBoost(organizationId: string, userEmail: string) {
    const settings = await this.admin.getSettings();
    const reference = `eaglehr_boost_${randomUUID()}`;
    const result = await this.paystack.initializeTransaction({
      email: userEmail,
      amountKobo: settings.boostPriceKobo,
      reference,
    });

    await this.prisma.payment.create({
      data: {
        organizationId,
        paystackReference: reference,
        amountKobo: settings.boostPriceKobo,
        purpose: "COMPANY_BOOST",
      },
    });

    return { authorizationUrl: result.authorization_url, reference };
  }
}
