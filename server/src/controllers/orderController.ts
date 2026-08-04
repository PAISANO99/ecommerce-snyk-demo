import type { CartItem, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { extractTokenFromHeader, verifyToken } from "../config/jwt";
import type { AuthenticatedRequest } from "../middlewares/auth";
import {
  decrementProductStock,
  decrementVariantStock,
  incrementProductStock,
  incrementVariantStock,
} from "../services/inventoryService";

const ORDER_ERROR = {
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
} as const;

const ORDER_ERROR_CODE = {
  INVALID_ORDER_REFERENCE: "INVALID_ORDER_REFERENCE",
  USER_NOT_FOUND: "USER_NOT_FOUND",
} as const;

type OrderErrorCode = (typeof ORDER_ERROR_CODE)[keyof typeof ORDER_ERROR_CODE];
type OrderInternalErrorCode = (typeof ORDER_ERROR)[keyof typeof ORDER_ERROR];

type OrderItemPayload = {
  productId: number;
  variantId?: number | null;
  quantity: number;
  price?: number;
};

type CreateOrderPayload = {
  userId?: number;
  name: string;
  email: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
  paymentMethod: string;
  items: OrderItemPayload[];
};

type NormalizedOrderItem = {
  productId: number;
  variantId: number | null;
  quantity: number;
};

interface OrderUserResolutionResult {
  errorCode?: OrderErrorCode;
  userId: number | null;
}

interface PrismaKnownErrorLike {
  code?: string;
}

class OrderError extends Error {
  constructor(public readonly code: OrderInternalErrorCode) {
    super(code);
  }
}

function isOrderError(error: unknown, code: OrderInternalErrorCode) {
  return error instanceof OrderError && error.code === code;
}

function isPrismaForeignKeyError(error: unknown): error is PrismaKnownErrorLike {
  return typeof error === "object" && error !== null && "code" in error && (error as PrismaKnownErrorLike).code === "P2003";
}

function sendOrderReferenceError(res: Response, code: OrderErrorCode, message: string) {
  res.status(422).json({
    success: false,
    code,
    message,
  });
}

function normalizeItems(items: OrderItemPayload[]): NormalizedOrderItem[] {
  const aggregated = new Map<string, NormalizedOrderItem>();

  for (const item of items) {
    const variantId = item.variantId ?? null;
    const key = `${item.productId}-${variantId}`;
    const existing = aggregated.get(key);

    if (existing) {
      existing.quantity += item.quantity;
      continue;
    }

    aggregated.set(key, {
      productId: item.productId,
      variantId,
      quantity: item.quantity,
    });
  }

  return Array.from(aggregated.values());
}

async function restoreReservedCartStock(tx: Prisma.TransactionClient, cartItems: CartItem[]) {
  for (const item of cartItems) {
    if (item.variantId) {
      await incrementVariantStock(tx, item.variantId, item.quantity);
      continue;
    }

    await incrementProductStock(tx, item.productId, item.quantity);
  }
}

function parseAuthenticatedUserId(req: Request) {
  const authReq = req as AuthenticatedRequest;
  const requestUserId = Number(authReq.userId);

  if (Number.isInteger(requestUserId) && requestUserId > 0) {
    return requestUserId;
  }

  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  const tokenUserId = Number(decoded.id);
  return Number.isInteger(tokenUserId) && tokenUserId > 0 ? tokenUserId : null;
}

async function resolveOrderUserId(
  payload: CreateOrderPayload,
  authenticatedUserId: number | null
): Promise<OrderUserResolutionResult> {
  if (authenticatedUserId) {
    return { userId: authenticatedUserId };
  }

  if (payload.userId && Number.isInteger(payload.userId) && payload.userId > 0) {
    const existingUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true },
    });

    if (!existingUser) {
      return {
        userId: null,
        errorCode: ORDER_ERROR_CODE.USER_NOT_FOUND,
      };
    }

    return { userId: existingUser.id };
  }

  const email = payload.email?.trim().toLowerCase();
  const name = payload.name?.trim();

  if (!email || !name) {
    return { userId: null };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { userId: existingUser.id };
  }

  const placeholderPassword = await bcrypt.hash(`checkout-${email}`, 10);
  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: placeholderPassword,
      role: "CLIENT",
    },
  });

  return { userId: createdUser.id };
}

