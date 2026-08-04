import { Prisma } from "@prisma/client";
import { Router } from "express";
import prisma from "../config/prisma";
import type { AuthenticatedRequest } from "../middlewares";
import { validateRequest, validationSchemas } from "../middlewares";
import {
  decrementProductStock,
  decrementVariantStock,
  incrementProductStock,
  incrementVariantStock,
} from "../services/inventoryService";

const router = Router();

const CART_ERROR = {
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  VARIANT_NOT_FOUND: "VARIANT_NOT_FOUND",
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  ITEM_NOT_FOUND: "ITEM_NOT_FOUND",
  ITEM_CONFLICT: "ITEM_CONFLICT",
} as const;

class CartError extends Error {
  constructor(public readonly code: (typeof CART_ERROR)[keyof typeof CART_ERROR]) {
    super(code);
  }
}

function isCartError(error: unknown, code: (typeof CART_ERROR)[keyof typeof CART_ERROR]) {
  return error instanceof CartError && error.code === code;
}

function parseUserId(req: AuthenticatedRequest): number | null {
  const raw = req.userId ?? req.user?.id;
  if (!raw) return null;

  const userId = Number(raw);
  return Number.isNaN(userId) ? null : userId;
}

async function ensureUserCart(userId: number) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId, total: 0 },
  });
}

function buildLineKey(params: {
  productId: number;
  variantId?: number | null;
  color?: string | null;
  size?: string | null;
}) {
  return [
    params.productId,
    params.variantId ?? "no-variant",
    (params.color ?? "").trim().toLowerCase() || "no-color",
    (params.size ?? "").trim().toLowerCase() || "no-size",
  ].join("::");
}

async function recalculateCartTotal(cartId: number) {
  const aggregate = await prisma.cartItem.aggregate({
    where: { cartId },
    _sum: { subtotal: true },
  });

  const total = aggregate._sum.subtotal ?? 0;
  await prisma.cart.update({ where: { id: cartId }, data: { total } });
  return total;
}

async function getCartResponse(cartId: number) {
  return prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
        include: {
          product: { include: { category: true } },
          variant: true,
        },
      },
    },
  });
}

router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const userId = parseUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, error: "Usuario no autenticado" });
      return;
    }

    const cart = await ensureUserCart(userId);
    const response = await getCartResponse(cart.id);

    res.json({ success: true, data: response });
  } catch (error: unknown) {
    console.error("[cart:get]", error);
    res.status(500).json({ success: false, error: "Error al obtener carrito" });
  }
});

router.post(
  "/items",
  validateRequest(validationSchemas.cart.addItem),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = parseUserId(req);
      if (!userId) {
        res.status(401).json({ success: false, error: "Usuario no autenticado" });
        return;
      }

      const { productId, quantity, variantId, color, size } = req.body as {
        productId: number;
        quantity: number;
        variantId?: number | null;
        color?: string | null;
        size?: string | null;
      };

      const cart = await ensureUserCart(userId);

      await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: productId },
          select: { id: true, price: true },
        });

        if (!product) {
          throw new CartError(CART_ERROR.PRODUCT_NOT_FOUND);
        }

        let unitPrice = product.price;

        if (variantId) {
          const variant = await tx.productVariant.findFirst({
            where: { id: variantId, productId },
            select: { id: true, productId: true, price: true },
          });

          if (!variant) {
            throw new CartError(CART_ERROR.VARIANT_NOT_FOUND);
          }

          const reserved = await decrementVariantStock(tx, variant.id, productId, quantity);
          if (!reserved) {
            throw new CartError(CART_ERROR.INSUFFICIENT_STOCK);
          }

          unitPrice = variant.price;
        } else {
          const reserved = await decrementProductStock(tx, productId, quantity);
          if (!reserved) {
            throw new CartError(CART_ERROR.INSUFFICIENT_STOCK);
          }
        }

        const lineKey = buildLineKey({ productId, variantId, color, size });
        const upserted = await tx.cartItem.upsert({
          where: { cartId_lineKey: { cartId: cart.id, lineKey } },
          update: {
            quantity: { increment: quantity },
            unitPrice,
            subtotal: { increment: quantity * unitPrice },
            color,
            size,
          },
          create: {
            cartId: cart.id,
            productId,
            variantId: variantId ?? null,
            lineKey,
            color,
            size,
            quantity,
            unitPrice,
            subtotal: quantity * unitPrice,
          },
        });

        const expectedSubtotal = upserted.quantity * unitPrice;
        if (upserted.subtotal !== expectedSubtotal) {
          await tx.cartItem.update({
            where: { id: upserted.id },
            data: { subtotal: expectedSubtotal },
          });
        }
      });

      await recalculateCartTotal(cart.id);
      const response = await getCartResponse(cart.id);
      res.status(201).json({ success: true, data: response });
    } catch (error: unknown) {
      if (isCartError(error, CART_ERROR.PRODUCT_NOT_FOUND)) {
        res.status(404).json({ success: false, error: "Producto no encontrado" });
        return;
      }

      if (isCartError(error, CART_ERROR.VARIANT_NOT_FOUND)) {
        res.status(404).json({ success: false, error: "Variante no encontrada" });
        return;
      }

      if (isCartError(error, CART_ERROR.INSUFFICIENT_STOCK)) {
        res.status(400).json({ success: false, error: "Stock insuficiente" });
        return;
      }

      console.error("[cart:add-item]", error);
      res.status(500).json({ success: false, error: "Error al agregar ítem al carrito" });
    }
  }
);

