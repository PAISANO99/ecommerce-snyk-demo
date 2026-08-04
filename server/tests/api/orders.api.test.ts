import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../../src/app";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    $transaction: vi.fn(),
    cart: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    cartItem: {
      deleteMany: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
    },
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../../src/config/prisma", () => ({
  default: prismaMock,
}));

const validOrderPayload = {
  userId: 1,
  name: "Javier Gómez",
  email: "javier@vibepulse.com",
  address: "Calle 123 #45-67",
  city: "Bogotá",
  country: "Colombia",
  postalCode: "110111",
  phone: "3001234567",
  paymentMethod: "tarjeta",
  items: [
    {
      productId: 101,
      quantity: 2,
      price: 169900,
    },
  ],
};

describe("POST /api/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.cart.findUnique.mockResolvedValue(null);
    prismaMock.product.findMany.mockResolvedValue([{ id: 101 }]);
  });

  it("creates an order when the referenced user exists", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: 1 });
    prismaMock.$transaction.mockImplementationOnce(async (callback) =>
      callback({
        cart: {
          findUnique: vi.fn().mockResolvedValue(null),
          update: vi.fn(),
        },
        cartItem: {
          deleteMany: vi.fn(),
        },
        product: {
          findMany: vi.fn().mockResolvedValue([{ id: 101, price: 169900 }]),
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        productVariant: {
          updateMany: vi.fn(),
        },
        order: {
          create: vi.fn().mockResolvedValue({
            id: 501,
            total: 339800,
            status: "pendiente",
            items: validOrderPayload.items,
            user: {
              id: 1,
              name: "Javier Gómez",
              email: "javier@vibepulse.com",
            },
          }),
        },
      })
    );

    const response = await request(createApp()).post("/api/orders").send(validOrderPayload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.order.id).toBe(501);
  });

  it("returns 422 when a payload userId does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    const response = await request(createApp())
      .post("/api/orders")
      .send({
        ...validOrderPayload,
        userId: 9999,
      });

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({
      success: false,
      code: "USER_NOT_FOUND",
    });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("maps foreign key races to a controlled 422 response instead of 500", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: 1 });
    prismaMock.$transaction.mockRejectedValueOnce({ code: "P2003" });

    const response = await request(createApp()).post("/api/orders").send(validOrderPayload);

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({
      success: false,
      code: "INVALID_ORDER_REFERENCE",
    });
  });
});
