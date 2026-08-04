import { useNavigate } from "react-router-dom";
import { useCheckoutState } from "../context/CheckoutContext";

const pageClassName = "min-h-screen overflow-x-hidden bg-[#0f0f1a] bg-[radial-gradient(circle_at_1px_1px,#1e2740_1px,transparent_0)] px-3 py-4 [background-size:24px_24px] sm:px-4 sm:py-6 lg:px-10 lg:py-8";

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { lastOrder, resetCheckout } = useCheckoutState();

  if (!lastOrder) {
    return (
      <div className={pageClassName}>
        <div className="mx-auto max-w-4xl overflow-hidden rounded-[24px] border border-white/70 bg-white/50 shadow-soft backdrop-blur sm:rounded-[32px]">
          <header className="border-b border-line/80 px-4 py-4 sm:px-6 md:px-8">
            <span className="font-display text-base font-extrabold uppercase tracking-[0.12em] text-brand-600 sm:text-lg">Vibra Shop</span>
          </header>
          <main className="px-4 py-8 sm:px-6 sm:py-12 md:px-8">
            <div className="rounded-[24px] bg-white px-4 py-8 text-center shadow-soft sm:rounded-[28px] sm:px-6 sm:py-10">
              <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">No hay confirmación disponible</h1>
              <p className="mt-3 text-sm text-ink-700">Primero debes completar una compra en el checkout.</p>
              <button className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-brand-500 px-6 text-sm font-bold text-white transition hover:bg-brand-600" onClick={() => navigate("/cart")}>Ir al carrito</button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={pageClassName}>
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[24px] border border-white/70 bg-white/50 shadow-soft backdrop-blur sm:rounded-[32px]">
        <header className="flex flex-col gap-2 border-b border-line/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8">
          <span className="font-display text-base font-extrabold uppercase tracking-[0.12em] text-brand-600 sm:text-lg">Vibra Shop</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500 sm:text-xs">Compra confirmada</span>
        </header>

        <main className="px-4 py-8 sm:px-6 sm:py-10 md:px-8">
          <div className="rounded-[24px] bg-white px-4 py-8 text-center shadow-soft sm:rounded-[28px] sm:px-6 sm:py-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-4xl font-bold text-white">✓</div>
            <span className="mt-5 inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">Compra exitosa</span>
            <h1 className="mt-5 font-display text-3xl font-bold tracking-[-0.04em] text-ink-900 sm:text-4xl">Gracias por tu compra</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-ink-700">Tu pedido ha sido confirmado. Recibirás un correo con los detalles de la compra.</p>

            <div className="mx-auto mt-8 grid max-w-2xl gap-4 text-left md:grid-cols-2">
              <div className="rounded-2xl border border-line bg-shell p-4"><strong className="text-sm text-ink-900">Número de orden</strong><p className="mt-2 font-display text-2xl font-extrabold text-brand-600">#{lastOrder.id}</p></div>
              <div className="rounded-2xl border border-line bg-shell p-4"><strong className="text-sm text-ink-900">Fecha</strong><p className="mt-2 text-sm text-ink-700">{new Date(lastOrder.createdAt).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p></div>
              <div className="rounded-2xl border border-line bg-shell p-4 md:col-span-2"><strong className="text-sm text-ink-900">Total pagado</strong><p className="mt-2 font-display text-3xl font-extrabold text-ink-900">${lastOrder.total.toFixed(2)}</p></div>
              <div className="rounded-2xl border border-line bg-shell p-4 md:col-span-2">
                <strong className="text-sm text-ink-900">Productos</strong>
                <ul className="mt-3 space-y-2 text-sm text-ink-700">
                  {lastOrder.items.map((item) => (
                    <li key={item.id} className="flex flex-col gap-2 rounded-xl bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <span>{item.product.name} x {item.quantity}</span>
                      <span className="font-semibold text-ink-900 sm:text-right">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-brand-500 px-6 text-sm font-bold text-white transition hover:bg-brand-600" onClick={() => {
              resetCheckout();
              navigate("/cart");
            }}>
              Hacer otra compra
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
