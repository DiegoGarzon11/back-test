import { Product } from '../../interfaces/product.js';

export interface ProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  decrementStock(productId: string, quantity: number): Promise<void>;
}
