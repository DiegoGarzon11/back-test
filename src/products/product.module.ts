import { Module } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service.js';
import { ProductController } from './infrastructure/product.controller.js';
import { PrismaProductRepository } from './infrastructure/prisma-product.repository.js';
import { GetProductsUseCase } from './application/get-products.js';

@Module({
  controllers: [ProductController],
  providers: [
    PrismaService,
    GetProductsUseCase,
    {
      provide: 'ProductRepository',
      useClass: PrismaProductRepository,
    },
  ],
  exports: ['ProductRepository'],
})
export class ProductsModule {}
