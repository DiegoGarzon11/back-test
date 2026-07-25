import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../shared/result.js';
import type { Transaction } from '../../interfaces/transaction.js';
import type { TransactionRepository } from '../domain/transaction.js';
import type { PaymentGateway } from '../domain/payment-gateway.js';
import type { ProductRepository } from '../../products/domain/product.js';

interface Input {
  productId: string;
  customerId: string;
  customerEmail: string;
  deliveryId: string;
  baseFee: number;
  deliveryFee: number;
  cardNumber: string;
  cardExpMonth: string;
  cardExpYear: string;
  cardCvc: string;
  cardHolder: string;
}

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
    @Inject('PaymentGateway')
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(input: Input): Promise<Result<Transaction>> {
    const product = await this.productRepository.findById(input.productId);

    if (!product) {
      return Result.fail('Producto no encontrado');
    }

    if (product.stock < 1) {
      return Result.fail('Sin stock disponible');
    }

    const productAmount = product.price;
    const totalAmount = productAmount + input.baseFee + input.deliveryFee;

    const pendingTransaction = await this.transactionRepository.create({
      status: 'PENDING',
      productId: input.productId,
      customerId: input.customerId,
      deliveryId: input.deliveryId,
      productAmount,
      baseFee: input.baseFee,
      deliveryFee: input.deliveryFee,
      totalAmount,
    });

    const chargeResult = await this.paymentGateway.chargeCard({
      amountInCents: totalAmount,
      currency: 'COP',
      reference: pendingTransaction.id,
      cardNumber: input.cardNumber,
      cardExpMonth: input.cardExpMonth,
      cardExpYear: input.cardExpYear,
      cardCvc: input.cardCvc,
      cardHolder: input.cardHolder,
      customerEmail: input.customerEmail,
    });

    const updatedTransaction = await this.transactionRepository.updateResult(
      pendingTransaction.id,
      {
        status: chargeResult.status,
        transactionId: chargeResult.gatewayTransactionId,
        failureReason: chargeResult.failureReason,
      },
    );

    if (chargeResult.status === 'APPROVED') {
      await this.productRepository.decrementStock(input.productId, 1);
    }

    return Result.ok(updatedTransaction);
  }
}
