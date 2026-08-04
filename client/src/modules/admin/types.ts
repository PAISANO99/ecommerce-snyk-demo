export const ADMIN_ORDER_STATUSES = [
  "pendiente",
  "pagado",
  "enviado",
  "entregado",
  "cancelado",
] as const;

export type AdminOrderStatus = (typeof ADMIN_ORDER_STATUSES)[number];

export type AdminDashboardMetrics = {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  ordersByStatus: Record<string, number>;
};

export type AdminOrderItem = {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    imageUrl: string;
  };
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: "CLIENT" | "ADMIN" | string;
  createdAt: string;
};

export type AdminLayoutContext = {
  searchQuery: string;
};

export type AdminOrder = {
  id: number;
  total: number;
  status: AdminOrderStatus | string;
  createdAt: string;
  name: string;
  email: string;
  city: string;
  country: string;
  paymentMethod: string;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  items: AdminOrderItem[];
};

export type AdminPaginatedResponse<T> = {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
