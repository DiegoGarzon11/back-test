import { Module } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service.js';
import { ProductsModule } from '../products/product.module.js';
import { TransactionController } from './infrastructure/transaction.controller.js';
import { PrismaTransactionRepository } from './infrastructure/prisma-transaction.repository.js';
import { WompiPaymentGatewayAdapter } from './infrastructure/wompi-payment-gateway.adapter.js';
import { ProcessPaymentUseCase } from './application/process-payment.js';

@Module({
  imports: [ProductsModule],
  controllers: [TransactionController],
  providers: [
    PrismaService,
    ProcessPaymentUseCase,
    {
      provide: 'TransactionRepository',
      useClass: PrismaTransactionRepository,
    },
    {
      provide: 'PaymentGateway',
      useClass: WompiPaymentGatewayAdapter,
    },
  ],
})
export class TransactionsModule {}
