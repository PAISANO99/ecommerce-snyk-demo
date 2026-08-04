import { useNavigate } from "react-router-dom";
import type { Product } from "../../types/catalog";

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate();

  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="aspect-[4/3] w-full object-cover"
        onError={(event) => {
          (event.target as HTMLImageElement).src =
            "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=700&q=80";
        }}
      />
      <div className="space-y-2 p-4 sm:p-5">
        {product.category?.name && (
          <span className="text-xs font-semibold uppercase tracking-wide text-rose-600">
            {product.category.name}
          </span>
        )}
        <h3 className="line-clamp-2 text-base font-bold text-slate-900">{product.name}</h3>
        <p className="text-lg font-extrabold text-slate-900">{formatPrice(product.price)}</p>
        <button
          className="min-h-[44px] w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          onClick={() => navigate(`/products/${product.id}`)}
        >
          Ver detalle
        </button>
      </div>
    </article>
  );
}
