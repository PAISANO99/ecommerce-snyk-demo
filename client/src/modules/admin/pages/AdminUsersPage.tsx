import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Activity, Mail, Shield, UserCheck, UserPlus, Users } from "lucide-react";
import AdminPagination from "../components/AdminPagination";
import { getAdminUsersRequest } from "../services/adminApi";
import type { AdminLayoutContext, AdminUser } from "../types";
import { cn } from "../../../lib/cn";
import { formatShortDate } from "../utils/format";

export default function AdminUsersPage() {
  const { searchQuery } = useOutletContext<AdminLayoutContext>();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdminUsersRequest({ page, limit: 24 });
      setUsers(response.data);
      setTotal(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) => {
      const haystack = [user.name, user.email, user.role].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [searchQuery, users]);

  const adminCount = useMemo(
    () => users.filter((user) => user.role.toUpperCase() === "ADMIN").length,
    [users]
  );

  const joinedThisMonth = useMemo(() => {
    const today = new Date();

    return users.filter((user) => {
      const createdAt = new Date(user.createdAt);
      return createdAt.getMonth() === today.getMonth() && createdAt.getFullYear() === today.getFullYear();
    }).length;
  }, [users]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h3 className="font-headline text-2xl font-extrabold tracking-tight text-admin-on-surface sm:text-3xl">
            Usuarios y roles
          </h3>
          <p className="mt-1 text-sm text-admin-on-surface-variant">
            Visualiza las cuentas registradas y el contexto de acceso administrativo.
          </p>
        </div>

        <div className="rounded-2xl border border-admin-outline-variant/40 bg-admin-surface-high/60 px-4 py-3 text-sm text-admin-on-surface-variant">
          <span className="font-bold text-admin-on-surface">{total}</span> usuarios en total · {users.length} cargados
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-admin-error-container/40 bg-admin-error-container/20 px-4 py-3 text-sm text-admin-error">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Users} label="Usuarios totales" value={String(total)} accent="text-admin-primary" />
        <MetricCard icon={Shield} label="Admins en página" value={String(adminCount)} accent="text-admin-tertiary" />
        <MetricCard icon={UserPlus} label="Altas del mes" value={String(joinedThisMonth)} accent="text-admin-secondary" />
        <MetricCard icon={Activity} label="Página cargada" value={String(page)} accent="text-admin-outline" />
      </div>

      <article className="admin-panel overflow-hidden rounded-[28px]">
        <div className="flex flex-col gap-3 border-b border-admin-outline-variant/20 px-4 py-5 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h4 className="font-headline text-xl font-bold text-admin-on-surface">Directorio operativo</h4>
            <p className="text-sm text-admin-on-surface-variant">
              El buscador superior filtra solo los usuarios de la página cargada porque el backend responde paginado.
            </p>
          </div>

          {searchQuery ? (
            <div className="rounded-2xl border border-admin-outline-variant/40 bg-admin-surface-high/70 px-4 py-3 text-sm text-admin-on-surface">
              Búsqueda activa: <span className="font-bold">{searchQuery}</span>
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="px-4 py-10 text-sm text-admin-on-surface-variant sm:px-6">Cargando usuarios...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="px-4 py-10 text-sm text-admin-on-surface-variant sm:px-6">No hay usuarios para mostrar en esta página.</div>
        ) : (
          <div className="grid gap-4 p-4 md:grid-cols-2 md:gap-6 md:p-6 xl:grid-cols-3">
            {filteredUsers.map((user) => {
              const initials = user.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((segment) => segment[0])
                .join("")
                .toUpperCase();

              const isAdmin = user.role.toUpperCase() === "ADMIN";

              return (
                <article
                  key={user.id}
                  className="rounded-[24px] border border-admin-outline-variant/20 bg-admin-surface-high/30 p-5 transition hover:border-admin-primary/30 hover:bg-admin-surface-high/45 sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-admin-primary/10 text-sm font-black text-admin-primary">
                      {initials || "US"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="font-headline text-xl font-bold text-admin-on-surface">{user.name}</h5>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                            isAdmin ? "bg-admin-primary/15 text-admin-primary" : "bg-admin-surface-highest/70 text-admin-on-surface-variant"
                          )}
                        >
                          {user.role}
                        </span>
                      </div>
                      <p className="mt-2 flex items-center gap-2 break-all text-sm text-admin-on-surface-variant">
                        <Mail className="h-4 w-4 text-admin-primary" />
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 rounded-2xl bg-admin-surface-high/50 px-4 py-4 text-sm text-admin-on-surface-variant">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-admin-tertiary" />
                      <span>Rol actual · {user.role}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-4 w-4 text-emerald-300" />
                      <span>Cuenta visible en la página {page}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-admin-secondary" />
                      <span>Registro · {formatShortDate(user.createdAt)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && <AdminPagination page={page} totalPages={totalPages || 1} onPageChange={setPage} />}
      </article>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <article className="admin-panel rounded-[24px] p-5">
      <div className="flex items-center gap-4">
        <div className={cn("rounded-2xl bg-admin-surface-highest/70 p-3", accent)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-admin-outline">{label}</p>
          <p className="mt-1 font-headline text-2xl font-black text-admin-on-surface">{value}</p>
        </div>
      </div>
    </article>
  );
}
