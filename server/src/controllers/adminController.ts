import { Request, Response } from "express";
import prisma from "../config/prisma";

const ALLOWED_ORDER_STATUSES = ["pendiente", "pagado", "enviado", "entregado", "cancelado"] as const;

export async function getDashboardMetrics(_req: Request, res: Response): Promise<void> {
  try {
    const [totalUsers, totalProducts, totalOrders, revenueAggregate, lowStockProducts, ordersByStatusRaw] =
      await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.order.count(),
        prisma.order.aggregate({
          _sum: {
            total: true,
          },
        }),
        prisma.product.count({
          where: {
            stock: {
              lte: 5,
            },
          },
        }),
        prisma.order.groupBy({
          by: ["status"],
          _count: {
            status: true,
          },
        }),
      ]);

    const ordersByStatus = ordersByStatusRaw.reduce<Record<string, number>>((acc, item) => {
      const normalizedStatus = item.status?.trim().toLowerCase() || "desconocido";

      acc[normalizedStatus] = (acc[normalizedStatus] ?? 0) + item._count.status;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenueAggregate._sum.total ?? 0,
        lowStockProducts,
        ordersByStatus,
      },
    });
  } catch (error) {
    console.error("[admin:getDashboardMetrics]", error);
    res.status(500).json({ success: false, error: "Error al obtener métricas del dashboard" });
  }
}

export async function getAdminUsers(req: Request, res: Response): Promise<void> {
  try {
    const pageParam = Number.parseInt(String(req.query.page ?? "1"), 10);
    const limitParam = Number.parseInt(String(req.query.limit ?? "20"), 10);

    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limit = Number.isNaN(limitParam) || limitParam < 1 ? 20 : Math.min(limitParam, 100);
    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    res.json({
      success: true,
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("[admin:getAdminUsers]", error);
    res.status(500).json({ success: false, error: "Error al obtener usuarios" });
  }
}

export async function getAdminOrders(req: Request, res: Response): Promise<void> {
  try {
    const pageParam = Number.parseInt(String(req.query.page ?? "1"), 10);
    const limitParam = Number.parseInt(String(req.query.limit ?? "20"), 10);
    const statusParam = typeof req.query.status === "string" ? req.query.status.trim().toLowerCase() : "";

    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limit = Number.isNaN(limitParam) || limitParam < 1 ? 20 : Math.min(limitParam, 100);
    const skip = (page - 1) * limit;

    const where = statusParam ? { status: statusParam } : undefined;

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          name: true,
          email: true,
          city: true,
          country: true,
          paymentMethod: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    res.json({
      success: true,
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("[admin:getAdminOrders]", error);
    res.status(500).json({ success: false, error: "Error al obtener órdenes" });
  }
}

export async function updateAdminOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
      res.status(400).json({ success: false, error: "El id de la orden debe ser numérico" });
      return;
    }

    const rawStatus = req.body?.status;
    const normalizedStatus = typeof rawStatus === "string" ? rawStatus.trim().toLowerCase() : "";

    if (!normalizedStatus) {
      res.status(400).json({ success: false, error: "El status es obligatorio" });
      return;
    }

    if (!ALLOWED_ORDER_STATUSES.includes(normalizedStatus as (typeof ALLOWED_ORDER_STATUSES)[number])) {
      res.status(400).json({
        success: false,
        error: `Status inválido. Valores permitidos: ${ALLOWED_ORDER_STATUSES.join(", ")}`,
      });
      return;
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingOrder) {
      res.status(404).json({ success: false, error: "La orden no existe" });
      return;
    }

    await prisma.order.update({
      where: { id },
      data: { status: normalizedStatus },
    });

    res.json({
      success: true,
      data: {
        id,
        status: normalizedStatus,
        updated: true,
      },
    });
  } catch (error) {
    console.error("[admin:updateAdminOrderStatus]", error);
    res.status(500).json({ success: false, error: "Error al actualizar el estado de la orden" });
  }
}
