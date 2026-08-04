import axios from "axios";
import type {
  Category,
  PaginatedResponse,
  Product,
  ProductFilters,
} from "../types/catalog";
import type { Cart } from "../types/cart";
import type { CheckoutFormData } from "../types/checkout";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: "CLIENT" | "ADMIN";
  };
};

export type CreateOrderPayload = {
  userId?: number;
  name: string;
  email: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
  paymentMethod: CheckoutFormData["paymentMethod"];
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
};

export type CreateOrderResponse = {
  success: boolean;
  order: {
    id: number;
    total: number;
    status: string;
    createdAt: string;
  };
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const IS_NGROK_BASE_URL = /ngrok-free\.app/i.test(API_BASE_URL);
const DEFAULT_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
};

if (IS_NGROK_BASE_URL) {
  DEFAULT_HEADERS["ngrok-skip-browser-warning"] = "true";
}

const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: DEFAULT_HEADERS,
});

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: DEFAULT_HEADERS,
});

authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("vibe-pulse-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function mapApiError(error: unknown): Error {
  if (axios.isAxiosError(error) && error.response) {
    if (error.response.status === 429) {
      return new Error("Exceso de peticiones, espere un momento");
    }

    const errData = error.response.data?.error;
    const errorMessage = typeof errData === "object" ? errData.message : errData;
    return new Error(errorMessage || "Error de servidor");
  }

  return new Error("Error de conexión con el servidor");
}

async function request<T>(path: string, body: object): Promise<T> {
  try {
    const { data } = await publicApi.post<T>(path, body);
    return data;
  } catch (error) {
    throw mapApiError(error);
  }
}

export async function requestGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  try {
    const { data } = await publicApi.get<T>(path, { params });
    return data;
  } catch (error) {
    throw mapApiError(error);
  }
}

export async function requestAuthGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  try {
    const { data } = await authApi.get<T>(path, { params });
    return data;
  } catch (error) {
    throw mapApiError(error);
  }
}

export async function requestAuth<T>(
  method: "post" | "put" | "patch" | "delete",
  path: string,
  body?: object
): Promise<T> {
  try {
    const { data } = await authApi.request<T>({
      method,
      url: path,
      data: body,
    });
    return data;
  } catch (error) {
    throw mapApiError(error);
  }
}

export function loginRequest(payload: LoginPayload) {
  return request<AuthResponse>("/api/auth/login", payload);
}

export function registerRequest(payload: RegisterPayload) {
  return request<AuthResponse>("/api/auth/register", payload);
}

export function getProductsRequest(filters: ProductFilters = {}) {
  return requestGet<{ success: boolean } & PaginatedResponse<Product>>(
    "/api/products",
    filters as Record<string, unknown>
  );
}

export function getFeaturedProductsRequest() {
  return requestGet<ApiResponse<Product[]>>("/api/products/featured");
}

export function getProductByIdRequest(id: number) {
  return requestGet<ApiResponse<Product>>(`/api/products/${id}`);
}

export function getCategoriesRequest() {
  return requestGet<ApiResponse<Category[]>>("/api/categories");
}

export function createCategoryRequest(payload: {
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
}) {
  return requestAuth<ApiResponse<Category>>("post", "/api/categories", payload);
}

export function createProductRequest(payload: {
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  imageUrl: string;
  stock: number;
  featured: boolean;
  badge?: string;
  categoryId: number;
}) {
  return requestAuth<ApiResponse<Product>>("post", "/api/products", payload);
}

export function updateProductRequest(
  id: number,
  payload: Partial<{
    name: string;
    description: string;
    price: number;
    comparePrice: number | null;
    imageUrl: string;
    stock: number;
    featured: boolean;
    badge: string | null;
    categoryId: number;
  }>
) {
  return requestAuth<ApiResponse<Product>>("put", `/api/products/${id}`, payload);
}

export function deleteProductRequest(id: number) {
  return requestAuth<{ success: boolean; message: string }>("delete", `/api/products/${id}`);
}

export function getCartRequest() {
  return requestAuthGet<ApiResponse<Cart>>("/api/cart");
}

export function addCartItemRequest(payload: {
  productId: number;
  quantity?: number;
  variantId?: number;
  color?: string;
  size?: string;
}) {
  return requestAuth<ApiResponse<Cart>>("post", "/api/cart/items", payload);
}

export function updateCartItemRequest(itemId: number, payload: { quantity: number }) {
  return requestAuth<ApiResponse<Cart>>("patch", `/api/cart/items/${itemId}`, payload);
}

export function removeCartItemRequest(itemId: number) {
  return requestAuth<ApiResponse<Cart>>("delete", `/api/cart/items/${itemId}`);
}

export function createOrderRequest(payload: CreateOrderPayload) {
  return requestAuth<CreateOrderResponse>("post", "/api/orders", payload);
}
