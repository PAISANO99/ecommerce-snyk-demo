import type { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { decrementProductStock } from "../../src/services/inventoryService";

describe("inventoryService", () => {
  it("prevents overselling under concurrent conditional decrements", async () => {
    let stock = 5;

    const tx = {
      product: {
        updateMany: vi.fn(async ({ where }: { where: { stock: { gte: number } } }) => {
          const requested = where.stock.gte;

          if (stock >= requested) {
            stock -= requested;
            return { count: 1 };
          }

          return { count: 0 };
        }),
      },
    } as unknown as Prisma.TransactionClient;

    const [firstAttempt, secondAttempt] = await Promise.all([
      decrementProductStock(tx, 1, 4),
      decrementProductStock(tx, 1, 4),
    ]);

    expect([firstAttempt, secondAttempt].sort()).toEqual([false, true]);
    expect(stock).toBe(1);
  });
});
