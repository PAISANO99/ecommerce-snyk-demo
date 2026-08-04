import type { Prisma } from "@prisma/client";

export async function decrementProductStock(
  tx: Prisma.TransactionClient,
  productId: number,
  quantity: number
): Promise<boolean> {
  const result = await tx.product.updateMany({
    where: {
      id: productId,
      stock: { gte: quantity },
    },
    data: {
      stock: { decrement: quantity },
    },
  });

  return result.count === 1;
}

export async function incrementProductStock(
  tx: Prisma.TransactionClient,
  productId: number,
  quantity: number
) {
  await tx.product.update({
    where: { id: productId },
    data: {
      stock: { increment: quantity },
    },
  });
}

export async function decrementVariantStock(
  tx: Prisma.TransactionClient,
  variantId: number,
  productId: number,
  quantity: number
): Promise<boolean> {
  const result = await tx.productVariant.updateMany({
    where: {
      id: variantId,
      productId,
      stock: { gte: quantity },
    },
    data: {
      stock: { decrement: quantity },
    },
  });

  return result.count === 1;
}

export async function incrementVariantStock(
  tx: Prisma.TransactionClient,
  variantId: number,
  quantity: number
) {
  await tx.productVariant.update({
    where: { id: variantId },
    data: {
      stock: { increment: quantity },
    },
  });
}
