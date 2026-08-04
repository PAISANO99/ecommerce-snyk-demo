import type { CartItem } from "./cart";

export type CheckoutFormData = {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  paymentMethod: "tarjeta" | "paypal";
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  paypalCountry: string;
  paypalFirstName: string;
  paypalLastName: string;
  paypalEmail: string;
  paypalPassword: string;
  paypalPasswordConfirm: string;
};

export type CompletedOrder = {
  id: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  formData: CheckoutFormData;
};
