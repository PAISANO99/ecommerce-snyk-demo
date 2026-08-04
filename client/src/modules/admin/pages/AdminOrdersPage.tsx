import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  Eye,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import AdminPagination from "../components/AdminPagination";
import { getAdminOrdersRequest, updateAdminOrderStatusRequest } from "../services/adminApi";
import { ADMIN_ORDER_STATUSES } from "../types";
import type { AdminLayoutContext, AdminOrder, AdminOrderStatus } from "../types";
import { cn } from "../../../lib/cn";
import { formatCurrencyCOP, formatDateTime } from "../utils/format";

const statusMeta: Record<
  string,
  {
    label: string;
    color: string;
    summaryClass: string;
    badgeClass: string;
    icon: typeof Clock3;
  }
> = {
  pendiente: {
    label: "Pendiente",
    color: "text-amber-300",
    summaryClass: "bg-amber-500/10 text-amber-300",
    badgeClass: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    icon: Clock3,
  },
  pagado: {
    label: "Pagado",
    color: "text-sky-300",
    summaryClass: "bg-sky-500/10 text-sky-300",
    badgeClass: "border-sky-500/20 bg-sky-500/10 text-sky-300",
    icon: Calendar,
  },
  enviado: {
    label: "Enviado",
    color: "text-violet-300",
    summaryClass: "bg-violet-500/10 text-violet-300",
    badgeClass: "border-violet-500/20 bg-violet-500/10 text-violet-300",
    icon: Truck,
  },
  entregado: {
    label: "Entregado",
    color: "text-emerald-300",
    summaryClass: "bg-emerald-500/10 text-emerald-300",
    badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    icon: CheckCircle2,
  },
  cancelado: {
    label: "Cancelado",
    color: "text-rose-300",
    summaryClass: "bg-rose-500/10 text-rose-300",
    badgeClass: "border-rose-500/20 bg-rose-500/10 text-rose-300",
    icon: XCircle,
  },
};

