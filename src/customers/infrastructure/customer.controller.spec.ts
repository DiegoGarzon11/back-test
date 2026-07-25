import { CustomerController } from './customer.controller.js';
import { FindOrCreateCustomerUseCase } from '../application/find-or-createcustomer.js';
import { Result } from '../../shared/result.js';
import type { Customer } from '../../interfaces/customer.js';

describe('CustomerController', () => {
  const customer: Customer = {
    id: 'customer-1',
    email: 'prueba@test.com',
    fullName: 'Pedro Pérez',
    phone: '3001234567',
  };

  it('crea o retorna un customer existente', async () => {
    const findOrCreateCustomerUseCase = {
      execute: jest.fn().mockResolvedValue(Result.ok(customer)),
    } as unknown as FindOrCreateCustomerUseCase;

    const controller = new CustomerController(findOrCreateCustomerUseCase);
    const result = await controller.create({
      email: customer.email,
      fullName: customer.fullName,
      phone: customer.phone,
    });

    expect(result).toEqual(customer);
    expect(findOrCreateCustomerUseCase.execute).toHaveBeenCalledWith({
      email: customer.email,
      fullName: customer.fullName,
      phone: customer.phone,
    });
  });
});
