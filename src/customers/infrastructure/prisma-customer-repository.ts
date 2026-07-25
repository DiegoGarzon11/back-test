import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service.js';
import type { Customer } from '../../interfaces/customer.js';
import type { CustomerRepository } from '../../products/domain/customer.js';

interface CustomerRecord {
  id: string;
  email: string;
  fullName: string;
  phone: string;
}

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<Customer | null> {
    const customer = (await this.prisma.customer.findUnique({
      where: { email },
    })) as CustomerRecord | null;

    return customer ? this.mapToCustomer(customer) : null;
  }

  async create(data: Omit<Customer, 'id'>): Promise<Customer> {
    const customer = (await this.prisma.customer.create({
      data,
    })) as CustomerRecord;

    return this.mapToCustomer(customer);
  }

  private mapToCustomer(customer: CustomerRecord): Customer {
    return {
      id: customer.id,
      email: customer.email,
      fullName: customer.fullName,
      phone: customer.phone,
    };
  }
}
