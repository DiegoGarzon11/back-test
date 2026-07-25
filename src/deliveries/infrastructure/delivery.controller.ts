// src/deliveries/infrastructure/delivery.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import { CreateDeliveryUseCase } from '../application/create-delivery.js';
import { CreateDeliveryDto } from './create-delivery.dto.js';

@Controller('deliveries')
export class DeliveryController {
  constructor(private readonly createDeliveryUseCase: CreateDeliveryUseCase) {}

  @Post()
  async create(@Body() dto: CreateDeliveryDto & { customerId: string }) {
    const result = await this.createDeliveryUseCase.execute(dto);
    return result.value;
  }
}
