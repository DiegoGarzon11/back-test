import { paymentGatewayAdapter } from './payment-gateway.adapter.js';

describe('paymentGatewayAdapter', () => {
  const chargeInput = {
    amountInCents: 26300000,
    currency: 'COP',
    reference: 'transaction-1',
    cardNumber: '4242424242424242',
    cardExpMonth: '12',
    cardExpYear: '29',
    cardCvc: '123',
    cardHolder: 'Pedro Perez',
    customerEmail: 'test@test.com',
  };

  let fetchMock: jest.Mock;

  beforeEach(() => {
    process.env.PAYMENT_GATEWAY_PUBLIC_KEY = 'pub_test_key';
    process.env.PAYMENT_KEY = 'prv_test_key';
    process.env.INTEGRITY_SECRET = 'integrity_test_secret';

    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('retorna APPROVED cuando  confirma la transacción como aprobada', async () => {
    fetchMock
      // 1. getAcceptanceToken
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            data: {
              presigned_acceptance: { acceptance_token: 'acceptance-123' },
            },
          }),
      })
      // 2. tokenizeCard
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ data: { id: 'tok_test_123' } }),
      })
      // 3. createTransaction
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({ data: { id: 'tx-1', status: 'APPROVED' } }),
      })
      // 4. pollUntilFinalStatus
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            data: { status: 'APPROVED', status_message: null },
          }),
      });

    const adapter = new paymentGatewayAdapter();
    const result = await adapter.chargeCard(chargeInput);

    expect(result.status).toBe('APPROVED');
    expect(result.gatewayTransactionId).toBe('tx-1');
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('retorna DECLINED cuando rechaza la transacción', async () => {
    fetchMock
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            data: {
              presigned_acceptance: { acceptance_token: 'acceptance-123' },
            },
          }),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ data: { id: 'tok_test_123' } }),
      })
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({ data: { id: 'tx-2', status: 'DECLINED' } }),
      })
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            data: {
              status: 'DECLINED',
              status_message: 'Fondos insuficientes',
            },
          }),
      });

    const adapter = new paymentGatewayAdapter();
    const result = await adapter.chargeCard(chargeInput);

    expect(result.status).toBe('DECLINED');
  });

  it('hace polling hasta obtener un estado final si la transacción queda PENDING', async () => {
    fetchMock
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            data: {
              presigned_acceptance: { acceptance_token: 'acceptance-123' },
            },
          }),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ data: { id: 'tok_test_123' } }),
      })
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({ data: { id: 'tx-3', status: 'PENDING' } }),
      })
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            data: { status: 'PENDING', status_message: null },
          }),
      })
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            data: { status: 'APPROVED', status_message: null },
          }),
      });

    const adapter = new paymentGatewayAdapter();
    const result = await adapter.chargeCard(chargeInput);

    expect(result.status).toBe('APPROVED');
    expect(fetchMock).toHaveBeenCalledTimes(5);
  }, 10000);
});
