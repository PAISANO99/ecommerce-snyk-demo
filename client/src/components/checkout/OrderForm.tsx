import { useCheckoutState } from "../../context/CheckoutContext";
import { useFormValidation } from "../../hooks/useFormValidation";
import type { CheckoutFormSchema } from "../../schemas/checkoutSchema";

export type FormData = CheckoutFormSchema;

type OrderFormProps = {
  onFormChange?: (data: CheckoutFormSchema, isValid: boolean) => void;
};

const COUNTRIES = ["Colombia", "España", "México", "Argentina", "Chile", "Perú", "Ecuador", "Uruguay"];
const labelClass = "mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-700";
const inputClass = "h-12 w-full min-w-0 rounded-2xl border border-line bg-[#f1efff] px-4 text-sm text-ink-900 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100";
const errorClass = "mt-2 block text-xs font-medium text-danger";
const sectionClass = "rounded-[24px] border border-white/70 bg-white/55 p-4 shadow-soft backdrop-blur sm:p-5 md:rounded-[28px] md:p-7";

export function OrderForm({ onFormChange }: OrderFormProps) {
  const { formData: savedFormData, setFormData: saveFormData, setIsFormValid: setSavedIsFormValid } = useCheckoutState();
  const { formData, errors, handleChange, handleBlur } = useFormValidation({
    initialData: savedFormData,
    onFormChange: (data, isValid) => {
      saveFormData(data);
      setSavedIsFormValid(isValid);
      onFormChange?.(data, isValid);
    },
  });

  const isCardPayment = formData.paymentMethod === "tarjeta";

  return (
    <div className="space-y-6">
      <section className={sectionClass}>
        <div className="mb-5 flex items-start gap-3 sm:gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-400 font-display text-sm font-bold text-white">1</span>
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-ink-900 sm:text-[28px]">Datos Personales</h2>
            <p className="text-sm text-ink-700">Todos los campos marcados con * son obligatorios.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="fullName">Nombre completo *</label>
            <input className={inputClass} id="fullName" value={formData.fullName} onChange={(event) => handleChange("fullName", event.target.value)} onBlur={() => handleBlur("fullName")} placeholder="Ej. Mateo García" />
            {errors.fullName && <span className={errorClass}>{errors.fullName}</span>}
          </div>

          <div>
            <label className={labelClass} htmlFor="email">Correo electrónico *</label>
            <input className={inputClass} id="email" type="email" value={formData.email} onChange={(event) => handleChange("email", event.target.value)} onBlur={() => handleBlur("email")} placeholder="mateo@vibrashop.com" />
            {errors.email && <span className={errorClass}>{errors.email}</span>}
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="phone">Número de contacto *</label>
          <input className={inputClass} id="phone" type="tel" value={formData.phone} onChange={(event) => handleChange("phone", event.target.value.replace(/\D/g, "").slice(0, 10))} onBlur={() => handleBlur("phone")} placeholder="3001234567" />
          {errors.phone && <span className={errorClass}>{errors.phone}</span>}
        </div>
      </section>

      <section className={sectionClass}>
        <div className="mb-5 flex items-start gap-3 sm:gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-400 font-display text-sm font-bold text-white">2</span>
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-ink-900 sm:text-[28px]">Dirección de Envío</h2>
            <p className="text-sm text-ink-700">Verifica tus datos antes de finalizar la compra.</p>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="address">Calle y número *</label>
          <input className={inputClass} id="address" value={formData.address} onChange={(event) => handleChange("address", event.target.value)} onBlur={() => handleBlur("address")} placeholder="Av. de la Libertad 123, Depto 4B" />
          {errors.address && <span className={errorClass}>{errors.address}</span>}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <label className={labelClass} htmlFor="city">Ciudad *</label>
            <input className={inputClass} id="city" value={formData.city} onChange={(event) => handleChange("city", event.target.value)} onBlur={() => handleBlur("city")} placeholder="Bogotá" />
            {errors.city && <span className={errorClass}>{errors.city}</span>}
          </div>

          <div>
            <label className={labelClass} htmlFor="postalCode">C. postal *</label>
            <input className={inputClass} id="postalCode" value={formData.postalCode} onChange={(event) => handleChange("postalCode", event.target.value.replace(/\D/g, "").slice(0, 10))} onBlur={() => handleBlur("postalCode")} placeholder="110111" />
            {errors.postalCode && <span className={errorClass}>{errors.postalCode}</span>}
          </div>

          <div>
            <label className={labelClass} htmlFor="country">País *</label>
            <select className={inputClass} id="country" value={formData.country} onChange={(event) => handleChange("country", event.target.value)} onBlur={() => handleBlur("country")}>
              <option value="">Selecciona un país</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            {errors.country && <span className={errorClass}>{errors.country}</span>}
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="mb-5 flex items-start gap-3 sm:gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-400 font-display text-sm font-bold text-white">3</span>
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-ink-900 sm:text-[28px]">Método de Pago</h2>
            <p className="text-sm text-ink-700">El pago es simulado y la interfaz permanece en español.</p>
          </div>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-2">
          <button type="button" className={`flex h-12 items-center justify-center rounded-2xl border text-sm font-semibold transition ${isCardPayment ? "border-brand-500 bg-white text-brand-700 shadow-[inset_0_0_0_1px_rgba(79,110,247,0.12)]" : "border-line bg-[#f1efff] text-ink-700 hover:bg-white"}`} onClick={() => handleChange("paymentMethod", "tarjeta")}>
            Tarjeta
          </button>
          <button type="button" className={`flex h-12 items-center justify-center rounded-2xl border text-sm font-semibold transition ${!isCardPayment ? "border-brand-500 bg-white text-brand-700 shadow-[inset_0_0_0_1px_rgba(79,110,247,0.12)]" : "border-line bg-[#f1efff] text-ink-700 hover:bg-white"}`} onClick={() => handleChange("paymentMethod", "paypal")}>
            PayPal
          </button>
        </div>

        {isCardPayment ? (
          <div className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="cardNumber">Número de tarjeta *</label>
              <input className={inputClass} id="cardNumber" value={formData.cardNumber} onChange={(event) => handleChange("cardNumber", event.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "))} onBlur={() => handleBlur("cardNumber")} placeholder="0000 0000 0000 0000" />
              {errors.cardNumber && <span className={errorClass}>{errors.cardNumber}</span>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="cardExpiry">Vencimiento *</label>
                <input className={inputClass} id="cardExpiry" value={formData.cardExpiry} onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
                  handleChange("cardExpiry", digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits);
                }} onBlur={() => handleBlur("cardExpiry")} placeholder="MM / AA" />
                {errors.cardExpiry && <span className={errorClass}>{errors.cardExpiry}</span>}
              </div>

              <div>
                <label className={labelClass} htmlFor="cardCvc">CVC *</label>
                <input className={inputClass} id="cardCvc" value={formData.cardCvc} onChange={(event) => handleChange("cardCvc", event.target.value.replace(/\D/g, "").slice(0, 4))} onBlur={() => handleBlur("cardCvc")} placeholder="123" />
                {errors.cardCvc && <span className={errorClass}>{errors.cardCvc}</span>}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-brand-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <p className="font-display text-2xl font-bold leading-tight tracking-[-0.04em] text-ink-900 sm:text-[32px]">Compra y envía dinero a todo el mundo de forma rápida y sencilla.</p>
              <div className="w-fit rounded-2xl bg-[#003087] px-4 py-2 text-sm font-bold text-white shadow-sm">PayPal</div>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="paypal-country" className={labelClass}>
                  País o región de PayPal
                </label>
                <select id="paypal-country" className={inputClass} value={formData.paypalCountry} onChange={(event) => handleChange("paypalCountry", event.target.value)} onBlur={() => handleBlur("paypalCountry")}>
                  <option value="">País/región</option>
                  {COUNTRIES.map((country) => (
                    <option key={`paypal-${country}`} value={country}>{country}</option>
                  ))}
                </select>
                {errors.paypalCountry && <span className={errorClass}>{errors.paypalCountry}</span>}
              </div>
              <div>
                <label htmlFor="paypal-first-name" className={labelClass}>
                  Nombre
                </label>
                <input id="paypal-first-name" className={inputClass} value={formData.paypalFirstName} onChange={(event) => handleChange("paypalFirstName", event.target.value)} onBlur={() => handleBlur("paypalFirstName")} placeholder="Nombre" />
                {errors.paypalFirstName && <span className={errorClass}>{errors.paypalFirstName}</span>}
              </div>
              <div>
                <label htmlFor="paypal-last-name" className={labelClass}>
                  Apellidos
                </label>
                <input id="paypal-last-name" className={inputClass} value={formData.paypalLastName} onChange={(event) => handleChange("paypalLastName", event.target.value)} onBlur={() => handleBlur("paypalLastName")} placeholder="Apellidos" />
                {errors.paypalLastName && <span className={errorClass}>{errors.paypalLastName}</span>}
              </div>
              <div>
                <label htmlFor="paypal-email" className={labelClass}>
                  Correo electrónico
                </label>
                <input id="paypal-email" className={inputClass} type="email" value={formData.paypalEmail} onChange={(event) => handleChange("paypalEmail", event.target.value)} onBlur={() => handleBlur("paypalEmail")} placeholder="Dirección de correo electrónico" />
                {errors.paypalEmail && <span className={errorClass}>{errors.paypalEmail}</span>}
              </div>
              <div>
                <label htmlFor="paypal-password" className={labelClass}>
                  Crear contraseña
                </label>
                <input id="paypal-password" className={inputClass} type="password" value={formData.paypalPassword} onChange={(event) => handleChange("paypalPassword", event.target.value)} onBlur={() => handleBlur("paypalPassword")} placeholder="Crear contraseña" />
                {errors.paypalPassword && <span className={errorClass}>{errors.paypalPassword}</span>}
              </div>
              <div>
                <label htmlFor="paypal-password-confirm" className={labelClass}>
                  Confirmar contraseña
                </label>
                <input id="paypal-password-confirm" className={inputClass} type="password" value={formData.paypalPasswordConfirm} onChange={(event) => handleChange("paypalPasswordConfirm", event.target.value)} onBlur={() => handleBlur("paypalPasswordConfirm")} placeholder="Confirmar contraseña" />
                {errors.paypalPasswordConfirm && <span className={errorClass}>{errors.paypalPasswordConfirm}</span>}
              </div>
              <div className="rounded-2xl border border-dashed border-brand-300 bg-brand-50 px-4 py-3 text-sm text-brand-700">
                Este formulario es simulado. Al hacer clic en <strong>Pagar con PayPal</strong>, el sistema aprobará la compra como si PayPal hubiese validado la cuenta.
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
