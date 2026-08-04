import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useProduct } from "../hooks/useCatalog";
import MainStoreLayout from "../layouts/MainStoreLayout";

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

const DEFAULT_COLORS = ["Negro", "Blanco", "Azul", "Rojo", "Verde"];
const APPAREL_SIZES = ["XS", "S", "M", "L", "XL"];
const SHOE_SIZES_US = ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"];
const NO_SIZE_CATEGORIES = ["Accesorios", "Bolsos"];
const SHOE_CATEGORIES = ["Calzado"];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, items } = useCart();

  const parsedId = Number(id);
  const { product, loading, error } = useProduct(parsedId);

  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_COLORS[0]);
  const [selectedSize, setSelectedSize] = useState<string>(APPAREL_SIZES[2]);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const availableSizes = useMemo(() => {
    const category = product?.category?.name;
    if (!category) return APPAREL_SIZES;
    if (NO_SIZE_CATEGORIES.includes(category)) return [];
    if (SHOE_CATEGORIES.includes(category)) return SHOE_SIZES_US;
    return APPAREL_SIZES;
  }, [product?.category?.name]);

  const needsSize = availableSizes.length > 0;

  useEffect(() => {
    if (!needsSize) {
      setSelectedSize("");
      return;
    }

    if (!availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[Math.floor(availableSizes.length / 2)] ?? "");
    }
  }, [availableSizes, needsSize, selectedSize]);

  const qtyInCart = items
    .filter(
      (item) =>
        item.productId === product?.id &&
        (item.color ?? "") === selectedColor &&
        (item.size ?? "") === (needsSize ? selectedSize : "")
    )
    .reduce((acc, item) => acc + item.quantity, 0);

  const availableStock = product?.stock ?? 0;
  const stockReached = availableStock > 0 && qtyInCart >= availableStock;

  async function handleAddToCart() {
    if (!product) return;

    try {
      setSubmitting(true);
      setActionError(null);

      await addItem({
        productId: product.id,
        quantity: 1,
        color: selectedColor,
        size: needsSize ? selectedSize : undefined,
      });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo agregar al carrito");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MainStoreLayout>
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
        <div className="mb-4 text-sm text-slate-600">
          <Link to="/home" className="hover:underline">
            Inicio
          </Link>{" "}
          /{" "}
          <Link to="/catalogo" className="hover:underline">
            Catálogo
          </Link>
        </div>

        {loading && (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="aspect-[4/3] animate-pulse rounded-xl bg-slate-200" />
            <div className="space-y-3 rounded-xl border bg-white p-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-4 animate-pulse rounded bg-slate-200" />
              ))}
            </div>
          </div>
        )}

        {!loading && (error || !product) && (
          <div className="rounded-xl border bg-white p-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900">Producto no encontrado</h2>
            <p className="mt-2 text-slate-600">{error ?? "No existe este producto."}</p>
            <button
              className="mt-5 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => navigate("/catalogo")}
            >
              Volver al catálogo
            </button>
          </div>
        )}

        {product && (
          <div className="grid gap-6 md:grid-cols-2">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="aspect-[4/3] w-full rounded-xl border object-cover"
              onError={(event) => {
                (event.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=700&q=80";
              }}
            />

            <div className="rounded-xl border bg-white p-6">
              {product.category?.name && (
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                  {product.category.name}
                </p>
              )}
              <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">{product.name}</h1>
              {product.description && <p className="mt-3 text-slate-600">{product.description}</p>}

              <div className="mt-5 flex items-center gap-3">
                <p className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{formatPrice(product.price)}</p>
                {product.comparePrice && (
                  <p className="text-lg text-slate-400 line-through">{formatPrice(product.comparePrice)}</p>
                )}
              </div>

              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                Stock disponible: <strong>{product.stock}</strong>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Color</p>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                        className={`min-h-[44px] rounded-xl border px-3 py-2 text-sm ${selectedColor === color ? "border-slate-900 bg-slate-900 text-white" : "hover:bg-slate-100"}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {needsSize && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Talla</p>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        className={`min-h-[44px] rounded-xl border px-3 py-2 text-sm ${selectedSize === size ? "border-slate-900 bg-slate-900 text-white" : "hover:bg-slate-100"}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {stockReached && (
                <p className="mt-3 text-xs font-semibold text-amber-600">
                  Ya agregaste el máximo disponible de esta combinación.
                </p>
              )}
              {actionError && <p className="mt-3 text-xs font-semibold text-rose-600">{actionError}</p>}

              <button
                 className="mt-5 min-h-[44px] w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                 disabled={product.stock <= 0 || stockReached || submitting}
                 onClick={() => void handleAddToCart()}
               >
                {submitting
                  ? "Agregando..."
                  : product.stock <= 0
                    ? "Producto agotado"
                    : stockReached
                      ? "Límite alcanzado"
                      : "Agregar al carrito"}
              </button>

              <Link
                to="/cart"
                className="mt-3 inline-block text-sm font-semibold text-rose-600 hover:underline"
              >
                Ver carrito
              </Link>
            </div>
          </div>
        )}
      </section>
    </MainStoreLayout>
  );
}
