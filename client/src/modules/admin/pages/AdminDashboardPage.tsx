import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Download,
  Layers,
  ShoppingBasket,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { getAdminDashboardMetricsRequest, getAdminOrdersRequest } from "../services/adminApi";
import type { AdminDashboardMetrics, AdminOrder } from "../types";
import { cn } from "../../../lib/cn";
import { formatCurrencyCOP, formatMonthShort, formatShortDate } from "../utils/format";

const statusMeta: Record<string, { label: string; color: string; badge: string }> = {
  pendiente: { label: "Pendiente", color: "#ffb692", badge: "bg-amber-500/10 text-amber-300" },
  pagado: { label: "Pagado", color: "#bbc5eb", badge: "bg-sky-500/10 text-sky-300" },
  enviado: { label: "Enviado", color: "#8b9cff", badge: "bg-violet-500/10 text-violet-300" },
  entregado: { label: "Entregado", color: "#4361ee", badge: "bg-emerald-500/10 text-emerald-300" },
  cancelado: { label: "Cancelado", color: "#ff8f8f", badge: "bg-rose-500/10 text-rose-300" },
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const [metricsResponse, ordersResponse] = await Promise.all([
          getAdminDashboardMetricsRequest(),
          getAdminOrdersRequest({ page: 1, limit: 60 }),
        ]);

        setMetrics(metricsResponse.data);
        setRecentOrders(ordersResponse.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar las métricas");
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const summaryCards = useMemo(
    () => [
      {
        title: "Total ventas",
        value: formatCurrencyCOP(metrics?.totalRevenue ?? 0),
        change: "+12%",
        subtitle: "VS. EL RITMO ACTUAL",
        icon: TrendingUp,
        iconColor: "text-admin-primary",
        iconBg: "bg-admin-primary/10",
      },
      {
        title: "Pedidos totales",
        value: String(metrics?.totalOrders ?? 0),
        change: `${recentOrders.length} recientes`,
        subtitle: "TRANSACCIONES REGISTRADAS",
        icon: ShoppingBasket,
        iconColor: "text-admin-secondary",
        iconBg: "bg-admin-secondary/10",
        onClick: () => navigate("/admin/orders"),
      },
      {
        title: "Usuarios",
        value: String(metrics?.totalUsers ?? 0),
        change: "Clientes activos",
        subtitle: "BASE REGISTRADA",
        icon: UserPlus,
        iconColor: "text-admin-tertiary",
        iconBg: "bg-admin-tertiary/10",
      },
      {
        title: "Productos",
        value: String(metrics?.totalProducts ?? 0),
        change: `${metrics?.lowStockProducts ?? 0} stock bajo`,
        subtitle: "CATÁLOGO DISPONIBLE",
        icon: Layers,
        iconColor: "text-admin-outline",
        iconBg: "bg-admin-outline/10",
      },
    ],
    [metrics, navigate, recentOrders.length]
  );

  const statusData = useMemo(() => {
    const statuses = metrics?.ordersByStatus ?? {};

    return Object.entries(statuses).map(([status, value]) => ({
      name: statusMeta[status]?.label ?? status,
      value,
      color: statusMeta[status]?.color ?? "#8e8fa1",
    }));
  }, [metrics]);

  const totalOrdersByStatus = useMemo(
    () => statusData.reduce((total, item) => total + item.value, 0),
    [statusData]
  );

  const salesData = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;

        return {
          key,
          name: formatMonthShort(date),
          value: 0,
        };
    });

    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

    recentOrders.forEach((order) => {
      const createdAt = new Date(order.createdAt);
      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      const bucket = bucketMap.get(key);

      if (bucket) {
        bucket.value += order.total;
      }
    });

    return buckets;
  }, [recentOrders]);

  const recentOrdersRows = useMemo(() => recentOrders.slice(0, 5), [recentOrders]);

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="font-headline text-[1.85rem] font-extrabold leading-[1.05] tracking-tight text-admin-on-surface sm:text-3xl">
            Dashboard general
          </h3>
          <p className="mt-1 text-sm text-admin-on-surface-variant">
            Vista consolidada del comportamiento comercial y operativo.
          </p>
        </div>

        <div className="grid gap-2 sm:flex sm:flex-row sm:items-center sm:gap-3">
          <span className="rounded-xl border border-admin-outline-variant/40 bg-admin-surface-high/60 px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-admin-primary sm:px-4 sm:py-3 sm:text-xs sm:tracking-[0.22em]">
            Hoy · {formatShortDate(new Date())}
          </span>
          <button
            type="button"
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-admin-outline-variant/40 bg-admin-surface-high/60 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-admin-on-surface transition hover:bg-admin-surface-highest/70 sm:tracking-[0.22em]"
          >
            <Download className="h-4 w-4" />
            Exportar vista
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-admin-error-container/40 bg-admin-error-container/20 px-4 py-3 text-sm text-admin-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="admin-panel rounded-[28px] px-6 py-10 text-sm text-admin-on-surface-variant">
          Cargando dashboard...
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <button
                key={card.title}
                type="button"
                onClick={card.onClick}
                className={cn(
                  "admin-panel rounded-[22px] p-4 text-left transition duration-200 sm:rounded-[24px] sm:p-6",
                  card.onClick && "hover:-translate-y-1 hover:bg-admin-surface-highest/80"
                )}
              >
                <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5 sm:gap-4">
                  <div className={cn("rounded-2xl p-2.5 sm:p-3", card.iconBg, card.iconColor)}>
                    <card.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-300 sm:px-3 sm:text-[10px] sm:tracking-[0.2em]">
                    <ArrowUpRight className="h-3 w-3" />
                    {card.change}
                  </span>
                </div>
                <p className="text-sm font-medium text-admin-on-surface-variant">{card.title}</p>
                <p className="mt-2 font-headline text-[2rem] font-black leading-none tracking-tight text-admin-on-surface sm:text-3xl">{card.value}</p>
                <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.22em] text-admin-outline sm:text-[10px] sm:tracking-[0.28em]">{card.subtitle}</p>
              </button>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-3 xl:gap-8">
            <article className="admin-panel rounded-[28px] p-5 sm:p-6 xl:col-span-2 xl:p-7">
              <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="font-headline text-xl font-bold text-admin-on-surface">Ventas mensuales</h4>
                  <p className="text-sm text-admin-on-surface-variant">Histórico de los últimos seis meses con órdenes reales.</p>
                </div>
              </div>

              <div className="h-64 w-full sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="adminSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4361ee" stopOpacity={0.38} />
                        <stop offset="95%" stopColor="#4361ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333348" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#8e8fa1", fontSize: 11, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ stroke: "#4361ee", strokeOpacity: 0.2 }}
                      contentStyle={{
                        backgroundColor: "#1e1e32",
                        border: "1px solid rgba(68,70,85,0.4)",
                        borderRadius: "16px",
                        color: "#e2e0fc",
                      }}
                      formatter={(value) => formatCurrencyCOP(Number(value ?? 0))}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#4361ee"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#adminSales)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="admin-panel rounded-[28px] p-5 sm:p-6 xl:p-7">
              <h4 className="font-headline text-xl font-bold text-admin-on-surface">Pedidos por estado</h4>
              <div className="relative mt-5 flex min-h-[220px] items-center justify-center sm:min-h-[240px]">
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        innerRadius={62}
                        outerRadius={84}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {statusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e1e32",
                          border: "1px solid rgba(68,70,85,0.4)",
                          borderRadius: "16px",
                          color: "#e2e0fc",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-headline text-4xl font-black text-admin-on-surface">{totalOrdersByStatus}</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-admin-outline">Total</span>
                </div>
              </div>

              <div className="space-y-3">
                {statusData.length > 0 ? (
                  statusData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-2xl bg-admin-surface-high/60 px-4 py-3 text-sm">
                      <div className="flex items-center gap-3 text-admin-on-surface-variant">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </div>
                      <span className="font-bold text-admin-on-surface">{item.value}</span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-admin-surface-high/60 px-4 py-3 text-sm text-admin-on-surface-variant">
                    No hay estados disponibles.
                  </div>
                )}
              </div>
            </article>
          </div>

          <article className="admin-panel rounded-[28px] p-5 sm:p-6 xl:p-7">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="font-headline text-xl font-bold uppercase tracking-tight text-admin-on-surface">
                  Últimos pedidos
                </h4>
                <p className="text-sm text-admin-on-surface-variant">Recorte visual del flujo reciente de órdenes.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/admin/orders")}
                className="text-left text-xs font-bold uppercase tracking-[0.22em] text-admin-primary transition hover:underline"
              >
                Ver historial completo
              </button>
            </div>

            <div className="space-y-4 md:hidden">
              {recentOrdersRows.map((order) => {
                const statusConfig = statusMeta[order.status] ?? statusMeta.pendiente;

                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => navigate("/admin/orders")}
                    className="admin-table-mobile-card block w-full p-4 text-left transition hover:bg-admin-surface-high/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-admin-on-surface">{order.user?.name || order.name}</p>
                        <p className="mt-1 truncate text-xs text-admin-on-surface-variant">{order.user?.email || order.email}</p>
                      </div>
                      <span className={cn("shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]", statusConfig.badge)}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-admin-outline">Ubicación</p>
                        <p className="mt-1 text-admin-on-surface-variant">{order.city}, {order.country}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-admin-outline">Fecha</p>
                        <p className="mt-1 text-admin-on-surface-variant">{formatShortDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-admin-outline-variant/20 pt-4">
                      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-admin-outline">Monto</span>
                      <span className="font-bold text-admin-on-surface">{formatCurrencyCOP(order.total)}</span>
                    </div>
                  </button>
                );
              })}

              {recentOrdersRows.length === 0 && (
                <div className="rounded-2xl bg-admin-surface-high/60 px-4 py-5 text-sm text-admin-on-surface-variant">
                  No hay pedidos recientes para mostrar.
                </div>
              )}
            </div>

            <div className="admin-scrollbar hidden overflow-x-auto md:block">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-[0.24em] text-admin-outline">
                    <th className="pb-4">Cliente</th>
                    <th className="pb-4">Ubicación</th>
                    <th className="pb-4">Estado</th>
                    <th className="pb-4">Fecha</th>
                    <th className="pb-4 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-admin-on-surface">
                  {recentOrdersRows.map((order) => {
                    const statusConfig = statusMeta[order.status] ?? statusMeta.pendiente;

                    return (
                      <tr
                        key={order.id}
                        className="cursor-pointer border-t border-admin-outline-variant/20 transition hover:bg-admin-surface-high/40"
                        onClick={() => navigate("/admin/orders")}
                      >
                        <td className="py-4">
                          <p className="font-semibold">{order.user?.name || order.name}</p>
                          <p className="text-xs text-admin-on-surface-variant">{order.user?.email || order.email}</p>
                        </td>
                        <td className="py-4 text-admin-on-surface-variant">
                          {order.city}, {order.country}
                        </td>
                        <td className="py-4">
                          <span className={cn("rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]", statusConfig.badge)}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="py-4 text-admin-on-surface-variant">
                          {formatShortDate(order.createdAt)}
                        </td>
                        <td className="py-4 text-right font-bold">{formatCurrencyCOP(order.total)}</td>
                      </tr>
                    );
                  })}

                  {recentOrdersRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-sm text-admin-on-surface-variant">
                        No hay pedidos recientes para mostrar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </>
      )}
    </section>
  );
}
