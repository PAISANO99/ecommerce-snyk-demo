import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { generateToken } from "../../src/config/jwt";

const clientToken = generateToken({
  id: "1",
  email: "client@example.com",
  role: "CLIENT",
});

const adminToken = generateToken({
  id: "2",
  email: "admin@example.com",
  role: "ADMIN",
});

describe("security validation contracts", () => {
  it("rejects invalid auth payloads and unexpected fields", async () => {
    const app = createApp();

    const invalidLogin = await request(app).post("/api/auth/login").send({
      email: "not-an-email",
      password: "123",
      unexpected: true,
    });

    expect(invalidLogin.status).toBe(400);
    expect(invalidLogin.body.success).toBe(false);

    const invalidRegister = await request(app).post("/api/auth/register").send({
      name: " ",
      email: " BAD@EXAMPLE.COM ",
      password: "short",
      role: "ADMIN",
    });

    expect(invalidRegister.status).toBe(400);
    expect(invalidRegister.body.success).toBe(false);
  });

  it("rejects invalid cart and order payloads before hitting deeper logic", async () => {
    const app = createApp();

    const invalidCart = await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ productId: 0, quantity: -1, unexpected: true });

    expect(invalidCart.status).toBe(400);
    expect(invalidCart.body.success).toBe(false);

    const invalidOrder = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        name: "A",
        email: " BAD@EXAMPLE.COM ",
        address: "x",
        city: "",
        country: "AR",
        postalCode: "12",
        phone: "123",
        paymentMethod: "bitcoin",
        items: [{ productId: 1, quantity: 0, price: -1 }],
      });

    expect(invalidOrder.status).toBe(400);
    expect(invalidOrder.body.success).toBe(false);
  });

  it("rejects invalid query or body data on product, category, and admin critical endpoints", async () => {
    const app = createApp();

    await request(app).get("/api/products?minPrice=100&maxPrice=10").expect(400);

    await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "A",
        price: -10,
        imageUrl: "not-a-url",
        stock: -1,
        categoryId: 0,
      })
      .expect(400);

    await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Moda",
        slug: "Slug Invalido",
      })
      .expect(400);

    await request(app)
      .patch("/api/admin/orders/abc/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "UNKNOWN" })
      .expect(400);
  });
});
