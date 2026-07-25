import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../shared/result.js';
import type { Customer } from '../../interfaces/customer.js';
import type { CustomerRepository } from '../../products/domain/customer.js';

interface Input {
  email: string;
  fullName: string;
  phone: string;
}

@Injectable()
export class FindOrCreateCustomerUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(input: Input): Promise<Result<Customer>> {
    const existing = await this.customerRepository.findByEmail(input.email);
    if (existing) {
      return Result.ok(existing);
    }

    const created = await this.customerRepository.create(input);
    return Result.ok(created);
  }
}
