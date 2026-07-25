import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../shared/result.js';
import type { Delivery } from '../../interfaces/delivery.js';
import type { DeliveryRepository } from '../domain/delivery.js';

interface Input {
  customerId: string;
  address: string;
  city: string;
  region: string;
  postalCode?: string | null;
}

@Injectable()
export class CreateDeliveryUseCase {
  constructor(
    @Inject('DeliveryRepository')
    private readonly deliveryRepository: DeliveryRepository,
  ) {}

  async execute(input: Input): Promise<Result<Delivery>> {
    const delivery = await this.deliveryRepository.create({
      customerId: input.customerId,
      address: input.address,
      city: input.city,
      region: input.region,
      postalCode: input.postalCode ?? null,
    });

    return Result.ok(delivery);
  }
}
