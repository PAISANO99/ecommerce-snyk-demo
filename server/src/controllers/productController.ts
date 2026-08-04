import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import {
  createProduct,
  deleteProduct,
  findFeaturedProducts,
  findProductById,
  findProducts,
  ProductQueryFilters,
  updateProduct,
} from "../services/productService";

export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const {
      categoryId,
      search,
      minPrice,
      maxPrice,
      featured,
      page = "1",
      limit = "12",
    } = req.query;

    const pageNum = Math.max(1, Number.parseInt(String(page), 10));
    const limitNum = Math.min(50, Math.max(1, Number.parseInt(String(limit), 10)));

    const filters: ProductQueryFilters = {
      categoryId: categoryId ? Number.parseInt(String(categoryId), 10) : undefined,
      search: search ? String(search).trim() : undefined,
      minPrice: minPrice ? Number.parseFloat(String(minPrice)) : undefined,
      maxPrice: maxPrice ? Number.parseFloat(String(maxPrice)) : undefined,
      featured: featured === "true" ? true : undefined,
      page: pageNum,
      limit: limitNum,
    };

    const result = await findProducts(filters);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("[getProducts]", error);
    res.status(500).json({ success: false, error: "Error al obtener productos" });
  }
}

export async function getProductById(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ success: false, error: "ID inválido" });
      return;
    }

    const product = await findProductById(id);
    if (!product) {
      res.status(404).json({ success: false, error: "Producto no encontrado" });
      return;
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error("[getProductById]", error);
    res.status(500).json({ success: false, error: "Error al obtener producto" });
  }
}

export async function getFeaturedProducts(_req: Request, res: Response): Promise<void> {
  try {
    const data = await findFeaturedProducts();
    res.json({ success: true, data });
  } catch (error) {
    console.error("[getFeaturedProducts]", error);
    res.status(500).json({ success: false, error: "Error al obtener productos destacados" });
  }
}

export async function postProduct(req: Request, res: Response): Promise<void> {
  try {
    const {
      name,
      description,
      price,
      comparePrice,
      imageUrl,
      stock,
      featured,
      badge,
      categoryId,
    } = req.body;

    if (!name || price === undefined || !imageUrl || categoryId === undefined) {
      res.status(400).json({
        success: false,
        error: "name, price, imageUrl y categoryId son obligatorios",
      });
      return;
    }

    const created = await createProduct({
      name: String(name).trim(),
      description: description ? String(description).trim() : undefined,
      price: Number(price),
      comparePrice: comparePrice !== undefined ? Number(comparePrice) : undefined,
      imageUrl: String(imageUrl).trim(),
      stock: stock !== undefined ? Number(stock) : 0,
      featured: featured === true,
      badge: badge ? String(badge).trim() : undefined,
      categoryId: Number(categoryId),
    });

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      res.status(400).json({ success: false, error: "La categoría no existe" });
      return;
    }
    console.error("[postProduct]", error);
    res.status(500).json({ success: false, error: "Error al crear producto" });
  }
}

export async function putProduct(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ success: false, error: "ID inválido" });
      return;
    }

    const data: {
      name?: string;
      description?: string;
      price?: number;
      comparePrice?: number | null;
      imageUrl?: string;
      stock?: number;
      featured?: boolean;
      badge?: string | null;
      categoryId?: number;
    } = {};

    if (req.body.name !== undefined) data.name = String(req.body.name).trim();
    if (req.body.description !== undefined) data.description = String(req.body.description).trim();
    if (req.body.price !== undefined) data.price = Number(req.body.price);
    if (req.body.comparePrice !== undefined) {
      data.comparePrice = req.body.comparePrice === null ? null : Number(req.body.comparePrice);
    }
    if (req.body.imageUrl !== undefined) data.imageUrl = String(req.body.imageUrl).trim();
    if (req.body.stock !== undefined) data.stock = Number(req.body.stock);
    if (req.body.featured !== undefined) data.featured = Boolean(req.body.featured);
    if (req.body.badge !== undefined) data.badge = req.body.badge ? String(req.body.badge).trim() : null;
    if (req.body.categoryId !== undefined) data.categoryId = Number(req.body.categoryId);

    const updated = await updateProduct(id, data);
    res.json({ success: true, data: updated });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ success: false, error: "Producto no encontrado" });
      return;
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      res.status(400).json({ success: false, error: "La categoría no existe" });
      return;
    }
    console.error("[putProduct]", error);
    res.status(500).json({ success: false, error: "Error al actualizar producto" });
  }
}

export async function removeProduct(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ success: false, error: "ID inválido" });
      return;
    }

    await deleteProduct(id);
    res.json({ success: true, message: "Producto eliminado" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ success: false, error: "Producto no encontrado" });
      return;
    }
    console.error("[removeProduct]", error);
    res.status(500).json({ success: false, error: "Error al eliminar producto" });
  }
}
