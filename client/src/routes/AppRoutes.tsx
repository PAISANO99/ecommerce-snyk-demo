import { Suspense, lazy, type ReactElement } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import Home from "../pages/Home";
import Catalog from "../pages/Catalog";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import ConfirmationPage from "../pages/ConfirmationPage";
import Login from "../pages/Login";
import ProcessingPaymentPage from "../pages/ProcessingPaymentPage";
import PurchaseAlertPage from "../pages/PurchaseAlertPage";
import Register from "../pages/Register";
import { getAuth } from "../utils/auth";

const AdminLayout = lazy(() => import("../modules/admin/layouts/AdminLayout"));
const AdminDashboardPage = lazy(() => import("../modules/admin/pages/AdminDashboardPage"));
const AdminOrdersPage = lazy(() => import("../modules/admin/pages/AdminOrdersPage"));
const AdminProductsPage = lazy(() => import("../modules/admin/pages/AdminProductsPage"));
const AdminSettingsPage = lazy(() => import("../modules/admin/pages/AdminSettingsPage"));
const AdminUsersPage = lazy(() => import("../modules/admin/pages/AdminUsersPage"));

function AdminFallback() {
  return (
    <div className="admin-theme flex min-h-screen items-center justify-center px-6 py-10 text-sm text-admin-on-surface-variant">
      Cargando panel administrativo...
    </div>
  );
}

function RequireAuth({ children }: { children: ReactElement }) {
  const auth = getAuth();
  if (!auth) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }: { children: ReactElement }) {
  const auth = getAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (auth.role !== "ADMIN") return <Navigate to="/home" replace />;
  return children;
}

function GuestOnly({ children }: { children: ReactElement }) {
  const auth = getAuth();
  if (auth) return <Navigate to={auth.role === "ADMIN" ? "/admin" : "/home"} replace />;
  return children;
}

function RootRedirect() {
  const auth = getAuth();
  if (!auth) return <Navigate to="/login" replace />;
  return <Navigate to={auth.role === "ADMIN" ? "/admin" : "/home"} replace />;
}

function LegacyProductRedirect() {
  const { id } = useParams();
  return <Navigate to={`/products/${id ?? ""}`} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
      <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
      <Route path="/catalogo" element={<RequireAuth><Catalog /></RequireAuth>} />
      <Route path="/products/:id" element={<RequireAuth><ProductDetail /></RequireAuth>} />
      <Route path="/producto/:id" element={<LegacyProductRedirect />} />
      <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
      <Route path="/carrito" element={<Navigate to="/cart" replace />} />
      <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
      <Route path="/processing-payment" element={<RequireAuth><ProcessingPaymentPage /></RequireAuth>} />
      <Route path="/purchase-alert" element={<RequireAuth><PurchaseAlertPage /></RequireAuth>} />
      <Route path="/confirmation" element={<RequireAuth><ConfirmationPage /></RequireAuth>} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <Suspense fallback={<AdminFallback />}>
              <AdminLayout />
            </Suspense>
          </RequireAdmin>
        }
      >
        <Route index element={<Suspense fallback={<AdminFallback />}><AdminDashboardPage /></Suspense>} />
        <Route path="products" element={<Suspense fallback={<AdminFallback />}><AdminProductsPage /></Suspense>} />
        <Route path="orders" element={<Suspense fallback={<AdminFallback />}><AdminOrdersPage /></Suspense>} />
        <Route path="users" element={<Suspense fallback={<AdminFallback />}><AdminUsersPage /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<AdminFallback />}><AdminSettingsPage /></Suspense>} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
