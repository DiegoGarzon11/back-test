import { NotFoundException } from '@nestjs/common';
import { TransactionController } from './transaction.controller.js';
import { ProcessPaymentUseCase } from '../application/process-payment.js';
import { Result } from '../../shared/result.js';
import type { TransactionRepository } from '../domain/transaction.js';
import type { Transaction } from '../../interfaces/transaction.js';

describe('TransactionController', () => {
  const transaction: Transaction = {
    id: 'transaction-1',
    status: 'APPROVED',
    productId: 'product-1',
    customerId: 'customer-1',
    deliveryId: 'delivery-1',
    productAmount: 25000000,
    baseFee: 500000,
    deliveryFee: 800000,
    totalAmount: 26300000,
    transactionId: 'tx-1',
    reference: null,
    failureReason: null,
  };

  const paymentInput = {
    productId: 'product-1',
    customerId: 'customer-1',
    customerEmail: 'test@test.com',
    deliveryId: 'delivery-1',
    baseFee: 500000,
    deliveryFee: 800000,
    cardNumber: '4242424242424242',
    cardExpMonth: '12',
    cardExpYear: '29',
    cardCvc: '123',
    cardHolder: 'Pedro Perez',
  };

  it('procesa el pago y retorna la transacción cuando es exitoso', async () => {
    const processPaymentUseCase = {
      execute: jest.fn().mockResolvedValue(Result.ok(transaction)),
    } as unknown as ProcessPaymentUseCase;

    const transactionRepository = {
      findById: jest.fn(),
    } as unknown as TransactionRepository;

    const controller = new TransactionController(
      processPaymentUseCase,
      transactionRepository,
    );

    const result = await controller.processPayment(paymentInput);

    expect(result).toEqual(transaction);
  });

  it('lanza BadRequestException si el pago falla', async () => {
    const processPaymentUseCase = {
      execute: jest.fn().mockResolvedValue(Result.fail('Sin stock disponible')),
    } as unknown as ProcessPaymentUseCase;

    const transactionRepository = {
      findById: jest.fn(),
    } as unknown as TransactionRepository;

    const controller = new TransactionController(
      processPaymentUseCase,
      transactionRepository,
    );

    await expect(controller.processPayment(paymentInput)).rejects.toThrow(
      'Sin stock disponible',
    );
  });

  it('retorna la transacción cuando se consulta por id', async () => {
    const processPaymentUseCase = {
      execute: jest.fn(),
    } as unknown as ProcessPaymentUseCase;

    const transactionRepository = {
      findById: jest.fn().mockResolvedValue(transaction),
    } as unknown as TransactionRepository;

    const controller = new TransactionController(
      processPaymentUseCase,
      transactionRepository,
    );

    const result = await controller.findById('transaction-1');

    expect(result).toEqual(transaction);
  });

  it('lanza NotFoundException si la transacción no existe', async () => {
    const processPaymentUseCase = {
      execute: jest.fn(),
    } as unknown as ProcessPaymentUseCase;

    const transactionRepository = {
      findById: jest.fn().mockResolvedValue(null),
    } as unknown as TransactionRepository;

    const controller = new TransactionController(
      processPaymentUseCase,
      transactionRepository,
    );

    await expect(controller.findById('non-existent')).rejects.toThrow(
      NotFoundException,
    );
  });
});
