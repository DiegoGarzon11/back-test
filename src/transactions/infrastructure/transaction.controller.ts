import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ProcessPaymentUseCase } from '../application/process-payment.js';
import { ProcessPaymentDto } from './process-payment.dto.js';
import type { TransactionRepository } from '../domain/transaction.js';
import { Inject } from '@nestjs/common';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  @Post()
  async processPayment(@Body() dto: ProcessPaymentDto) {
    const result = await this.processPaymentUseCase.execute(dto);

    if (!result.success) {
      throw new BadRequestException(result.error);
    }

    return result.value;
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    return transaction;
  }
}
