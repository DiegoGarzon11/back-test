import { Delivery } from '../../interfaces/delivery';

export interface DeliveryRepository {
  create(data: Omit<Delivery, 'id'>): Promise<Delivery>;
}
