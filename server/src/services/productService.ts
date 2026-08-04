import prisma from "../config/prisma";

export interface ProductQueryFilters {
  categoryId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  page: number;
  limit: number;
}

export type ProductInput = {
  name: string;
  description?: string | null;
  price: number;
  comparePrice?: number | null;
  imageUrl: string;
  stock: number;
  featured?: boolean;
  badge?: string | null;
  categoryId: number;
};

export async function findProducts(filters: ProductQueryFilters) {
  const where: {
    categoryId?: number;
    featured?: boolean;
    OR?: Array<
      | { name: { contains: string; mode: "insensitive" } }
      | { description: { contains: string; mode: "insensitive" } }
    >;
    price?: { gte?: number; lte?: number };
  } = {};

  if (filters.categoryId !== undefined) where.categoryId = filters.categoryId;

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }

  if (filters.featured !== undefined) where.featured = filters.featured;

  const skip = (filters.page - 1) * filters.limit;

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, variants: true },
      skip,
      take: filters.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data,
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(total / filters.limit),
  };
}

export function findProductById(id: number) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true, variants: true },
  });
}

export function findFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { featured: true },
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export function createProduct(data: ProductInput) {
  return prisma.product.create({ data });
}

export function updateProduct(id: number, data: Partial<ProductInput>) {
  return prisma.product.update({
    where: { id },
    data,
  });
}

export function deleteProduct(id: number) {
  return prisma.product.delete({ where: { id } });
}
