import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCheckoutState } from "../context/CheckoutContext";

const pageClassName = "min-h-screen overflow-x-hidden bg-[#0f0f1a] bg-[radial-gradient(circle_at_1px_1px,#1e2740_1px,transparent_0)] px-3 py-4 [background-size:24px_24px] sm:px-4 sm:py-6 lg:px-10 lg:py-8";

export default function PurchaseAlertPage() {
  const navigate = useNavigate();
  const { lastOrder } = useCheckoutState();

  const totalItems = lastOrder?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  useEffect(() => {
    if (!lastOrder) {
      navigate("/cart", { replace: true });
    }
  }, [lastOrder, navigate]);

  if (!lastOrder) {
    return null;
  }

  return (
    <div className={pageClassName}>
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[24px] border border-white/70 bg-white/50 shadow-soft backdrop-blur sm:rounded-[32px]">
        <header className="flex flex-col gap-2 border-b border-line/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8">
          <span className="font-display text-base font-extrabold uppercase tracking-[0.12em] text-brand-600 sm:text-lg">Vibra Shop</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500 sm:text-xs">Alerta de compra</span>
        </header>

        <main className="px-4 py-8 sm:px-6 sm:py-12 md:px-8">
          <div className="rounded-[24px] bg-white px-4 py-8 text-center shadow-soft sm:rounded-[28px] sm:px-6 sm:py-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-400 text-4xl font-bold text-white shadow-lg">!</div>
            <h1 className="mt-6 font-display text-3xl font-bold tracking-[-0.04em] text-ink-900 sm:text-4xl">Compra aprobada</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-ink-700">Tu pago fue validado correctamente. La orden <strong>#{lastOrder.id}</strong> ya fue registrada y está lista para mostrar la confirmación final.</p>
            <div className="mx-auto mt-8 grid max-w-2xl gap-4 text-left md:grid-cols-3">
              <div className="rounded-2xl border border-line bg-shell p-4"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500">Estado</p><p className="mt-2 text-sm font-semibold text-success">Pago autorizado</p></div>
              <div className="rounded-2xl border border-line bg-shell p-4"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500">Total</p><p className="mt-2 text-sm font-semibold text-ink-900">${lastOrder.total.toFixed(2)}</p></div>
              <div className="rounded-2xl border border-line bg-shell p-4"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500">Productos</p><p className="mt-2 text-sm font-semibold text-ink-900">{totalItems} item(s)</p></div>
            </div>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button className="inline-flex h-12 items-center justify-center rounded-2xl border border-line bg-white px-6 text-sm font-semibold text-ink-900 transition hover:bg-brand-50" onClick={() => navigate("/cart")}>Volver al carrito</button>
              <button className="inline-flex h-12 items-center justify-center rounded-2xl bg-brand-500 px-6 text-sm font-bold text-white transition hover:bg-brand-600" onClick={() => navigate("/confirmation", { replace: true })}>Ver confirmación final</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