router.patch(
  "/items/:id",
  validateRequest(validationSchemas.cart.updateItem),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = parseUserId(req);
      if (!userId) {
        res.status(401).json({ success: false, error: "Usuario no autenticado" });
        return;
      }

      const itemId = Number(req.params.id);
      const { quantity } = req.body as { quantity: number };
      const cart = await ensureUserCart(userId);

      await prisma.$transaction(async (tx) => {
        const existingItem = await tx.cartItem.findFirst({
          where: { id: itemId, cartId: cart.id },
          select: {
            id: true,
            productId: true,
            variantId: true,
            quantity: true,
            unitPrice: true,
          },
        });

        if (!existingItem) {
          throw new CartError(CART_ERROR.ITEM_NOT_FOUND);
        }

        const delta = quantity - existingItem.quantity;

        if (delta > 0) {
          if (existingItem.variantId) {
            const reserved = await decrementVariantStock(
              tx,
              existingItem.variantId,
              existingItem.productId,
              delta
            );

            if (!reserved) {
              throw new CartError(CART_ERROR.INSUFFICIENT_STOCK);
            }
          } else {
            const reserved = await decrementProductStock(tx, existingItem.productId, delta);
            if (!reserved) {
              throw new CartError(CART_ERROR.INSUFFICIENT_STOCK);
            }
          }
        }

        if (delta < 0) {
          const toRestore = Math.abs(delta);

          if (existingItem.variantId) {
            await incrementVariantStock(tx, existingItem.variantId, toRestore);
          } else {
            await incrementProductStock(tx, existingItem.productId, toRestore);
          }
        }

        const updatedItem = await tx.cartItem.updateMany({
          where: {
            id: existingItem.id,
            cartId: cart.id,
            quantity: existingItem.quantity,
          },
          data: {
            quantity,
            subtotal: quantity * existingItem.unitPrice,
          },
        });

        if (updatedItem.count !== 1) {
          throw new CartError(CART_ERROR.ITEM_CONFLICT);
        }
      });

      await recalculateCartTotal(cart.id);
      const response = await getCartResponse(cart.id);
      res.json({ success: true, data: response });
    } catch (error: unknown) {
      if (isCartError(error, CART_ERROR.ITEM_NOT_FOUND)) {
        res.status(404).json({ success: false, error: "Ítem no encontrado" });
        return;
      }

      if (isCartError(error, CART_ERROR.INSUFFICIENT_STOCK)) {
        res.status(400).json({ success: false, error: "Stock insuficiente" });
        return;
      }

      if (isCartError(error, CART_ERROR.ITEM_CONFLICT)) {
        res.status(409).json({ success: false, error: "El carrito cambió, reintenta la operación" });
        return;
      }

      console.error("[cart:update-item]", error);
      res.status(500).json({ success: false, error: "Error al actualizar ítem" });
    }
  }
);

router.delete(
  "/items/:id",
  validateRequest(validationSchemas.cart.deleteItem),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = parseUserId(req);
      if (!userId) {
        res.status(401).json({ success: false, error: "Usuario no autenticado" });
        return;
      }

      const itemId = Number(req.params.id);
      const cart = await ensureUserCart(userId);

      await prisma.$transaction(async (tx) => {
        const existingItem = await tx.cartItem.findFirst({
          where: { id: itemId, cartId: cart.id },
          select: {
            id: true,
            productId: true,
            variantId: true,
            quantity: true,
          },
        });

        if (!existingItem) {
          throw new CartError(CART_ERROR.ITEM_NOT_FOUND);
        }

        if (existingItem.variantId) {
          await incrementVariantStock(tx, existingItem.variantId, existingItem.quantity);
        } else {
          await incrementProductStock(tx, existingItem.productId, existingItem.quantity);
        }

        await tx.cartItem.delete({ where: { id: existingItem.id } });
      });

      await recalculateCartTotal(cart.id);
      const response = await getCartResponse(cart.id);
      res.json({ success: true, data: response });
    } catch (error: unknown) {
      if (isCartError(error, CART_ERROR.ITEM_NOT_FOUND)) {
        res.status(404).json({ success: false, error: "Ítem no encontrado" });
        return;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        res.status(404).json({ success: false, error: "Ítem no encontrado" });
        return;
      }

      console.error("[cart:delete-item]", error);
      res.status(500).json({ success: false, error: "Error al eliminar ítem" });
    }
  }
);

export default router;
