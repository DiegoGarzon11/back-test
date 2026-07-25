import { Customer } from '../../interfaces/customer.js';

export interface CustomerRepository {
  findByEmail(email: string): Promise<Customer | null>;
  create(data: Omit<Customer, 'id'>): Promise<Customer>;
}
