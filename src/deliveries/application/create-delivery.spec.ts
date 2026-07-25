import { CreateDeliveryUseCase } from './create-delivery.js';
import type { DeliveryRepository } from '../domain/delivery.js';
import type { Delivery } from '../../interfaces/delivery.js';

describe('CreateDeliveryUseCase', () => {
  const input = {
    customerId: 'customer-1',
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    region: 'Cundinamarca',
    postalCode: '110111',
  };

  it('crea el delivery con los datos recibidos', async () => {
    const createdDelivery: Delivery = { id: 'delivery-1', ...input };

    const deliveryRepository: DeliveryRepository = {
      create: jest.fn().mockResolvedValue(createdDelivery),
    };

    const useCase = new CreateDeliveryUseCase(deliveryRepository);
    const result = await useCase.execute(input);

    expect(result.success).toBe(true);
    expect(result.value).toEqual(createdDelivery);
    expect(deliveryRepository.create).toHaveBeenCalledWith(input);
  });

  it('usa null como postalCode cuando no se envía', async () => {
    const { postalCode, ...inputWithoutPostalCode } = input;
    const createdDelivery: Delivery = {
      id: 'delivery-2',
      ...inputWithoutPostalCode,
      postalCode: null,
    };

    const deliveryRepository: DeliveryRepository = {
      create: jest.fn().mockResolvedValue(createdDelivery),
    };

    const useCase = new CreateDeliveryUseCase(deliveryRepository);
    const result = await useCase.execute(inputWithoutPostalCode);

    expect(result.success).toBe(true);
    expect(deliveryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ postalCode: null }),
    );
  });
});
