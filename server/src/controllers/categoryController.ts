import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import {
  createCategory,
  deleteCategory,
  findCategories,
  findCategoryBySlug,
  updateCategory,
} from "../services/categoryService";

export async function getCategories(_req: Request, res: Response): Promise<void> {
  try {
    const categories = await findCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("[getCategories]", error);
    res.status(500).json({ success: false, error: "Error al obtener categorías" });
  }
}

export async function getCategoryBySlug(req: Request, res: Response): Promise<void> {
  try {
    const category = await findCategoryBySlug(String(req.params.slug));
    if (!category) {
      res.status(404).json({ success: false, error: "Categoría no encontrada" });
      return;
    }
    res.json({ success: true, data: category });
  } catch (error) {
    console.error("[getCategoryBySlug]", error);
    res.status(500).json({ success: false, error: "Error al obtener categoría" });
  }
}

export async function postCategory(req: Request, res: Response): Promise<void> {
  try {
    const { name, slug, imageUrl, description } = req.body;

    if (!name || !slug) {
      res.status(400).json({ success: false, error: "name y slug son obligatorios" });
      return;
    }

    const category = await createCategory({
      name: String(name).trim(),
      slug: String(slug).trim().toLowerCase(),
      imageUrl: imageUrl ? String(imageUrl).trim() : undefined,
      description: description ? String(description).trim() : undefined,
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({ success: false, error: "Categoría duplicada" });
      return;
    }

    console.error("[postCategory]", error);
    res.status(500).json({ success: false, error: "Error al crear categoría" });
  }
}

export async function putCategory(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ success: false, error: "ID inválido" });
      return;
    }

    const payload: {
      name?: string;
      slug?: string;
      imageUrl?: string;
      description?: string;
    } = {};

    if (req.body.name !== undefined) payload.name = String(req.body.name).trim();
    if (req.body.slug !== undefined) payload.slug = String(req.body.slug).trim().toLowerCase();
    if (req.body.imageUrl !== undefined) payload.imageUrl = String(req.body.imageUrl).trim();
    if (req.body.description !== undefined) {
      payload.description = String(req.body.description).trim();
    }

    const updated = await updateCategory(id, payload);
    res.json({ success: true, data: updated });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ success: false, error: "Categoría no encontrada" });
      return;
    }
    console.error("[putCategory]", error);
    res.status(500).json({ success: false, error: "Error al actualizar categoría" });
  }
}

export async function removeCategory(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ success: false, error: "ID inválido" });
      return;
    }

    await deleteCategory(id);
    res.json({ success: true, message: "Categoría eliminada" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      res.status(409).json({
        success: false,
        error: "No se puede eliminar la categoría porque tiene productos asociados",
      });
      return;
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ success: false, error: "Categoría no encontrada" });
      return;
    }
    console.error("[removeCategory]", error);
    res.status(500).json({ success: false, error: "Error al eliminar categoría" });
  }
}
