import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShoppingCart,
  Store,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../../../hooks";
import { cn } from "../../../lib/cn";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Productos", icon: Package },
  { to: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
  { to: "/admin/users", label: "Usuarios", icon: Users },
  { to: "/admin/settings", label: "Configuración", icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const pageCopy = useMemo(() => {
    if (location.pathname.startsWith("/admin/products")) {
      return {
        eyebrow: "Catálogo central",
        title: "Productos e inventario",
      };
    }

    if (location.pathname.startsWith("/admin/orders")) {
      return {
        eyebrow: "Centro de operaciones",
        title: "Pedidos y cumplimiento",
      };
    }

    if (location.pathname.startsWith("/admin/users")) {
      return {
        eyebrow: "Gestión de acceso",
        title: "Usuarios y actividad",
      };
    }

    if (location.pathname.startsWith("/admin/settings")) {
      return {
        eyebrow: "Control del panel",
        title: "Configuración administrativa",
      };
    }

    return {
      eyebrow: "Panel administrativo",
      title: "Visión general del negocio",
    };
  }, [location.pathname]);

  useEffect(() => {
    setIsSidebarOpen(false);
    setShowNotifications(false);
    setShowProfileMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      setIsSidebarOpen(false);
      setShowNotifications(false);
      setShowProfileMenu(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const desktopSidebarWidthClass = isSidebarCollapsed ? "lg:w-24" : "lg:w-64";
  const desktopContentOffsetClass = isSidebarCollapsed ? "lg:pl-24" : "lg:pl-64";
  return (
    <div className="admin-theme min-h-screen overflow-x-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden" aria-hidden="true">
          <button
            type="button"
            aria-label="Cerrar menú lateral"
            className="absolute inset-0"
            onClick={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      <aside
        id="admin-sidebar"
        className={cn(
          "admin-panel fixed inset-y-0 left-0 z-[60] flex w-[88vw] max-w-[320px] flex-col border-r border-admin-outline-variant/40 px-4 py-4 transition-transform duration-300 sm:px-5 sm:py-5 lg:max-w-none lg:px-6",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          desktopSidebarWidthClass
        )}
        aria-label="Navegación administrativa"
      >
        <div className="flex items-start justify-between gap-3 lg:block">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-admin-outline">Vibe Pulse</p>
            <h1 className="mt-3 font-headline text-2xl font-extrabold tracking-tight text-admin-primary">
              {isSidebarCollapsed ? "VD" : "El Directorio"}
            </h1>
            <p className="mt-1 text-xs uppercase tracking-[0.28em] text-admin-outline">
              {isSidebarCollapsed ? "Admin" : "Admin Console"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Cerrar navegación lateral"
            className="min-h-[44px] min-w-[44px] rounded-full border border-admin-outline-variant/40 bg-admin-surface-high/70 p-3 text-admin-on-surface transition hover:bg-admin-surface-highest/70 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 hidden lg:flex">
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            aria-label={isSidebarCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
            className="flex min-h-[44px] items-center gap-2 rounded-xl border border-admin-outline-variant/40 bg-admin-surface-high/50 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-admin-on-surface transition hover:bg-admin-surface-highest/70"
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            {!isSidebarCollapsed && "Colapsar"}
          </button>
        </div>

        <nav className="mt-6 space-y-2 lg:mt-8" aria-label="Secciones del panel administrativo">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "group flex min-h-[48px] items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-semibold transition-all duration-200",
                  isSidebarCollapsed ? "lg:justify-center lg:px-3" : "lg:justify-start",
                  isActive
                    ? "bg-admin-surface-highest/70 text-admin-primary shadow-admin-glow"
                    : "text-admin-on-surface-variant hover:border-admin-outline-variant/40 hover:bg-admin-surface-high/60 hover:text-admin-on-surface"
                )
              }
              aria-label={item.label}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-admin-primary" : "text-admin-outline")} />
                  <span className={cn("font-headline tracking-tight", isSidebarCollapsed && "lg:hidden")}>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {!isSidebarCollapsed && (
          <div className="mt-8 rounded-2xl border border-admin-outline-variant/40 bg-admin-surface-high/70 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-admin-outline">Sesión activa</p>
            <p className="mt-3 text-sm font-semibold text-admin-on-surface">{user?.name ?? "Administrador"}</p>
            <p className="mt-1 break-all text-xs text-admin-on-surface-variant">{user?.email ?? "Sin sesión"}</p>
          </div>
        )}

        <div className="mt-auto space-y-3">
          <NavLink
            to="/home"
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-admin-outline-variant/40 bg-admin-surface-high/50 px-4 py-3 text-sm font-semibold text-admin-on-surface transition hover:bg-admin-surface-highest/70"
          >
            <Store className="h-4 w-4 shrink-0" />
            <span className={cn(isSidebarCollapsed && "lg:hidden")}>Volver a tienda</span>
          </NavLink>
          <button
            type="button"
            onClick={logout}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-admin-primary-container to-admin-primary px-4 py-3 text-sm font-bold text-admin-on-primary transition hover:opacity-95"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={cn(isSidebarCollapsed && "lg:hidden")}>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div className={cn("min-h-screen", desktopContentOffsetClass)}>
        <header
          className={cn(
            "admin-glass sticky top-0 z-30 border-b border-admin-outline-variant/30 px-3 py-3 sm:px-5 sm:py-4 lg:px-8"
          )}
        >
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col gap-3 md:gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  aria-label="Abrir navegación lateral"
                  aria-expanded={isSidebarOpen}
                  aria-controls="admin-sidebar"
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-admin-outline-variant/40 bg-admin-surface-high/60 p-3 text-admin-on-surface transition hover:bg-admin-surface-highest/70 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-admin-outline sm:text-xs sm:tracking-[0.24em]">{pageCopy.eyebrow}</p>
                  <h2 className="mt-1 max-w-[14ch] text-balance font-headline text-[1.85rem] font-extrabold leading-[1.05] tracking-tight text-admin-on-surface sm:max-w-none sm:text-3xl">
                    {pageCopy.title}
                  </h2>
                </div>
              </div>

              <div className="flex w-full flex-wrap items-center gap-2 sm:gap-3 md:justify-end">
                <span className="rounded-xl border border-admin-outline-variant/40 bg-admin-surface-high/60 px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-admin-primary sm:px-4 sm:py-3 sm:text-[11px] sm:tracking-[0.22em]">
                    Hoy · {new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                </span>

                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setShowNotifications((current) => !current);
                          setShowProfileMenu(false);
                        }}
                        aria-label={showNotifications ? "Ocultar notificaciones" : "Mostrar notificaciones"}
                        aria-expanded={showNotifications}
                        className={cn(
                          "relative min-h-[42px] min-w-[42px] rounded-full border border-admin-outline-variant/40 p-2.5 text-admin-outline transition hover:bg-admin-surface-highest/60 hover:text-admin-primary sm:min-h-[44px] sm:min-w-[44px] sm:p-3",
                          showNotifications && "bg-admin-surface-highest/60 text-admin-primary"
                        )}
                      >
                        <Bell className="h-4 w-4" />
                        <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-admin-primary-container" />
                      </button>

                      {showNotifications && (
                        <div className="admin-panel absolute right-0 mt-3 w-[min(20rem,calc(100vw-2rem))] rounded-2xl p-3">
                          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-admin-outline">
                            Notificaciones
                          </p>
                          <div className="space-y-2">
                            {[
                              "Nuevo pedido pendiente de revisión",
                              "Órdenes entregadas listas para cierre",
                              "Actividad administrativa reciente",
                            ].map((item) => (
                              <div key={item} className="rounded-xl bg-admin-surface-high/60 px-3 py-3 text-sm text-admin-on-surface-variant">
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      aria-label="Abrir centro de ayuda"
                      className="rounded-full border border-admin-outline-variant/40 p-2.5 text-admin-outline transition hover:bg-admin-surface-highest/60 hover:text-admin-primary sm:p-3"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </button>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu((current) => !current);
                          setShowNotifications(false);
                        }}
                        aria-label="Abrir menú de perfil"
                        aria-expanded={showProfileMenu}
                        className="flex min-h-[42px] items-center gap-2 rounded-full border border-admin-outline-variant/40 bg-admin-surface-high/50 py-1.5 pl-1.5 pr-2 transition hover:bg-admin-surface-highest/70 sm:min-h-[44px] sm:gap-3 sm:py-2 sm:pl-2 sm:pr-4"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-admin-primary-container/20 text-sm font-black text-admin-primary sm:h-10 sm:w-10">
                          {(user?.name ?? "AD").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="hidden text-left sm:block">
                          <p className="text-sm font-bold text-admin-on-surface">{user?.name ?? "Administrador"}</p>
                          <p className="text-[10px] uppercase tracking-[0.22em] text-admin-outline">Senior Strategist</p>
                        </div>
                        <span className="hidden text-admin-outline sm:block">
                          {showProfileMenu ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </span>
                      </button>

                      {showProfileMenu && (
                        <div className="admin-panel absolute right-0 mt-3 w-56 rounded-2xl p-2">
                          <NavLink
                            to="/home"
                            className="block rounded-xl px-4 py-3 text-sm text-admin-on-surface-variant transition hover:bg-admin-surface-high/70 hover:text-admin-on-surface"
                          >
                            Ir a la tienda
                          </NavLink>
                          <button
                            type="button"
                            onClick={logout}
                            className="block w-full rounded-xl px-4 py-3 text-left text-sm text-admin-error transition hover:bg-admin-error-container/20"
                          >
                            Cerrar sesión
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="flex min-h-[46px] w-full items-center gap-3 rounded-2xl border border-admin-outline-variant/40 bg-admin-surface-highest/60 px-4 py-3 text-sm text-admin-on-surface-variant lg:max-w-xl xl:max-w-2xl">
                <Search className="h-4 w-4 shrink-0 text-admin-outline" />
                <span className="sr-only">Buscar métricas o pedidos</span>
                <input
                  aria-label="Buscar métricas o pedidos"
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Buscar métricas, clientes o pedidos..."
                  className="w-full min-w-0 bg-transparent text-sm text-admin-on-surface outline-none placeholder:text-admin-outline"
                />
              </label>

              <div className="hidden lg:flex lg:items-center lg:justify-end">
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed((current) => !current)}
                  aria-label={isSidebarCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
                  className="rounded-xl border border-admin-outline-variant/40 bg-admin-surface-high/60 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-admin-on-surface transition hover:bg-admin-surface-highest/70"
                >
                  <span className="flex items-center gap-2">
                    {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                    {isSidebarCollapsed ? "Expandir" : "Colapsar"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="px-3 pb-6 pt-4 sm:px-5 sm:pb-8 sm:pt-5 lg:px-8 lg:pt-6">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>
    </div>
  );
}
