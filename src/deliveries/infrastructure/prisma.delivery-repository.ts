import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service.js';
import type { Delivery } from '../../interfaces/delivery.js';
import type { DeliveryRepository } from '../domain/delivery.js';

interface DeliveryRecord {
  id: string;
  customerId: string;
  address: string;
  city: string;
  region: string;
  postalCode: string | null;
}

@Injectable()
export class PrismaDeliveryRepository implements DeliveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<Delivery, 'id'>): Promise<Delivery> {
    const delivery = (await this.prisma.delivery.create({
      data,
    })) as DeliveryRecord;

    return this.mapToDelivery(delivery);
  }

  private mapToDelivery(delivery: DeliveryRecord): Delivery {
    return {
      id: delivery.id,
      customerId: delivery.customerId,
      address: delivery.address,
      city: delivery.city,
      region: delivery.region,
      postalCode: delivery.postalCode,
    };
  }
}
