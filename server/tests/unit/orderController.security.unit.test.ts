import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
    order: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("../../src/config/prisma", () => ({
  default: prismaMock,
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(async () => "hashed-checkout-password"),
  },
}));

import { createOrder } from "../../src/controllers/orderController";

function createResponseMock() {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as Response;

  vi.mocked(response.status).mockReturnValue(response);
  vi.mocked(response.json).mockReturnValue(response);

  return response;
}

describe("orderController security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("recomputes authoritative prices from the database during order creation", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 55 });

    const tx = {
      cart: {
        findUnique: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
      cartItem: {
        deleteMany: vi.fn(),
      },
      product: {
        findMany: vi.fn().mockResolvedValue([{ id: 7, price: 99 }]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      order: {
        create: vi.fn().mockImplementation(async ({ data }) => ({
          id: 501,
          ...data,
          items: data.items.create,
          user: { id: 55, name: data.name, email: data.email },
        })),
      },
    };

    prismaMock.$transaction.mockImplementation(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx));

    const req = {
      userId: 55,
      headers: {},
      body: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        address: "Main Street 123",
        city: "Cordoba",
        country: "AR",
        postalCode: "5000",
        phone: "3511234567",
        paymentMethod: "tarjeta",
        items: [{ productId: 7, quantity: 2, price: 1 }],
      },
    } as Request;
    const res = createResponseMock();

    await createOrder(req, res);

    expect(tx.product.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 7,
          stock: { gte: 2 },
        }),
      })
    );
    expect(tx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          total: 198,
          items: {
            create: [{ productId: 7, quantity: 2, price: 99 }],
          },
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("decrements stock from product variants when variantId is provided", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 55 });

    const tx = {
      cart: {
        findUnique: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
      cartItem: {
        deleteMany: vi.fn(),
      },
      product: {
        findMany: vi.fn().mockResolvedValue([{ id: 7, price: 99 }]),
        updateMany: vi.fn(),
      },
      productVariant: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      order: {
        create: vi.fn().mockImplementation(async ({ data }) => ({
          id: 501,
          ...data,
          items: data.items.create,
          user: { id: 55, name: data.name, email: data.email },
        })),
      },
    };

    prismaMock.$transaction.mockImplementation(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx));

    const req = {
      userId: 55,
      headers: {},
      body: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        address: "Main Street 123",
        city: "Cordoba",
        country: "AR",
        postalCode: "5000",
        phone: "3511234567",
        paymentMethod: "tarjeta",
        items: [{ productId: 7, variantId: 99, quantity: 2, price: 1 }],
      },
    } as unknown as Request;
    const res = createResponseMock();

    await createOrder(req, res);

    expect(tx.productVariant.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 99,
          productId: 7,
          stock: { gte: 2 },
        }),
      })
    );
    expect(tx.product.updateMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("rejects the order when authoritative stock cannot be reserved", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 55 });

    const tx = {
      cart: {
        findUnique: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
      cartItem: {
        deleteMany: vi.fn(),
      },
      product: {
        findMany: vi.fn().mockResolvedValue([{ id: 7, price: 99 }]),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      order: {
        create: vi.fn(),
      },
    };

    prismaMock.$transaction.mockImplementation(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx));

    const req = {
      userId: 55,
      headers: {},
      body: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        address: "Main Street 123",
        city: "Cordoba",
        country: "AR",
        postalCode: "5000",
        phone: "3511234567",
        paymentMethod: "tarjeta",
        items: [{ productId: 7, quantity: 2, price: 1 }],
      },
    } as Request;
    const res = createResponseMock();

    await createOrder(req, res);

    expect(tx.order.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(vi.mocked(res.json).mock.calls[0]?.[0]).toEqual({
      success: false,
      message: "Stock insuficiente para completar la orden",
    });
  });
});
