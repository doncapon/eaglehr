import { createHmac } from "node:crypto";
import { HttpService } from "@nestjs/axios";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";

interface InitializeTransactionParams {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl?: string;
}

interface InitializeTransactionResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface VerifyTransactionResult {
  status: string;
  reference: string;
  amount: number;
  id: number;
}

@Injectable()
export class PaystackService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  private get baseUrl(): string {
    return this.config.get<string>("PAYSTACK_BASE_URL") ?? "https://api.paystack.co";
  }

  private get secretKey(): string {
    return this.config.get<string>("PAYSTACK_SECRET_KEY") ?? "";
  }

  async initializeTransaction(params: InitializeTransactionParams): Promise<InitializeTransactionResult> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ data: InitializeTransactionResult }>(
          `${this.baseUrl}/transaction/initialize`,
          {
            email: params.email,
            amount: params.amountKobo,
            reference: params.reference,
            callback_url: params.callbackUrl,
          },
          { headers: { Authorization: `Bearer ${this.secretKey}` } },
        ),
      );
      return response.data.data;
    } catch {
      throw new InternalServerErrorException("Failed to initialize Paystack transaction");
    }
  }

  async verifyTransaction(reference: string): Promise<VerifyTransactionResult> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ data: VerifyTransactionResult }>(
          `${this.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`,
          { headers: { Authorization: `Bearer ${this.secretKey}` } },
        ),
      );
      return response.data.data;
    } catch {
      throw new InternalServerErrorException("Failed to verify Paystack transaction");
    }
  }

  /** Verifies the x-paystack-signature header against the raw request body. */
  verifySignature(rawBody: Buffer, signature: string | undefined): boolean {
    if (!signature) {
      return false;
    }
    const hash = createHmac("sha512", this.secretKey).update(rawBody).digest("hex");
    return hash === signature;
  }
}
