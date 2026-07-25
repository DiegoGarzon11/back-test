import { Body, Controller, Post } from '@nestjs/common';
import { FindOrCreateCustomerUseCase } from '../application/find-or-createcustomer.js';
import { CreateCustomerDto } from './create-customer.dto.js';

@Controller('customers')
export class CustomerController {
  constructor(
    private readonly findOrCreateCustomerUseCase: FindOrCreateCustomerUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateCustomerDto) {
    const result = await this.findOrCreateCustomerUseCase.execute(dto);
    return result.value;
  }
}
