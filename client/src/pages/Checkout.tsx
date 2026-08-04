import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrderForm } from "../components/checkout/OrderForm";
import { useCheckoutState } from "../context/CheckoutContext";
import { useCart } from "../context/CartContext";
import { createOrderRequest } from "../services/api";
import type { CompletedOrder } from "../types/checkout";

const pageClassName = "min-h-screen overflow-x-hidden bg-[#0f0f1a] bg-[radial-gradient(circle_at_1px_1px,#1e2740_1px,transparent_0)] px-3 py-4 [background-size:24px_24px] sm:px-4 sm:py-6 lg:px-10 lg:py-8";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, refreshCart } = useCart();
  const {
    formData,
    isFormValid,
    coupon,
    setCoupon,
    couponApplied,
    setCouponApplied,
    setLastOrder,
    resetCheckout,
  } = useCheckoutState();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const paymentMethod = formData?.paymentMethod ?? "tarjeta";

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [items]);
  const shipping = items.length > 0 ? 0 : 0;
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - discount;

  function handleFormChange() {
    setCouponMessage("");
  }

  function handleApplyCoupon() {
    if (coupon.trim().toUpperCase() !== "VIBRA10") {
      setCouponApplied(false);
      setCouponMessage("Código inválido. Usa VIBRA10 para el descuento simulado.");
      return;
    }

    setCouponApplied(true);
    setCouponMessage("Descuento aplicado correctamente.");
  }

  async function handleSubmit() {
    if (!formData || !isFormValid || items.length === 0 || isSubmitting) {
      return;
    }

    const completedFormData = formData as CompletedOrder["formData"];

    try {
      setIsSubmitting(true);
      setCouponMessage("");

      const result = await createOrderRequest({
        name: completedFormData.fullName,
        email: completedFormData.email,
        address: completedFormData.address,
        city: completedFormData.city,
        country: completedFormData.country,
        postalCode: completedFormData.postalCode,
        phone: completedFormData.phone,
        paymentMethod: completedFormData.paymentMethod,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.unitPrice,
        })),
      });

      setLastOrder({
        id: `VIBRA-${String(result.order?.id ?? Date.now()).slice(-8)}`,
        createdAt: result.order?.createdAt || new Date().toISOString(),
        items,
        subtotal,
        shipping,
        discount,
        total,
        formData: completedFormData,
      });

      await refreshCart();
      resetCheckout();
      navigate("/processing-payment");
    } catch (error) {
      setCouponMessage(error instanceof Error ? error.message : "No se pudo guardar la compra. Intenta nuevamente.");
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className={pageClassName}>
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[24px] border border-white/70 bg-white/50 shadow-soft backdrop-blur sm:rounded-[32px]">
          <header className="flex flex-col gap-2 border-b border-line/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span className="font-display text-base font-extrabold uppercase tracking-[0.12em] text-brand-600 sm:text-lg">Vibra Shop</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500 sm:text-xs">No hay productos para pagar</span>
          </header>

          <main className="px-4 py-8 sm:px-6 sm:py-12 md:px-10">
            <div className="mx-auto max-w-xl rounded-[24px] bg-white px-4 py-8 text-center shadow-soft sm:rounded-[28px] sm:px-6 sm:py-10">
              <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">No puedes confirmar una compra vacía</h1>
              <p className="mt-3 text-sm text-ink-700">Vuelve al carrito, agrega productos y completa el formulario para continuar.</p>
              <button className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl border border-line px-6 text-sm font-semibold text-ink-900 transition hover:bg-brand-50" onClick={() => navigate("/cart")}>
                Volver al carrito
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={pageClassName}>
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[24px] border border-white/70 bg-white/50 shadow-soft backdrop-blur sm:rounded-[32px]">
        <header className="flex flex-col gap-2 border-b border-line/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8">
          <span className="font-display text-base font-extrabold uppercase tracking-[0.12em] text-brand-600 sm:text-lg">Vibra Shop</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500 sm:text-xs">Pago seguro</span>
        </header>

        <main className="px-3 py-5 sm:px-5 sm:py-8 md:px-8 md:py-10">
          <div className="mb-5">
            <button className="inline-flex h-11 items-center justify-center rounded-2xl border border-line bg-white px-5 text-sm font-semibold text-ink-900 transition hover:bg-brand-50" onClick={() => navigate("/cart")}>
              Volver al carrito
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8">
            <section className="min-w-0">
              <OrderForm onFormChange={handleFormChange} />
            </section>

            <aside className="space-y-5 min-[1024px]:sticky min-[1024px]:top-6 min-[1024px]:self-start">
              <div className="rounded-[24px] bg-white px-4 py-5 shadow-soft sm:rounded-[28px] sm:px-5 sm:py-6">
                <h2 className="font-display text-xl font-bold italic tracking-[-0.03em] text-ink-900 sm:text-2xl">Tu Pedido</h2>

                <div className="mt-5 space-y-4 border-b border-line pb-5">
                  {items.map((item) => (
                    <article key={item.id} className="flex items-start gap-3">
                      <img
                        className="h-14 w-14 rounded-2xl border border-line object-cover"
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        onError={(event) => {
                          (event.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=700&q=80";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink-900">{item.product.name}</p>
                        <p className="text-xs text-ink-500">Talla: {item.size || "N/A"}</p>
                        <p className="text-xs text-ink-500">Color: {item.color || "N/A"}</p>
                        <p className="text-xs text-ink-500">Cantidad: {item.quantity}</p>
                      </div>
                      <strong className="shrink-0 text-sm font-bold text-ink-900">${(item.unitPrice * item.quantity).toFixed(2)}</strong>
                    </article>
                  ))}
                </div>

                <div className="mt-5 space-y-3 text-sm text-ink-700">
                  <div className="flex items-center justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="flex items-center justify-between"><span>Envío</span><span className="font-bold uppercase text-danger">Gratis</span></div>
                  <div className="flex items-center justify-between"><span>Método de pago</span><span className="font-semibold text-ink-900">{paymentMethod === "paypal" ? "PayPal" : "Tarjeta"}</span></div>
                  {couponApplied && <div className="flex items-center justify-between text-success"><span>Descuento</span><span>-${discount.toFixed(2)}</span></div>}
                  <div className="flex items-center justify-between border-t border-line pt-3 font-display text-xl font-extrabold text-brand-600 sm:text-2xl"><span>Total</span><span>${total.toFixed(2)}</span></div>
                </div>

                <button className="mt-5 flex h-14 w-full items-center justify-center rounded-2xl bg-brand-500 px-6 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[0_16px_30px_rgba(79,110,247,0.35)] transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none" onClick={() => void handleSubmit()} disabled={!isFormValid || items.length === 0 || isSubmitting}>
                  {isSubmitting ? "Procesando compra..." : paymentMethod === "paypal" ? "Pagar con PayPal" : "Finalizar compra"}
                </button>

                <p className="mt-3 text-center text-[11px] font-medium uppercase tracking-[0.1em] text-ink-500">Garantía de satisfacción 30 días</p>
              </div>

              <div className="rounded-[24px] border border-dashed border-rose-300 bg-white px-4 py-4 shadow-soft sm:rounded-[28px] sm:px-5 sm:py-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-rose-500">¿Tienes un código?</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input className="h-11 min-w-0 flex-1 rounded-2xl border border-line bg-[#f7f5ff] px-4 text-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100" value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="VIBRA10" disabled={couponApplied} />
                  <button className="h-11 rounded-2xl bg-rose-500 px-4 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300 sm:w-auto" onClick={handleApplyCoupon} disabled={couponApplied || coupon.trim() === ""}>
                    Aplicar
                  </button>
                </div>
                {couponMessage && <p className="mt-3 text-sm text-ink-700">{couponMessage}</p>}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
