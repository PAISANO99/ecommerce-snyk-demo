import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  addCartItemRequest,
  getCartRequest,
  removeCartItemRequest,
  updateCartItemRequest,
} from "../services/api";
import type { Cart, CartItem } from "../types/cart";

interface AddToCartPayload {
  productId: number;
  quantity?: number;
  variantId?: number;
  color?: string;
  size?: string;
}

interface CartContextValue {
  cart: Cart | null;
  items: CartItem[];
  loading: boolean;
  toast: string | null;
  totalItems: number;
  totalAmount: number;
  refreshCart: () => Promise<void>;
  addItem: (payload: AddToCartPayload) => Promise<void>;
  increment: (item: CartItem) => Promise<void>;
  decrement: (item: CartItem) => Promise<void>;
  remove: (itemId: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function hasAuthToken() {
    return Boolean(localStorage.getItem("vibe-pulse-token"));
  }

  function triggerToast(message: string) {
    setToast(message);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 2600);
  }

  async function refreshCart() {
    if (!hasAuthToken()) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      const response = await getCartRequest();
      setCart(response.data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }

  async function addItem(payload: AddToCartPayload) {
    const response = await addCartItemRequest(payload);
    setCart(response.data);
    triggerToast("Producto agregado al carrito");
  }

  async function increment(item: CartItem) {
    const response = await updateCartItemRequest(item.id, { quantity: item.quantity + 1 });
    setCart(response.data);
  }

  async function decrement(item: CartItem) {
    if (item.quantity <= 1) {
      await remove(item.id);
      return;
    }

    const response = await updateCartItemRequest(item.id, { quantity: item.quantity - 1 });
    setCart(response.data);
  }

  async function remove(itemId: number) {
    const response = await removeCartItemRequest(itemId);
    setCart(response.data);
  }

  useEffect(() => {
    void refreshCart();

    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const items = cart?.items ?? [];
    return {
      cart,
      items,
      loading,
      toast,
      totalItems: items.reduce((acc, item) => acc + item.quantity, 0),
      totalAmount: cart?.total ?? 0,
      refreshCart,
      addItem,
      increment,
      decrement,
      remove,
    };
  }, [cart, loading, toast]);

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
}
