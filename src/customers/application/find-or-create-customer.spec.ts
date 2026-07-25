import { FindOrCreateCustomerUseCase } from './find-or-createcustomer.js';
import type { CustomerRepository } from '../domain/customer.js';
import type { Customer } from '../../interfaces/customer.js';

describe('FindOrCreateCustomerUseCase', () => {
  const input = {
    email: 'prueba@test.com',
    fullName: 'Pedro Pérez',
    phone: '3001234567',
  };

  const existingCustomer: Customer = {
    id: 'customer-1',
    ...input,
  };

  it('retorna el customer existente si el email ya está registrado', async () => {
    const customerRepository: CustomerRepository = {
      findByEmail: jest.fn().mockResolvedValue(existingCustomer),
      create: jest.fn(),
    };

    const useCase = new FindOrCreateCustomerUseCase(customerRepository);
    const result = await useCase.execute(input);

    expect(result.success).toBe(true);
    expect(result.value).toEqual(existingCustomer);
    expect(customerRepository.create).not.toHaveBeenCalled();
  });

  it('crea un nuevo customer si el email no existe', async () => {
    const newCustomer: Customer = { id: 'customer-2', ...input };

    const customerRepository: CustomerRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(newCustomer),
    };

    const useCase = new FindOrCreateCustomerUseCase(customerRepository);
    const result = await useCase.execute(input);

    expect(result.success).toBe(true);
    expect(result.value).toEqual(newCustomer);
    expect(customerRepository.create).toHaveBeenCalledWith(input);
  });
});
