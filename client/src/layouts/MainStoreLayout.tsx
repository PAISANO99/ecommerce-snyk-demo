import { FormEvent, ReactNode, useEffect, useState } from "react";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../hooks";

interface Props {
  children: ReactNode;
}

export default function MainStoreLayout({ children }: Props) {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") ?? "");
  }, [location.search]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    const query = search.trim();
    navigate(query ? `/catalogo?search=${encodeURIComponent(query)}` : "/catalogo");
  }

  const navLinks = (
    <>
      <Link className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-100 focus-visible:bg-slate-100" to="/home">
        Inicio
      </Link>
      <Link className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-100 focus-visible:bg-slate-100" to="/catalogo">
        Catálogo
      </Link>
      <Link className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-100 focus-visible:bg-slate-100" to="/cart">
        Carrito
      </Link>
      {user?.role === "ADMIN" && (
        <Link className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-100 focus-visible:bg-slate-100" to="/admin">
          Admin
        </Link>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((current) => !current)}
                aria-label={mobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
                aria-expanded={mobileMenuOpen}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border text-slate-700 transition hover:bg-slate-100 lg:hidden"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <Link to="/home" className="text-base font-extrabold text-slate-900 sm:text-xl">
                VibePulse
              </Link>
              <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal de la tienda">
                {navLinks}
              </nav>
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <form onSubmit={handleSearchSubmit} className="flex min-h-[44px] items-center gap-2 rounded-xl border bg-white px-3 py-2">
                <label htmlFor="store-search" className="sr-only">
                  Buscar productos en el catálogo
                </label>
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  id="store-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="w-40 border-none bg-transparent text-sm outline-none"
                />
                <button className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus-visible:bg-slate-100" type="submit">
                  Ir
                </button>
              </form>

              <button
                onClick={() => navigate("/catalogo")}
                className="min-h-[44px] rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:bg-slate-700"
              >
                Comprar
              </button>

              <button
                onClick={() => navigate("/cart")}
                className="relative inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Carrito</span>
                {totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </button>

              <button
                onClick={logout}
                className="min-h-[44px] rounded-xl border px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100"
              >
                Salir
              </button>
            </div>

            <div className="flex shrink-0 items-center gap-2 lg:hidden">
              <button
                onClick={() => navigate("/catalogo")}
                className="min-h-[44px] rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:bg-slate-700 sm:px-4"
              >
                Comprar
              </button>
              <button
                onClick={() => navigate("/cart")}
                aria-label="Ir al carrito"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100"
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                onClick={logout}
                className="hidden min-h-[44px] rounded-xl border px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100 min-[360px]:inline-flex"
              >
                Salir
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 lg:hidden">
            <form onSubmit={handleSearchSubmit} className="flex min-h-[44px] items-center gap-2 rounded-xl border bg-white px-3 py-2">
              <label htmlFor="store-search-mobile" className="sr-only">
                Buscar productos en el catálogo
              </label>
              <Search className="h-4 w-4 shrink-0 text-slate-500" />
              <input
                id="store-search-mobile"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos"
                className="min-w-0 flex-1 border-none bg-transparent text-sm outline-none"
              />
              <button className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100" type="submit">
                Ir
              </button>
            </form>

            {mobileMenuOpen && (
              <div className="rounded-2xl border bg-white p-3 shadow-sm">
                <nav className="flex flex-col gap-1" aria-label="Menú móvil de la tienda">
                  {navLinks}
                  <button
                    type="button"
                    onClick={logout}
                    className="mt-2 min-h-[44px] rounded-xl border px-4 py-3 text-left text-sm font-medium text-slate-700"
                  >
                    Salir
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
