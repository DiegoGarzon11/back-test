import { ProductController } from './product.controller.js';
import { GetProductsUseCase } from '../application/get-products.js';
import { Result } from '../../shared/result.js';
import type { Product } from '../../interfaces/product.js';

describe('ProductController', () => {
  const products: Product[] = [
    {
      id: 'product-1',
      name: 'Producto A',
      description: 'Descripción',
      price: 10000000,
      stock: 5,
      imageUrl: null,
    },
  ];

  it('retorna la lista de productos', async () => {
    const getProductsUseCase = {
      execute: jest.fn().mockResolvedValue(Result.ok(products)),
    } as unknown as GetProductsUseCase;

    const controller = new ProductController(getProductsUseCase);
    const result = await controller.findAll();

    expect(result).toEqual(products);
    expect(getProductsUseCase.execute).toHaveBeenCalled();
  });
});
