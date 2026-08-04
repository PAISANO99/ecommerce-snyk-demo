import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCheckoutState } from "../context/CheckoutContext";

const pageClassName = "min-h-screen overflow-x-hidden bg-[#0f0f1a] bg-[radial-gradient(circle_at_1px_1px,#1e2740_1px,transparent_0)] px-3 py-4 [background-size:24px_24px] sm:px-4 sm:py-6 lg:px-10 lg:py-8";

export default function ProcessingPaymentPage() {
  const navigate = useNavigate();
  const { lastOrder } = useCheckoutState();
  const [progress, setProgress] = useState(12);
  const [stage, setStage] = useState("Validando método de pago...");

  useEffect(() => {
    if (!lastOrder) {
      navigate("/cart", { replace: true });
      return;
    }

    const progressTimer = window.setInterval(() => {
      setProgress((current) => (current >= 92 ? current : current + 8));
    }, 180);

    const stageOne = window.setTimeout(() => setStage("Confirmando disponibilidad de inventario..."), 700);
    const stageTwo = window.setTimeout(() => setStage("Generando la aprobación segura de la compra..."), 1400);
    const redirectTimer = window.setTimeout(() => navigate("/purchase-alert", { replace: true }), 1800);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(stageOne);
      window.clearTimeout(stageTwo);
      window.clearTimeout(redirectTimer);
    };
  }, [lastOrder, navigate]);

  return (
    <div className={pageClassName}>
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[24px] border border-white/70 bg-white/50 shadow-soft backdrop-blur sm:rounded-[32px]">
        <header className="flex flex-col gap-2 border-b border-line/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8">
          <span className="font-display text-base font-extrabold uppercase tracking-[0.12em] text-brand-600 sm:text-lg">Vibra Shop</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500 sm:text-xs">Procesando pago</span>
        </header>

        <main className="px-4 py-10 sm:px-6 sm:py-16 md:px-8">
          <div className="rounded-[24px] bg-white px-4 py-10 text-center shadow-soft sm:rounded-[28px] sm:px-6 sm:py-14">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" />
            <h1 className="mt-8 font-display text-3xl font-bold tracking-[-0.04em] text-ink-900 sm:text-4xl">Estamos procesando tu compra</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-700">{stage}</p>
            <div className="mx-auto mt-8 max-w-xl">
              <div className="h-3 overflow-hidden rounded-full bg-brand-100">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-medium uppercase tracking-[0.12em] text-ink-500">
                <span>Preparando orden</span>
                <span>{progress}%</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
