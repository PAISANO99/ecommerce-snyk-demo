import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CheckoutFormSchema } from "../schemas/checkoutSchema";
import type { CompletedOrder } from "../types/checkout";

type CheckoutContextType = {
  formData: CheckoutFormSchema | null;
  setFormData: (data: CheckoutFormSchema | null) => void;
  isFormValid: boolean;
  setIsFormValid: (valid: boolean) => void;
  coupon: string;
  setCoupon: (code: string) => void;
  couponApplied: boolean;
  setCouponApplied: (applied: boolean) => void;
  lastOrder: CompletedOrder | null;
  setLastOrder: (order: CompletedOrder | null) => void;
  resetCheckout: () => void;
};

const STORAGE_KEY = "vibra_checkout_data";

type StoredCheckoutState = {
  formData: CheckoutFormSchema | null;
  isFormValid: boolean;
  coupon: string;
  couponApplied: boolean;
  lastOrder: CompletedOrder | null;
};

const defaultState: StoredCheckoutState = {
  formData: null,
  isFormValid: false,
  coupon: "",
  couponApplied: false,
  lastOrder: null,
};

const CheckoutContext = createContext<CheckoutContextType | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [formData, setFormDataState] = useState<CheckoutFormSchema | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [lastOrder, setLastOrderState] = useState<CompletedOrder | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as StoredCheckoutState;
        setFormDataState(parsed.formData || defaultState.formData);
        setIsFormValid(parsed.isFormValid || defaultState.isFormValid);
        setCoupon(parsed.coupon || defaultState.coupon);
        setCouponApplied(parsed.couponApplied || defaultState.couponApplied);
        setLastOrderState(parsed.lastOrder || defaultState.lastOrder);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ formData, isFormValid, coupon, couponApplied, lastOrder })
    );
  }, [coupon, couponApplied, formData, isFormValid, lastOrder, ready]);

  return (
    <CheckoutContext.Provider
      value={{
        formData,
        setFormData: setFormDataState,
        isFormValid,
        setIsFormValid,
        coupon,
        setCoupon,
        couponApplied,
        setCouponApplied,
        lastOrder,
        setLastOrder: setLastOrderState,
        resetCheckout: () => {
          setFormDataState(null);
          setIsFormValid(false);
          setCoupon("");
          setCouponApplied(false);
        },
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckoutState() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckoutState debe usarse dentro de CheckoutProvider");
  }

  return context;
}
