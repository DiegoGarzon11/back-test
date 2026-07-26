import { ProcessPaymentUseCase } from './process-payment.js';
import type { ProductRepository } from '../../products/domain/product.js';
import type { TransactionRepository } from '../domain/transaction.js';
import type { PaymentGateway } from '../domain/payment-gateway.js';
import type { Product } from '../../interfaces/product.js';
import type { Transaction } from '../../interfaces/transaction.js';

describe('ProcessPaymentUseCase', () => {
  const baseInput = {
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

  const product: Product = {
    id: 'product-1',
    name: 'Producto de prueba',
    description: 'Descripción',
    price: 25000000,
    stock: 5,
    imageUrl: null,
  };

  const pendingTransaction: Transaction = {
    id: 'transaction-1',
    status: 'PENDING',
    productId: 'product-1',
    customerId: 'customer-1',
    deliveryId: 'delivery-1',
    productAmount: 25000000,
    baseFee: 500000,
    deliveryFee: 800000,
    totalAmount: 26300000,
    transactionId: null,
    reference: null,
    failureReason: null,
  };

  function buildUseCase(overrides?: {
    productRepository?: Partial<ProductRepository>;
    transactionRepository?: Partial<TransactionRepository>;
    paymentGateway?: Partial<PaymentGateway>;
  }) {
    const productRepository: ProductRepository = {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValue(product),
      decrementStock: jest.fn().mockResolvedValue(undefined),
      ...overrides?.productRepository,
    };

    const transactionRepository: TransactionRepository = {
      create: jest.fn().mockResolvedValue(pendingTransaction),
      updateResult: jest
        .fn()
        .mockImplementation((id, data) =>
          Promise.resolve({ ...pendingTransaction, ...data }),
        ),
      findById: jest.fn(),
      ...overrides?.transactionRepository,
    };

    const paymentGateway: PaymentGateway = {
      chargeCard: jest.fn().mockResolvedValue({
        status: 'APPROVED',
        gatewayTransactionId: 'tx-1',
        failureReason: null,
      }),
      ...overrides?.paymentGateway,
    };

    const useCase = new ProcessPaymentUseCase(
      productRepository,
      transactionRepository,
      paymentGateway,
    );

    return {
      useCase,
      productRepository,
      transactionRepository,
      paymentGateway,
    };
  }

  it('crea la transacción, cobra, y descuenta stock cuando el pago es aprobado', async () => {
    const {
      useCase,
      transactionRepository,
      paymentGateway,
      productRepository,
    } = buildUseCase();

    const result = await useCase.execute(baseInput);

    expect(result.success).toBe(true);
    expect(result.value?.status).toBe('APPROVED');
    expect(transactionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'PENDING', totalAmount: 26300000 }),
    );
    expect(paymentGateway.chargeCard).toHaveBeenCalledWith(
      expect.objectContaining({
        amountInCents: 26300000,
        reference: 'transaction-1',
      }),
    );
    expect(productRepository.decrementStock).toHaveBeenCalledWith(
      'product-1',
      1,
    );
  });

  it('no descuenta stock si el pago es rechazado', async () => {
    const { useCase, productRepository } = buildUseCase({
      paymentGateway: {
        chargeCard: jest.fn().mockResolvedValue({
          status: 'DECLINED',
          gatewayTransactionId: 'tx-2',
          failureReason: 'Fondos insuficientes',
        }),
      },
    });

    const result = await useCase.execute(baseInput);

    expect(result.success).toBe(true);
    expect(result.value?.status).toBe('DECLINED');
    expect(productRepository.decrementStock).not.toHaveBeenCalled();
  });

  it('falla si el producto no existe', async () => {
    const { useCase, transactionRepository, paymentGateway } = buildUseCase({
      productRepository: { findById: jest.fn().mockResolvedValue(null) },
    });

    const result = await useCase.execute(baseInput);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Producto no encontrado');
    expect(transactionRepository.create).not.toHaveBeenCalled();
    expect(paymentGateway.chargeCard).not.toHaveBeenCalled();
  });

  it('falla si no hay stock disponible', async () => {
    const { useCase, transactionRepository } = buildUseCase({
      productRepository: {
        findById: jest.fn().mockResolvedValue({ ...product, stock: 0 }),
      },
    });

    const result = await useCase.execute(baseInput);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Sin stock disponible');
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it('usa el precio real del producto, no un monto manipulado externamente', async () => {
    const { useCase, transactionRepository } = buildUseCase({
      productRepository: {
        findById: jest.fn().mockResolvedValue({ ...product, price: 1 }),
      },
    });

    await useCase.execute(baseInput);

    expect(transactionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        productAmount: 1,
        totalAmount: 1 + 500000 + 800000,
      }),
    );
  });
});
