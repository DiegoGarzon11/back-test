import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service.js';
import type { Transaction } from '../../interfaces/transaction.js';
import type { TransactionRepository } from '../domain/transaction.js';

type CreateTransactionData = Omit<
  Transaction,
  'id' | 'transactionId' | 'wompiReference' | 'failureReason'
>;

type UpdateTransactionResultData = {
  status: Transaction['status'];
  transactionId?: string | null;
  failureReason?: string | null;
};

interface TransactionRecord {
  id: string;
  status: Transaction['status'];
  productId: string;
  customerId: string;
  deliveryId: string;
  productAmount: number;
  baseFee: number;
  deliveryFee: number;
  totalAmount: number;
  transactionId: string | null;
  wompiReference: string | null;
  failureReason: string | null;
}

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTransactionData): Promise<Transaction> {
    const transaction = (await this.prisma.transaction.create({
      data,
    })) as TransactionRecord;

    return this.mapToTransaction(transaction);
  }

  async updateResult(
    id: string,
    data: UpdateTransactionResultData,
  ): Promise<Transaction> {
    const transaction = (await this.prisma.transaction.update({
      where: { id },
      data,
    })) as TransactionRecord;

    return this.mapToTransaction(transaction);
  }

  async findById(id: string): Promise<Transaction | null> {
    const transaction = (await this.prisma.transaction.findUnique({
      where: { id },
    })) as TransactionRecord | null;

    if (!transaction) {
      return null;
    }

    return this.mapToTransaction(transaction);
  }

  private mapToTransaction(transaction: TransactionRecord): Transaction {
    return {
      id: transaction.id,
      status: transaction.status,
      productId: transaction.productId,
      customerId: transaction.customerId,
      deliveryId: transaction.deliveryId,
      productAmount: transaction.productAmount,
      baseFee: transaction.baseFee,
      deliveryFee: transaction.deliveryFee,
      totalAmount: transaction.totalAmount,
      transactionId: transaction.transactionId,
      wompiReference: transaction.wompiReference,
      failureReason: transaction.failureReason,
    };
  }
}
