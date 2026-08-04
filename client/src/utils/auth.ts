export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "CLIENT" | "ADMIN";
};

const USER_STORAGE_KEY = "vibe-pulse-auth";
const TOKEN_STORAGE_KEY = "vibe-pulse-token";

export function getAuth(): AuthUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuth(user: AuthUser, token: string) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuth() {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken() && !!getAuth();
}

