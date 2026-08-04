import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CatalogFilters from "../components/catalog/CatalogFilters";
import ProductGrid from "../components/catalog/ProductGrid";
import { useCategories, useProducts } from "../hooks/useCatalog";
import MainStoreLayout from "../layouts/MainStoreLayout";

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState("default");
  const [filtersOpen, setFiltersOpen] = useState(true);

  const initialCategoryId = searchParams.get("categoryId");
  const initialSearch = searchParams.get("search");
  const initialFeatured = searchParams.get("featured");

  const { products, loading, error, filters, updateFilters, setPage } = useProducts({
    categoryId: initialCategoryId ? Number(initialCategoryId) : undefined,
    search: initialSearch ?? undefined,
    featured: initialFeatured === "true" ? true : undefined,
    page: 1,
    limit: 12,
  });

  const { categories } = useCategories();

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.set("categoryId", String(filters.categoryId));
    if (filters.search) params.set("search", filters.search);
    if (filters.featured) params.set("featured", "true");
    setSearchParams(params);
  }, [filters.categoryId, filters.featured, filters.search, setSearchParams]);

  const sortedProducts = useMemo(() => {
    if (!products) return [];
    const data = [...products.data];
    if (sort === "price_asc") return data.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") return data.sort((a, b) => b.price - a.price);
    if (sort === "newest") {
      return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return data;
  }, [products, sort]);

  return (
    <MainStoreLayout>
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-8">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-white text-lg font-bold text-slate-600 hover:bg-slate-50"
              title={filtersOpen ? "Ocultar filtros" : "Mostrar filtros"}
              aria-label={filtersOpen ? "Ocultar filtros" : "Mostrar filtros"}
            >
              ☰
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Catálogo</h1>
              {filters.search && (
                <p className="mt-1 break-words text-sm text-slate-500">Resultados para: <b>{filters.search}</b></p>
              )}
            </div>
          </div>

          <div className="w-full md:w-auto">
            <label htmlFor="catalog-sort" className="sr-only">
              Ordenar productos del catálogo
            </label>
            <select
              id="catalog-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="min-h-[44px] w-full rounded-xl border px-3 py-2 text-sm md:w-auto"
            >
              <option value="default">Relevancia</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
              <option value="newest">Más recientes</option>
            </select>
          </div>
        </div>

        <div className={filtersOpen ? "grid gap-5 lg:grid-cols-[270px_minmax(0,1fr)]" : "grid gap-5"}>
          {filtersOpen && (
            <CatalogFilters
              categories={categories}
              filters={filters}
              onFilterChange={updateFilters}
            />
          )}

          <div className="space-y-4">
            {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <ProductGrid
              products={sortedProducts}
              loading={loading}
              emptyMessage={
                filters.search
                  ? `No se encontraron productos para "${filters.search}".`
                  : "No hay productos para el filtro seleccionado."
              }
            />

            {products && products.totalPages > 1 && (
              <div className="flex flex-col items-stretch justify-center gap-2 pt-2 sm:flex-row sm:items-center">
                <button
                  disabled={products.page === 1}
                  onClick={() => setPage(products.page - 1)}
                  className="min-h-[44px] rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-center text-sm text-slate-700">
                  Página {products.page} de {products.totalPages}
                </span>
                <button
                  disabled={products.page === products.totalPages}
                  onClick={() => setPage(products.page + 1)}
                  className="min-h-[44px] rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </MainStoreLayout>
  );
}
