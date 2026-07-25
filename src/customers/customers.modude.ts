import { Module } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service.js';
import { CustomerController } from './infrastructure/customer.controller.js';
import { PrismaCustomerRepository } from './infrastructure/prisma-customer-repository.js';
import { FindOrCreateCustomerUseCase } from './application/find-or-createcustomer.js';

@Module({
  controllers: [CustomerController],
  providers: [
    PrismaService,
    FindOrCreateCustomerUseCase,
    {
      provide: 'CustomerRepository',
      useClass: PrismaCustomerRepository,
    },
  ],
  exports: [FindOrCreateCustomerUseCase],
})
export class CustomersModule {}
