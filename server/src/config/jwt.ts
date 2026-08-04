import jwt, { type JwtPayload as JsonWebTokenPayload, type Secret, type SignOptions } from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  email: string;
  role: "CLIENT" | "ADMIN";
}

const JWT_SECRET: Secret =
  (process.env.JWT_SECRET as Secret) ||
  ((process.env.NODE_ENV === "test" ? "test-secret-key" : undefined) as Secret);

if (!JWT_SECRET) {
  throw new Error(
    "CRITICAL: JWT_SECRET environment variable is not set. Authentication cannot start without it."
  );
}

const JWT_EXPIRY = (process.env.JWT_EXPIRY || "7d") as SignOptions["expiresIn"];

function isJwtPayload(value: string | JsonWebTokenPayload): value is JsonWebTokenPayload {
  return typeof value !== "string";
}

function isApplicationJwtPayload(payload: JsonWebTokenPayload): payload is JsonWebTokenPayload & JwtPayload {
  return (
    typeof payload.id === "string" &&
    typeof payload.email === "string" &&
    (payload.role === "CLIENT" || payload.role === "ADMIN")
  );
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!isJwtPayload(decoded) || !isApplicationJwtPayload(decoded)) {
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error: unknown) {
    console.error("[JWT] Verificación fallida:", error);
    return null;
  }
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}
