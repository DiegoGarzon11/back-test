import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service.js';
import type { Product } from '../../interfaces/product.js';
import type { ProductRepository } from '../domain/product.js';

interface ProductRecord {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
}

interface UpdateManyResult {
  count: number;
}

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    const products = (await this.prisma.product.findMany()) as ProductRecord[];

    return products.map((product) => this.mapToProduct(product));
  }

  async findById(id: string): Promise<Product | null> {
    const product = (await this.prisma.product.findUnique({
      where: { id },
    })) as ProductRecord | null;

    if (!product) {
      return null;
    }

    return this.mapToProduct(product);
  }

  async decrementStock(productId: string, quantity: number): Promise<void> {
    const result = (await this.prisma.product.updateMany({
      where: {
        id: productId,
        stock: { gte: quantity },
      },
      data: {
        stock: { decrement: quantity },
      },
    })) as UpdateManyResult;

    if (result.count === 0) {
      throw new Error('Stock insuficiente o producto no encontrado');
    }
  }

  private mapToProduct(product: ProductRecord): Product {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
    };
  }
}
