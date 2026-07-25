import { Transaction } from '../../interfaces/transaction.js';

export interface TransactionRepository {
  create(
    data: Omit<
      Transaction,
      'id' | 'wompiTransactionId' | 'wompiReference' | 'failureReason'
    >,
  ): Promise<Transaction>;
  updateResult(
    id: string,
    data: {
      status: Transaction['status'];
      wompiTransactionId?: string | null;
      failureReason?: string | null;
    },
  ): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
}
