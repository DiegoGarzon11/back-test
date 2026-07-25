import { Controller, Get } from '@nestjs/common';
import { GetProductsUseCase } from '../application/get-products.js';

@Controller('products')
export class ProductController {
  constructor(private readonly getProductsUseCase: GetProductsUseCase) {}

  @Get()
  async findAll() {
    const result = await this.getProductsUseCase.execute();
    return result.value;
  }
}