const INITIAL_META = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export default function AdminOrdersPage() {
  const { searchQuery } = useOutletContext<AdminLayoutContext>();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [meta, setMeta] = useState(INITIAL_META);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [localSearch, setLocalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdminOrdersRequest({
        page,
        limit: 20,
        status: statusFilter === "all" ? undefined : statusFilter,
      });

      setOrders(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las órdenes");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const totalItems = useMemo(
    () => orders.reduce((acc, order) => acc + order.items.reduce((itemsAcc, item) => itemsAcc + item.quantity, 0), 0),
    [orders]
  );

  const effectiveSearch = `${searchQuery} ${localSearch}`.trim().toLowerCase();

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const customerName = (order.user?.name || order.name).toLowerCase();
      const customerEmail = (order.user?.email || order.email).toLowerCase();
      const haystack = [
        String(order.id),
        order.status.toLowerCase(),
        customerName,
        customerEmail,
        order.city.toLowerCase(),
        order.country.toLowerCase(),
      ].join(" ");

      return !effectiveSearch || haystack.includes(effectiveSearch);
    });
  }, [effectiveSearch, orders]);

  const summaryCards = useMemo(
    () => ["pendiente", "pagado", "enviado", "entregado", "cancelado"].map((status) => ({
      status,
      count: orders.filter((order) => order.status === status).length,
      meta: statusMeta[status],
    })),
    [orders]
  );

  async function handleStatusChange(orderId: number, status: AdminOrderStatus) {
    try {
      setUpdatingOrderId(orderId);
      setError(null);
      await updateAdminOrderStatusRequest(orderId, status);
      await loadOrders();
      setSelectedOrder((current) => (current?.id === orderId ? { ...current, status } : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el estado de la orden");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const pageScopeCopy =
    searchQuery || localSearch
      ? "La búsqueda actual filtra solo la página cargada; la paginación sigue viniendo del backend."
      : "Resumen calculado con la página actual para evitar simular el dataset completo.";

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h3 className="font-headline text-2xl font-extrabold tracking-tight text-admin-on-surface sm:text-3xl">Pedidos</h3>
          <p className="mt-1 text-sm text-admin-on-surface-variant">
            Monitorea, inspecciona y actualiza el flujo completo de órdenes.
          </p>
        </div>

        <div className="rounded-2xl border border-admin-outline-variant/40 bg-admin-surface-high/60 px-4 py-3 text-sm text-admin-on-surface-variant">
          <span className="font-bold text-admin-on-surface">{meta.total}</span> órdenes totales · página {meta.page || 1}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-admin-error-container/40 bg-admin-error-container/20 px-4 py-3 text-sm text-admin-error">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map(({ status, count, meta: statusDetails }) => (
          <article key={status} className="admin-panel rounded-[24px] p-5">
            <div className="flex items-center gap-4">
              <div className={cn("rounded-2xl p-3", statusDetails.summaryClass)}>
                <statusDetails.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-admin-outline">{statusDetails.label}</p>
                <p className="mt-1 font-headline text-2xl font-black text-admin-on-surface">{count}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <article className="admin-panel overflow-hidden rounded-[28px]">
        <div className="flex flex-col gap-4 border-b border-admin-outline-variant/20 px-4 py-5 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h4 className="font-headline text-xl font-bold text-admin-on-surface">Historial de pedidos</h4>
            <p className="text-sm text-admin-on-surface-variant">Tabla operativa con edición de estado en línea.</p>
            <p className="mt-2 text-xs text-admin-outline">
              {orders.length} órdenes cargadas en esta vista · {totalItems} ítems en la página.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-admin-outline-variant/40 bg-admin-surface-high/70 px-4 py-3 text-sm text-admin-on-surface-variant">
              <Search className="h-4 w-4 text-admin-outline" />
              <span className="sr-only">Buscar pedidos por cliente, correo o ciudad</span>
              <input
                aria-label="Buscar pedidos por cliente, correo o ciudad"
                type="text"
                value={localSearch}
                onChange={(event) => setLocalSearch(event.target.value)}
                placeholder="Buscar por cliente, correo o ciudad"
                className="w-full min-w-0 bg-transparent outline-none placeholder:text-admin-outline md:min-w-[240px]"
              />
            </label>

            <div>
              <label htmlFor="admin-orders-status-filter" className="sr-only">
                Filtrar pedidos por estado
              </label>
              <select
                id="admin-orders-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="min-h-[44px] rounded-xl border border-admin-outline-variant/40 bg-admin-surface-high/70 px-4 py-3 text-sm text-admin-on-surface outline-none"
              >
                <option value="all">Todos los estados</option>
                {ADMIN_ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {statusMeta[status]?.label ?? status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border-b border-admin-outline-variant/20 bg-admin-surface-high/20 px-4 py-3 text-xs text-admin-outline sm:px-6">
          {pageScopeCopy}
        </div>

        {loading ? (
          <div className="px-4 py-10 text-sm text-admin-on-surface-variant sm:px-6">Cargando órdenes...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="px-4 py-10 text-sm text-admin-on-surface-variant sm:px-6">No hay órdenes que coincidan con los filtros.</div>
        ) : (
          <>
            <div className="grid gap-4 p-4 md:hidden">
              {filteredOrders.map((order) => {
                const customerName = order.user?.name || order.name;
                const customerEmail = order.user?.email || order.email;
                const statusDetails = statusMeta[order.status] ?? statusMeta.pendiente;

                return (
                  <article key={order.id} className="admin-table-mobile-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-admin-on-surface">#{String(order.id).padStart(5, "0")}</p>
                        <p className="mt-1 truncate text-sm text-admin-on-surface">{customerName}</p>
                        <p className="mt-1 truncate text-xs text-admin-on-surface-variant">{customerEmail}</p>
                      </div>
                      <span className={cn("inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]", statusDetails.badgeClass)}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {statusDetails.label}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl bg-admin-surface-high/50 px-3 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-admin-outline">Fecha</p>
                        <p className="mt-1 text-admin-on-surface-variant">{formatDateTime(order.createdAt)}</p>
                      </div>
                      <div className="rounded-2xl bg-admin-surface-high/50 px-3 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-admin-outline">Total</p>
                        <p className="mt-1 font-bold text-admin-on-surface">{formatCurrencyCOP(order.total)}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3 rounded-2xl bg-admin-surface-high/50 px-3 py-3">
                      <label htmlFor={`mobile-order-status-${order.id}`} className="text-[10px] font-bold uppercase tracking-[0.2em] text-admin-outline">
                        Estado
                      </label>
                      <select
                        id={`mobile-order-status-${order.id}`}
                        value={order.status}
                        disabled={updatingOrderId === order.id}
                        aria-label={`Actualizar estado del pedido ${String(order.id).padStart(5, "0")}`}
                        onChange={(event) => void handleStatusChange(order.id, event.target.value as AdminOrderStatus)}
                        className="min-h-[44px] w-full rounded-xl border border-admin-outline-variant/40 bg-admin-surface-high/70 px-3 py-3 text-sm text-admin-on-surface outline-none disabled:opacity-60"
                      >
                        {ADMIN_ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {statusMeta[status]?.label ?? status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-admin-outline-variant/40 bg-admin-surface-high/60 px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-admin-on-surface transition hover:bg-admin-surface-highest/70"
                    >
                      <Eye className="h-4 w-4" />
                      Ver detalle
                    </button>
                  </article>
                );
              })}
            </div>

            <div className="admin-scrollbar hidden overflow-x-auto md:block">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-admin-surface-high/50 text-[10px] font-bold uppercase tracking-[0.24em] text-admin-outline">
                  <th className="px-6 py-4">ID pedido</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Actualización</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-outline-variant/20 text-sm text-admin-on-surface">
                {filteredOrders.map((order) => {
                  const customerName = order.user?.name || order.name;
                  const customerEmail = order.user?.email || order.email;
                  const statusDetails = statusMeta[order.status] ?? statusMeta.pendiente;

                  return (
                    <tr key={order.id} className="transition hover:bg-admin-surface-high/40">
                      <td className="px-6 py-5 font-bold text-admin-primary">#{String(order.id).padStart(5, "0")}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-admin-primary/20 bg-admin-primary/10 text-[11px] font-black text-admin-primary">
                            {customerName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-admin-on-surface">{customerName}</p>
                            <p className="text-xs text-admin-on-surface-variant">{customerEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-admin-on-surface-variant">{formatDateTime(order.createdAt)}</td>
                      <td className="px-6 py-5 font-black text-admin-on-surface">{formatCurrencyCOP(order.total)}</td>
                      <td className="px-6 py-5">
                        <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]", statusDetails.badgeClass)}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {statusDetails.label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <select
                          value={order.status}
                          disabled={updatingOrderId === order.id}
                          aria-label={`Actualizar estado del pedido ${String(order.id).padStart(5, "0")}`}
                          onChange={(event) => void handleStatusChange(order.id, event.target.value as AdminOrderStatus)}
                          className="w-full rounded-xl border border-admin-outline-variant/40 bg-admin-surface-high/70 px-3 py-2 text-sm text-admin-on-surface outline-none disabled:opacity-60"
                        >
                          {ADMIN_ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {statusMeta[status]?.label ?? status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-2 rounded-xl border border-admin-outline-variant/40 bg-admin-surface-high/60 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-admin-on-surface transition hover:bg-admin-surface-highest/70"
                        >
                          <Eye className="h-4 w-4" />
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </>
        )}

        {!loading && (
          <AdminPagination
            page={meta.page || page}
            totalPages={meta.totalPages || 1}
            onPageChange={setPage}
          />
        )}
      </article>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-3 py-3 sm:items-center sm:px-4">
          <button
            type="button"
            aria-label="Cerrar detalle"
            onClick={() => setSelectedOrder(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <article className="admin-panel relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-admin-outline-variant/40 sm:rounded-[32px]">
            <div className="border-b border-admin-outline-variant/20 bg-gradient-to-br from-admin-surface-low to-admin-surface-high px-5 py-5 sm:px-7 sm:py-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-black uppercase tracking-tight text-admin-primary">
                      Pedido #{String(selectedOrder.id).padStart(5, "0")}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                        (statusMeta[selectedOrder.status] ?? statusMeta.pendiente).badgeClass
                      )}
                    >
                      {(statusMeta[selectedOrder.status] ?? statusMeta.pendiente).label}
                    </span>
                  </div>
                  <h4 className="mt-3 font-headline text-2xl font-black text-admin-on-surface sm:text-3xl">
                    {selectedOrder.user?.name || selectedOrder.name}
                  </h4>
                  <p className="mt-2 text-sm text-admin-on-surface-variant">{formatDateTime(selectedOrder.createdAt)}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="min-h-[44px] self-start rounded-full border border-admin-outline-variant/40 bg-admin-surface-high/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-admin-on-surface transition hover:bg-admin-surface-highest/70"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="admin-scrollbar grid gap-6 overflow-y-auto px-5 py-5 sm:px-7 sm:py-7 md:grid-cols-2 md:gap-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-admin-outline">Resumen de productos</p>
                <div className="mt-4 space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl bg-admin-surface-high/60 px-4 py-3 text-sm">
                      <div>
                        <p className="font-semibold text-admin-on-surface">{item.product.name}</p>
                        <p className="text-xs text-admin-on-surface-variant">Cantidad · {item.quantity}</p>
                      </div>
                      <span className="font-bold text-admin-on-surface">{formatCurrencyCOP(item.price)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-admin-primary/20 bg-admin-primary/10 px-4 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-admin-primary">Total pagado</p>
                  <p className="mt-2 font-headline text-2xl font-black text-admin-on-surface">
                    {formatCurrencyCOP(selectedOrder.total)}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-admin-outline">Información del cliente</p>
                  <div className="mt-4 rounded-2xl bg-admin-surface-high/60 px-4 py-4 text-sm">
                    <p className="font-semibold text-admin-on-surface">{selectedOrder.user?.name || selectedOrder.name}</p>
                    <p className="mt-1 break-all text-admin-on-surface-variant">{selectedOrder.user?.email || selectedOrder.email}</p>
                    <p className="mt-3 text-admin-on-surface-variant">
                      {selectedOrder.city}, {selectedOrder.country}
                    </p>
                    <p className="mt-1 text-admin-on-surface-variant capitalize">Pago · {selectedOrder.paymentMethod}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-admin-outline">Actualizar estado</p>
                  <select
                    value={selectedOrder.status}
                    disabled={updatingOrderId === selectedOrder.id}
                    onChange={(event) => void handleStatusChange(selectedOrder.id, event.target.value as AdminOrderStatus)}
                    className="mt-4 min-h-[44px] w-full rounded-2xl border border-admin-outline-variant/40 bg-admin-surface-high/70 px-4 py-3 text-sm text-admin-on-surface outline-none disabled:opacity-60"
                  >
                    {ADMIN_ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {statusMeta[status]?.label ?? status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