export async function createOrder(req: Request, res: Response) {
  try {
    const payload = req.body as CreateOrderPayload;
    const normalizedItems = normalizeItems(payload.items);
    const authenticatedUserId = parseAuthenticatedUserId(req);
    const { errorCode, userId: resolvedUserId } = await resolveOrderUserId(payload, authenticatedUserId);

    if (errorCode === ORDER_ERROR_CODE.USER_NOT_FOUND) {
      sendOrderReferenceError(res, errorCode, "El usuario indicado no existe");
      return;
    }

    if (!resolvedUserId) {
      res.status(400).json({ success: false, message: "No se pudo resolver el usuario de la orden" });
      return;
    }

    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId: resolvedUserId },
        include: { items: true },
      });

      if (cart?.items.length) {
        await restoreReservedCartStock(tx, cart.items);
      }

      const uniqueProductIds = [...new Set(normalizedItems.map((item) => item.productId))];
      const products = await tx.product.findMany({
        where: { id: { in: uniqueProductIds } },
        select: { id: true, price: true },
      });

      if (products.length !== uniqueProductIds.length) {
        throw new OrderError(ORDER_ERROR.PRODUCT_NOT_FOUND);
      }

      const productsById = new Map(products.map((product) => [product.id, product]));
      const authoritativeItems = [] as Array<NormalizedOrderItem & { price: number }>;

      for (const item of normalizedItems) {
        const product = productsById.get(item.productId);
        if (!product) {
          throw new OrderError(ORDER_ERROR.PRODUCT_NOT_FOUND);
        }

        const decremented = item.variantId
          ? await decrementVariantStock(tx, item.variantId, item.productId, item.quantity)
          : await decrementProductStock(tx, item.productId, item.quantity);

        if (!decremented) {
          throw new OrderError(ORDER_ERROR.INSUFFICIENT_STOCK);
        }

        authoritativeItems.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: product.price,
        });
      }

      const total = authoritativeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const createdOrder = await tx.order.create({
        data: {
          userId: resolvedUserId,
          name: payload.name,
          email: payload.email,
          address: payload.address,
          city: payload.city,
          country: payload.country,
          postalCode: payload.postalCode,
          phone: payload.phone,
          paymentMethod: payload.paymentMethod,
          total,
          status: "pendiente",
          items: {
            create: authoritativeItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        await tx.cart.update({ where: { id: cart.id }, data: { total: 0 } });
      }

      return createdOrder;
    });

    res.status(201).json({ success: true, order });
  } catch (error: unknown) {
    if (isPrismaForeignKeyError(error)) {
      sendOrderReferenceError(
        res,
        ORDER_ERROR_CODE.INVALID_ORDER_REFERENCE,
        "No fue posible crear la orden porque una referencia relacionada ya no existe"
      );
      return;
    }

    if (isOrderError(error, ORDER_ERROR.PRODUCT_NOT_FOUND)) {
      res.status(400).json({ success: false, message: "Uno o más productos ya no existen" });
      return;
    }

    if (isOrderError(error, ORDER_ERROR.INSUFFICIENT_STOCK)) {
      res.status(400).json({ success: false, message: "Stock insuficiente para completar la orden" });
      return;
    }

    console.error("[orders:create]", error);
    res.status(500).json({ success: false, message: "Error al crear la orden" });
  }
}

export async function getOrders(req: AuthenticatedRequest, res: Response) {
  try {
    const authenticatedUserId = Number(req.userId);
    if (!Number.isInteger(authenticatedUserId) || authenticatedUserId <= 0) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId: authenticatedUserId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({ success: true, orders });
  } catch (error: unknown) {
    console.error("[orders:list]", error);
    res.status(500).json({ success: false, message: "Error al obtener órdenes" });
  }
}
