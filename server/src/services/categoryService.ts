import prisma from "../config/prisma";

export type CategoryInput = {
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
};

export async function findCategories() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return categories.map(({ _count, ...category }) => ({
    ...category,
    productCount: _count.products,
  }));
}

export async function findCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { _count: { select: { products: true } } },
  });

  if (!category) return null;

  const { _count, ...rawCategory } = category;
  return {
    ...rawCategory,
    productCount: _count.products,
  };
}

export async function createCategory(input: CategoryInput) {
  return prisma.category.create({ data: input });
}

export async function updateCategory(id: number, input: Partial<CategoryInput>) {
  return prisma.category.update({
    where: { id },
    data: input,
  });
}

export async function deleteCategory(id: number) {
  return prisma.category.delete({ where: { id } });
}
