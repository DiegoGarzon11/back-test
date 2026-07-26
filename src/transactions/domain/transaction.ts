import { Transaction } from '../../interfaces/transaction.js';

export interface TransactionRepository {
  create(
    data: Omit<
      Transaction,
      'id' | 'transactionId' | 'reference' | 'failureReason'
    >,
  ): Promise<Transaction>;
  updateResult(
    id: string,
    data: {
      status: Transaction['status'];
      transactionId?: string | null;
      failureReason?: string | null;
    },
  ): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
}
