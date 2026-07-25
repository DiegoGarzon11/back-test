import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type {
  ChargeCardInput,
  ChargeCardResult,
  PaymentGateway,
} from '../domain/payment-gateway.js';

const WOMPI_SANDBOX_URL = process.env.UAT_SANDBOX_URL!;
const PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY!;
const PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY!;
const INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET!;

@Injectable()
export class WompiPaymentGatewayAdapter implements PaymentGateway {
  async chargeCard(input: ChargeCardInput): Promise<ChargeCardResult> {
    const acceptanceToken = await this.getAcceptanceToken();
    const cardToken = await this.tokenizeCard(input);
    const signature = this.buildIntegritySignature(
      input.reference,
      input.amountInCents,
      input.currency,
    );

    const transaction = await this.createTransaction({
      acceptanceToken,
      cardToken,
      signature,
      input,
    });

    return this.pollUntilFinalStatus(transaction.id);
  }

  private async getAcceptanceToken(): Promise<string> {
    const res = await fetch(`${WOMPI_SANDBOX_URL}/merchants/${PUBLIC_KEY}`);
    const body = (await res.json()) as {
      data: { presigned_acceptance: { acceptance_token: string } };
    };
    return body.data.presigned_acceptance.acceptance_token;
  }

  private async tokenizeCard(input: ChargeCardInput): Promise<string> {
    const res = await fetch(`${WOMPI_SANDBOX_URL}/tokens/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PUBLIC_KEY}`,
      },
      body: JSON.stringify({
        number: input.cardNumber,
        cvc: input.cardCvc,
        exp_month: input.cardExpMonth,
        exp_year: input.cardExpYear,
        card_holder: input.cardHolder,
      }),
    });
    const body = (await res.json()) as { data: { id: string } };
    return body.data.id;
  }

  private buildIntegritySignature(
    reference: string,
    amountInCents: number,
    currency: string,
  ): string {
    const raw = `${reference}${amountInCents}${currency}${INTEGRITY_SECRET}`;
    return createHash('sha256').update(raw).digest('hex');
  }

  private async createTransaction(params: {
    acceptanceToken: string;
    cardToken: string;
    signature: string;
    input: ChargeCardInput;
  }): Promise<{ id: string; status: string }> {
    const { acceptanceToken, cardToken, signature, input } = params;

    const res = await fetch(`${WOMPI_SANDBOX_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PRIVATE_KEY}`,
      },
      body: JSON.stringify({
        acceptance_token: acceptanceToken,
        amount_in_cents: input.amountInCents,
        currency: input.currency,
        customer_email: input.customerEmail,
        reference: input.reference,
        signature,
        payment_method: {
          type: 'CARD',
          token: cardToken,
          installments: 1,
        },
      }),
    });
    const body = (await res.json()) as { data: { id: string; status: string } };
    return body.data;
  }

  private async pollUntilFinalStatus(
    transactionId: string,
  ): Promise<ChargeCardResult> {
    const maxAttempts = 10;
    const delayMs = 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const res = await fetch(
        `${WOMPI_SANDBOX_URL}/transactions/${transactionId}`,
        { headers: { Authorization: `Bearer ${PRIVATE_KEY}` } },
      );
      const body = (await res.json()) as {
        data: { status: string; status_message: string | null };
      };

      if (body.data.status !== 'PENDING') {
        return {
          status: body.data.status === 'APPROVED' ? 'APPROVED' : 'DECLINED',
          gatewayTransactionId: transactionId,
          failureReason: body.data.status_message,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    return {
      status: 'ERROR',
      gatewayTransactionId: transactionId,
      failureReason: 'Timeout esperando confirmación de Wompi',
    };
  }
}
