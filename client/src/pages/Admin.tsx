import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createCategoryRequest,
  createProductRequest,
  deleteProductRequest,
  getCategoriesRequest,
  getProductsRequest,
  updateProductRequest,
} from "../services/api";
import type { Category, Product } from "../types/catalog";
import { useAuth } from "../hooks";

export default function Admin() {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newCategory, setNewCategory] = useState({ name: "", slug: "", imageUrl: "" });
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    stock: "",
    categoryId: "",
    featured: false,
  });

  if (!user) {
    return null;
  }

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [categoriesRes, productsRes] = await Promise.all([
        getCategoriesRequest(),
        getProductsRequest({ page: 1, limit: 50 }),
      ]);
      setCategories(categoriesRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const canCreateProduct = useMemo(() => {
    return (
      newProduct.name.trim() &&
      newProduct.price.trim() &&
      newProduct.imageUrl.trim() &&
      newProduct.stock.trim() &&
      newProduct.categoryId.trim()
    );
  }, [newProduct]);

  async function onCreateCategory(e: FormEvent) {
    e.preventDefault();
    try {
      await createCategoryRequest({
        name: newCategory.name.trim(),
        slug: newCategory.slug.trim().toLowerCase(),
        imageUrl: newCategory.imageUrl.trim() || undefined,
      });
      setNewCategory({ name: "", slug: "", imageUrl: "" });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la categoría");
    }
  }

  async function onCreateProduct(e: FormEvent) {
    e.preventDefault();
    try {
      await createProductRequest({
        name: newProduct.name.trim(),
        description: newProduct.description.trim() || undefined,
        price: Number(newProduct.price),
        imageUrl: newProduct.imageUrl.trim(),
        stock: Number(newProduct.stock),
        categoryId: Number(newProduct.categoryId),
        featured: newProduct.featured,
      });

      setNewProduct({
        name: "",
        description: "",
        price: "",
        imageUrl: "",
        stock: "",
        categoryId: "",
        featured: false,
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el producto");
    }
  }

  async function onToggleFeatured(product: Product) {
    try {
      await updateProductRequest(product.id, { featured: !product.featured });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el producto");
    }
  }

  async function onDeleteProduct(product: Product) {
    const confirmed = window.confirm(`¿Eliminar producto "${product.name}"?`);
    if (!confirmed) return;

    try {
      await deleteProductRequest(product.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el producto");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Panel Administrativo</h1>
              <p className="text-sm text-slate-600">
                Gestión de catálogo (Sprint 2) · Administrador: {user.name}
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href="/home"
                className="rounded-md border px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Ir a tienda
              </a>
              <button
                onClick={logout}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="grid gap-5 lg:grid-cols-2">
          <form onSubmit={onCreateCategory} className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Crear categoría</h2>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Nombre"
              value={newCategory.name}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Slug (ej: moda-urbana)"
              value={newCategory.slug}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, slug: e.target.value }))}
              required
            />
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="URL de imagen (opcional)"
              value={newCategory.imageUrl}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, imageUrl: e.target.value }))}
            />
            <button className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-500">
              Guardar categoría
            </button>
          </form>

          <form onSubmit={onCreateProduct} className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Crear producto</h2>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Nombre"
              value={newProduct.name}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <textarea
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Descripción"
              value={newProduct.description}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Precio"
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Stock"
                type="number"
                value={newProduct.stock}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, stock: e.target.value }))}
                required
              />
            </div>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="URL de imagen"
              value={newProduct.imageUrl}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, imageUrl: e.target.value }))}
              required
            />
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={newProduct.categoryId}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, categoryId: e.target.value }))}
              required
            >
              <option value="">Selecciona categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={newProduct.featured}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, featured: e.target.checked }))}
              />
              Marcar como destacado
            </label>
            <button
              disabled={!canCreateProduct}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Guardar producto
            </button>
          </form>
        </div>

        <section className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-slate-900">Inventario actual</h2>
          {loading ? (
            <p className="text-sm text-slate-600">Cargando productos...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-600">
                    <th className="px-2 py-2">Producto</th>
                    <th className="px-2 py-2">Categoría</th>
                    <th className="px-2 py-2">Precio</th>
                    <th className="px-2 py-2">Stock</th>
                    <th className="px-2 py-2">Estado</th>
                    <th className="px-2 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b">
                      <td className="px-2 py-2 font-medium text-slate-900">{product.name}</td>
                      <td className="px-2 py-2 text-slate-600">{product.category?.name ?? "-"}</td>
                      <td className="px-2 py-2 text-slate-600">
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 0,
                        }).format(product.price)}
                      </td>
                      <td className="px-2 py-2 text-slate-600">{product.stock}</td>
                      <td className="px-2 py-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            product.featured ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {product.featured ? "Destacado" : "Normal"}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => onToggleFeatured(product)}
                            className="rounded border px-2 py-1 text-xs hover:bg-slate-100"
                          >
                            Cambiar estado
                          </button>
                          <button
                            onClick={() => onDeleteProduct(product)}
                            className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
