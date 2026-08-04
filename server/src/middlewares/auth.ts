import type { Request, Response, NextFunction } from "express";
import { createError } from "./errorHandler";
import { verifyToken, extractTokenFromHeader, type JwtPayload } from "../config/jwt";

/**
 * Interfaz extendida de Request con datos de usuario
 */
export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: JwtPayload;
}

/**
 * Middleware de verificación de autenticación con JWT
 * Valida que exista un token JWT válido en los headers
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      throw createError("Token no proporcionado", 401, {
        code: "NO_TOKEN",
      });
    }

    // Verificar y decodificar el JWT
    const decoded = verifyToken(token);

    if (!decoded) {
      throw createError("Token inválido o expirado", 401, {
        code: "INVALID_TOKEN",
      });
    }

    // Almacenar los datos del usuario en la request
    req.user = decoded;
    req.userId = decoded.id;

    next();
  } catch (error: unknown) {
    next(error);
  }
};

/**
 * Middleware para validar roles de usuario
 * Especifica los roles permitidos y rechaza otros
 */
export const authorizeRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    try {
      const userRole = req.user?.role;

      if (!userRole || !allowedRoles.includes(userRole)) {
        throw createError("Acceso denegado", 403, {
          code: "FORBIDDEN",
          allowedRoles,
          userRole,
        });
      }

      next();
    } catch (error: unknown) {
      next(error);
    }
  };
};

/**
 * Middleware para verificar que el usuario no esté autenticado (para login/register)
 */
export const guestOnly = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        throw createError("Ya está autenticado", 400, {
          code: "ALREADY_AUTHENTICATED",
        });
      }
    }

    next();
  } catch (error: unknown) {
    next(error);
  }
};
