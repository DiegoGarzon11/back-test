import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../shared/result';
import type { Product } from '../../interfaces/product';
import type { ProductRepository } from '../domain/product';
@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(): Promise<Result<Product[]>> {
    const products = await this.productRepository.findAll();
    return Result.ok(products);
  }
}
