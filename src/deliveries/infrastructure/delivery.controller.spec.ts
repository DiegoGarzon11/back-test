import { DeliveryController } from './delivery.controller.js';
import { CreateDeliveryUseCase } from '../application/create-delivery.js';
import { Result } from '../../shared/result.js';
import type { Delivery } from '../../interfaces/delivery.js';

describe('DeliveryController', () => {
  const delivery: Delivery = {
    id: 'delivery-1',
    customerId: 'customer-1',
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    region: 'Cundinamarca',
    postalCode: '110111',
  };

  it('crea un delivery', async () => {
    const createDeliveryUseCase = {
      execute: jest.fn().mockResolvedValue(Result.ok(delivery)),
    } as unknown as CreateDeliveryUseCase;

    const controller = new DeliveryController(createDeliveryUseCase);
    const result = await controller.create({
      customerId: delivery.customerId,
      address: delivery.address,
      city: delivery.city,
      region: delivery.region,
      postalCode: delivery.postalCode ?? undefined,
    });

    expect(result).toEqual(delivery);
    expect(createDeliveryUseCase.execute).toHaveBeenCalled();
  });
});
