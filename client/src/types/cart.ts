import type { Product } from "./catalog";

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  variantId?: number | null;
  lineKey: string;
  color?: string | null;
  size?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: Product;
  variant?: {
    id: number;
    name: string;
    color?: string | null;
    size?: string | null;
    price: number;
    stock: number;
  } | null;
}

export interface Cart {
  id: number;
  userId: number;
  total: number;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}
