export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export interface Transaction {
  id: string;
  status: TransactionStatus;
  productId: string;
  customerId: string;
  deliveryId: string;
  productAmount: number;
  baseFee: number;
  deliveryFee: number;
  totalAmount: number;
  transactionId: string | null;
  reference: string | null;
  failureReason: string | null;
}
