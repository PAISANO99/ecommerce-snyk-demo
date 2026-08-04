import { getAuth } from "../utils/auth";

export function useProtectedRoute(requiredRole: "CLIENT" | "ADMIN") {
  const auth = getAuth();

  if (!auth) {
    return { isAuthorized: false, redirectTo: "/login" };
  }

  if (auth.role !== requiredRole) {
    return {
      isAuthorized: false,
      redirectTo: auth.role === "ADMIN" ? "/admin" : "/home",
    };
  }

  return { isAuthorized: true, redirectTo: null };
}
