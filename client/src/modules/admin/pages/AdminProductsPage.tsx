import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  AlertTriangle,
  CreditCard,
  Package,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import AdminPagination from "../components/AdminPagination";
import type { AdminLayoutContext } from "../types";
import { cn } from "../../../lib/cn";
import {
  createProductRequest,
  deleteProductRequest,
  getCategoriesRequest,
  getProductsRequest,
  updateProductRequest,
} from "../../../services/api";
import type { Category, Product } from "../../../types/catalog";
import { formatCurrencyCOP } from "../utils/format";

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  imageUrl: string;
  stock: string;
  categoryId: string;
  featured: boolean;
  badge: string;
};

const EMPTY_FORM: ProductFormState = {
  name: "",
  description: "",
  price: "",
  comparePrice: "",
  imageUrl: "",
  stock: "",
  categoryId: "",
  featured: false,
  badge: "",
};

export default function AdminProductsPage() {
  const { searchQuery } = useOutletContext<AdminLayoutContext>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsResponse, categoriesResponse] = await Promise.all([
        getProductsRequest({ page, limit: 12, search: searchQuery || undefined }),
        getCategoriesRequest(),
      ]);

      setProducts(productsResponse.data);
      setTotal(productsResponse.total);
      setTotalPages(productsResponse.totalPages);
      setCategories(categoriesResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const lowStockCount = useMemo(() => products.filter((product) => product.stock <= 5).length, [products]);
  const inventoryValue = useMemo(
    () => products.reduce((acc, product) => acc + product.price * product.stock, 0),
    [products]
  );

  const categoryLeader = useMemo(() => {
    const counts = new Map<string, number>();

    products.forEach((product) => {
      const categoryName = product.category?.name ?? "Sin categoría";
      counts.set(categoryName, (counts.get(categoryName) ?? 0) + 1);
    });

    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Sin datos";
  }, [products]);

  function openCreateModal() {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      comparePrice: product.comparePrice ? String(product.comparePrice) : "",
      imageUrl: product.imageUrl,
      stock: String(product.stock),
      categoryId: String(product.categoryId),
      featured: product.featured,
      badge: product.badge ?? "",
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingProduct(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        comparePrice: form.comparePrice.trim() ? Number(form.comparePrice) : null,
        imageUrl: form.imageUrl.trim(),
        stock: Number(form.stock),
        featured: form.featured,
        badge: form.badge.trim() || null,
        categoryId: Number(form.categoryId),
      };

      if (editingProduct) {
        await updateProductRequest(editingProduct.id, payload);
      } else {
        await createProductRequest({
          ...payload,
          comparePrice: payload.comparePrice ?? undefined,
          badge: payload.badge ?? undefined,
        });
      }

      closeModal();
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el producto");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(`¿Eliminar producto "${product.name}"?`);
    if (!confirmed) return;

    try {
      setError(null);
      await deleteProductRequest(product.id);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el producto");
    }
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h3 className="font-headline text-2xl font-extrabold tracking-tight text-admin-on-surface sm:text-3xl">
            Inventario de productos
          </h3>
          <p className="mt-1 text-sm text-admin-on-surface-variant">
            Gestiona el catálogo central y las acciones operativas del admin.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-2xl border border-admin-outline-variant/40 bg-admin-surface-high/60 px-4 py-3 text-sm text-admin-on-surface-variant">
            <span className="font-bold text-admin-on-surface">{total}</span> productos totales
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-admin-primary-container to-admin-primary px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-admin-on-primary transition hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            Nuevo producto
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-admin-error-container/40 bg-admin-error-container/20 px-4 py-3 text-sm text-admin-error">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Package} label="Total productos" value={String(total)} accent="text-admin-primary" />
        <MetricCard icon={AlertTriangle} label="Stock bajo en página" value={String(lowStockCount)} accent="text-admin-tertiary" />
        <MetricCard icon={CreditCard} label="Valor visible" value={formatCurrencyCOP(inventoryValue)} accent="text-admin-secondary" />
        <MetricCard icon={Sparkles} label="Categoría líder" value={categoryLeader} accent="text-admin-outline" />
      </div>

      <article className="admin-panel overflow-hidden rounded-[28px]">
        <div className="flex flex-col gap-4 border-b border-admin-outline-variant/20 px-4 py-5 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h4 className="font-headline text-xl font-bold text-admin-on-surface">Listado maestro</h4>
            <p className="text-sm text-admin-on-surface-variant">
              La búsqueda superior consulta el backend por nombre o término relacionado.
            </p>
          </div>

          <label className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-admin-outline-variant/40 bg-admin-surface-high/70 px-4 py-3 text-sm text-admin-on-surface-variant">
            <Search className="h-4 w-4 text-admin-outline" />
            <input
              type="text"
              value={searchQuery}
              readOnly
              placeholder="Usa la búsqueda superior para filtrar productos"
              className="w-full min-w-0 bg-transparent outline-none placeholder:text-admin-outline md:min-w-[260px]"
            />
          </label>
        </div>

        <div className="border-b border-admin-outline-variant/20 bg-admin-surface-high/20 px-4 py-3 text-xs text-admin-outline sm:px-6">
          Vista paginada real desde el backend. Si solo existe una página, no se muestran páginas inexistentes.
        </div>

        {loading ? (
          <div className="px-4 py-10 text-sm text-admin-on-surface-variant sm:px-6">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="px-4 py-10 text-sm text-admin-on-surface-variant sm:px-6">No hay productos para mostrar.</div>
        ) : (
          <>
            <div className="grid gap-4 p-4 md:hidden">
              {products.map((product) => {
                const isLowStock = product.stock <= 5;

                return (
                  <article key={product.id} className="admin-table-mobile-card p-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-admin-on-surface">{product.name}</p>
                            <p className="mt-1 text-xs text-admin-on-surface-variant">ID #{product.id}</p>
                          </div>
                          <span className="rounded-full bg-admin-secondary-container/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-admin-secondary">
                            {product.category?.name ?? "Sin categoría"}
                          </span>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-admin-on-surface-variant">
                          {product.description ?? "Sin descripción cargada."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl bg-admin-surface-high/50 px-3 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-admin-outline">Precio</p>
                        <p className="mt-1 font-bold text-admin-on-surface">{formatCurrencyCOP(product.price)}</p>
                      </div>
                      <div className="rounded-2xl bg-admin-surface-high/50 px-3 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-admin-outline">Stock</p>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="font-bold text-admin-on-surface">{product.stock}</p>
                          {isLowStock && <AlertTriangle className="h-4 w-4 text-admin-tertiary" />}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                          product.featured ? "bg-emerald-500/10 text-emerald-300" : "bg-admin-surface-highest/70 text-admin-on-surface-variant"
                        )}
                      >
                        {product.featured ? "Destacado" : "Catálogo"}
                      </span>
                      {product.badge && <span className="text-xs text-admin-outline">Badge · {product.badge}</span>}
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(product)}
                        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-admin-outline-variant/40 bg-admin-surface-high/60 px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-admin-on-surface transition hover:bg-admin-surface-highest/70"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(product)}
                        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-admin-error-container/40 bg-admin-error-container/10 px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-admin-error transition hover:bg-admin-error-container/20"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="admin-scrollbar hidden overflow-x-auto md:block">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-admin-surface-high/50 text-[10px] font-bold uppercase tracking-[0.24em] text-admin-outline">
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-outline-variant/20 text-sm text-admin-on-surface">
                {products.map((product) => {
                  const isLowStock = product.stock <= 5;

                  return (
                    <tr key={product.id} className="transition hover:bg-admin-surface-high/40">
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-4">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="h-14 w-14 rounded-2xl object-cover"
                          />
                          <div className="space-y-1">
                            <p className="font-semibold text-admin-on-surface">{product.name}</p>
                            <p className="text-xs text-admin-on-surface-variant">ID #{product.id}</p>
                            {product.description ? (
                              <p className="max-w-xl text-xs leading-5 text-admin-on-surface-variant">{product.description}</p>
                            ) : (
                              <p className="text-xs text-admin-outline">Sin descripción cargada.</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="rounded-full bg-admin-secondary-container/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-admin-secondary">
                          {product.category?.name ?? "Sin categoría"}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-bold text-admin-on-surface">{formatCurrencyCOP(product.price)}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-admin-on-surface">{product.stock}</span>
                          {isLowStock && <AlertTriangle className="h-4 w-4 text-admin-tertiary" />}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <span
                            className={cn(
                              "inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                              product.featured ? "bg-emerald-500/10 text-emerald-300" : "bg-admin-surface-highest/70 text-admin-on-surface-variant"
                            )}
                          >
                            {product.featured ? "Destacado" : "Catálogo"}
                          </span>
                          {product.badge && <span className="text-xs text-admin-outline">Badge · {product.badge}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            className="inline-flex items-center gap-2 rounded-xl border border-admin-outline-variant/40 bg-admin-surface-high/60 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-admin-on-surface transition hover:bg-admin-surface-highest/70"
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(product)}
                            className="inline-flex items-center gap-2 rounded-xl border border-admin-error-container/40 bg-admin-error-container/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-admin-error transition hover:bg-admin-error-container/20"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </>
        )}

        {!loading && <AdminPagination page={page} totalPages={totalPages || 1} onPageChange={setPage} />}
      </article>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-3 py-3 sm:items-center sm:px-4">
          <button
            type="button"
            onClick={closeModal}
            aria-label="Cerrar modal de producto"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <article className="admin-panel relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-admin-outline-variant/40 sm:rounded-[32px]">
            <div className="border-b border-admin-outline-variant/20 bg-gradient-to-br from-admin-surface-low to-admin-surface-high px-5 py-5 sm:px-7 sm:py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-admin-outline">Catálogo</p>
                  <h4 className="mt-2 font-headline text-2xl font-black text-admin-on-surface sm:text-3xl">
                    {editingProduct ? "Editar producto" : "Nuevo producto"}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="min-h-[44px] self-start rounded-full border border-admin-outline-variant/40 bg-admin-surface-high/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-admin-on-surface transition hover:bg-admin-surface-highest/70"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="admin-scrollbar grid gap-4 overflow-y-auto px-5 py-5 sm:px-7 sm:py-7 md:grid-cols-2">
              <div className="md:col-span-2">
                <FieldLabel label="Nombre" />
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="mt-2 min-h-[44px] w-full rounded-2xl border border-admin-outline-variant/40 bg-admin-surface-high/70 px-4 py-3 text-sm text-admin-on-surface outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <FieldLabel label="Descripción" />
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-admin-outline-variant/40 bg-admin-surface-high/70 px-4 py-3 text-sm text-admin-on-surface outline-none"
                />
              </div>

              <div>
                <FieldLabel label="Precio COP" />
                <input
                  required
                  min="0"
                  type="number"
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  className="mt-2 min-h-[44px] w-full rounded-2xl border border-admin-outline-variant/40 bg-admin-surface-high/70 px-4 py-3 text-sm text-admin-on-surface outline-none"
                />
              </div>

              <div>
                <FieldLabel label="Precio comparado" />
                <input
                  min="0"
                  type="number"
                  value={form.comparePrice}
                  onChange={(event) => setForm((current) => ({ ...current, comparePrice: event.target.value }))}
                  className="mt-2 min-h-[44px] w-full rounded-2xl border border-admin-outline-variant/40 bg-admin-surface-high/70 px-4 py-3 text-sm text-admin-on-surface outline-none"
                />
              </div>

              <div>
                <FieldLabel label="Stock" />
                <input
                  required
                  min="0"
                  type="number"
                  value={form.stock}
                  onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
                  className="mt-2 min-h-[44px] w-full rounded-2xl border border-admin-outline-variant/40 bg-admin-surface-high/70 px-4 py-3 text-sm text-admin-on-surface outline-none"
                />
              </div>

              <div>
                <FieldLabel label="Categoría" />
                <select
                  required
                  value={form.categoryId}
                  onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
                  className="mt-2 min-h-[44px] w-full rounded-2xl border border-admin-outline-variant/40 bg-admin-surface-high/70 px-4 py-3 text-sm text-admin-on-surface outline-none"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <FieldLabel label="URL de imagen" />
                <input
                  required
                  type="url"
                  value={form.imageUrl}
                  onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
                  className="mt-2 min-h-[44px] w-full rounded-2xl border border-admin-outline-variant/40 bg-admin-surface-high/70 px-4 py-3 text-sm text-admin-on-surface outline-none"
                />
              </div>

              <div>
                <FieldLabel label="Badge visual" />
                <input
                  value={form.badge}
                  onChange={(event) => setForm((current) => ({ ...current, badge: event.target.value }))}
                  className="mt-2 min-h-[44px] w-full rounded-2xl border border-admin-outline-variant/40 bg-admin-surface-high/70 px-4 py-3 text-sm text-admin-on-surface outline-none"
                />
              </div>

              <label className="mt-7 flex items-center gap-3 rounded-2xl border border-admin-outline-variant/40 bg-admin-surface-high/60 px-4 py-3 text-sm text-admin-on-surface">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
                  className="custom-checkbox"
                />
                Marcar como destacado
              </label>

              <div className="md:col-span-2 flex flex-col gap-3 border-t border-admin-outline-variant/20 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="min-h-[44px] rounded-xl border border-admin-outline-variant/40 bg-admin-surface-high/60 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-admin-on-surface transition hover:bg-admin-surface-highest/70"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-[44px] rounded-xl bg-gradient-to-r from-admin-primary-container to-admin-primary px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-admin-on-primary transition hover:opacity-95 disabled:opacity-60"
                >
                  {saving ? "Guardando..." : editingProduct ? "Actualizar producto" : "Crear producto"}
                </button>
              </div>
            </form>
          </article>
        </div>
      )}
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <article className="admin-panel rounded-[24px] p-5">
      <div className="flex items-center gap-4">
        <div className={cn("rounded-2xl bg-admin-surface-highest/70 p-3", accent)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-admin-outline">{label}</p>
          <p className="mt-1 font-headline text-2xl font-black text-admin-on-surface">{value}</p>
        </div>
      </div>
    </article>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-admin-outline">{label}</p>;
}
