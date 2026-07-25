// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  {
    name: 'Audífonos inalámbricos',
    description:
      'Audífonos bluetooth con cancelación de ruido, 30h de batería.',
    price: 25000000,
    stock: 15,
    imageUrl: null,
  },
  {
    name: 'Mochila urbana',
    description:
      'Mochila resistente al agua con compartimento para laptop 15".',
    price: 12000000,
    stock: 30,
    imageUrl: null,
  },
  {
    name: 'Reloj inteligente',
    description: 'Smartwatch con monitor de ritmo cardíaco y GPS integrado.',
    price: 45000000,
    stock: 8,
    imageUrl: null,
  },
];

async function main() {
  console.log('Sembrando productos...');

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`${products.length} productos creados.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
