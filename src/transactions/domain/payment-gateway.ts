export interface ChargeCardInput {
  amountInCents: number;
  currency: string;
  reference: string;
  cardNumber: string;
  cardExpMonth: string;
  cardExpYear: string;
  cardCvc: string;
  cardHolder: string;
  customerEmail: string;
}

export interface ChargeCardResult {
  status: 'APPROVED' | 'DECLINED' | 'ERROR';
  gatewayTransactionId: string;
  failureReason: string | null;
}

export interface PaymentGateway {
  chargeCard(input: ChargeCardInput): Promise<ChargeCardResult>;
}
