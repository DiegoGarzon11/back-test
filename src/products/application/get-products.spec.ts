import { GetProductsUseCase } from './get-products.js';
import type { ProductRepository } from '../domain/product.js';
import type { Product } from '../../interfaces/product.js';

describe('GetProductsUseCase', () => {
  const products: Product[] = [
    {
      id: 'product-1',
      name: 'Producto A',
      description: 'Descripción A',
      price: 10000000,
      stock: 5,
      imageUrl: null,
    },
    {
      id: 'product-2',
      name: 'Producto B',
      description: 'Descripción B',
      price: 20000000,
      stock: 0,
      imageUrl: null,
    },
  ];

  it('retorna todos los productos del repositorio', async () => {
    const productRepository: ProductRepository = {
      findAll: jest.fn().mockResolvedValue(products),
      findById: jest.fn(),
      decrementStock: jest.fn(),
    };

    const useCase = new GetProductsUseCase(productRepository);
    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.value).toHaveLength(2);
    expect(result.value).toEqual(products);
  });

  it('retorna un array vacío si no hay productos', async () => {
    const productRepository: ProductRepository = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      decrementStock: jest.fn(),
    };

    const useCase = new GetProductsUseCase(productRepository);
    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.value).toEqual([]);
  });
});
