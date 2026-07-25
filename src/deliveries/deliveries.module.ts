import { Module } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service.js';
import { PrismaDeliveryRepository } from './infrastructure/prisma.delivery-repository.js';
import { CreateDeliveryUseCase } from './application/create-delivery.js';
import { DeliveryController } from './infrastructure/delivery.controller.js';

@Module({
  controllers: [DeliveryController],
  providers: [
    PrismaService,
    CreateDeliveryUseCase,
    {
      provide: 'DeliveryRepository',
      useClass: PrismaDeliveryRepository,
    },
  ],
  exports: [CreateDeliveryUseCase],
})
export class DeliveriesModule {}
