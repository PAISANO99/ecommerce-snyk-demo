import type { Product } from "../../types/catalog";
import ProductCard from "./ProductCard";

interface Props {
  products: Product[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function ProductGrid({
  products,
  loading = false,
  emptyMessage = "No hay productos disponibles.",
}: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border bg-white">
            <div className="aspect-[4/3] animate-pulse bg-slate-200" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-8 w-full animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <p className="rounded-xl border bg-white p-8 text-center text-slate-600">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
