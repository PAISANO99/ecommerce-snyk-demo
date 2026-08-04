import { Request, Response, NextFunction } from "express";
import { createError } from "./errorHandler";

const LOCAL_WHITELIST_IPS = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

const getNodeEnv = () => process.env.NODE_ENV || "development";

const shouldBypassRateLimit = (ip: string) => {
  const env = getNodeEnv();

  if (env === "development" && LOCAL_WHITELIST_IPS.has(ip)) {
    return true;
  }

  return false;
};
const getEffectiveLimits = (maxRequests: number, windowMs: number) => {
  const env = getNodeEnv();

  if (env === "development") {
    return {
      maxRequests: Math.max(maxRequests, 1000),
      windowMs,
    };
  }

  return { maxRequests, windowMs };
};

/**
 * Interfaz para almacenar información de rate limiting
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Colección de stores para cada limitador independiente
 */
const rateLimitStores = new Set<Map<string, RateLimitEntry>>();

export const clearRateLimitStore = () => {
  for (const store of rateLimitStores) {
    store.clear();
  }
};

/**
 * Limpia las entradas expiradas del store
 */
const cleanupExpiredEntries = (store: Map<string, RateLimitEntry>) => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime < now) {
      store.delete(key);
    }
  }
};

const getClientIp = (req: Request) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim().length > 0) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim().length > 0) {
    return realIp.trim();
  }

  const cfConnectingIp = req.headers["cf-connecting-ip"];
  if (typeof cfConnectingIp === "string" && cfConnectingIp.trim().length > 0) {
    return cfConnectingIp.trim();
  }

  return req.ip || req.socket.remoteAddress || "unknown";
};

/**
 * Middleware de rate limiting
 * Limita el número de solicitudes por IP en un período de tiempo
 * @param maxRequests Número máximo de solicitudes permitidas
 * @param windowMs Ventana de tiempo en milisegundos
 * @returns Middleware de Express
 */
export const rateLimiter = (maxRequests: number = 100, windowMs: number = 60000) => {
  const rateLimitStore = new Map<string, RateLimitEntry>();
  rateLimitStores.add(rateLimitStore);

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = getClientIp(req);

      if (shouldBypassRateLimit(ip)) {
        next();
        return;
      }

      const effectiveLimits = getEffectiveLimits(maxRequests, windowMs);

      // Limpiar entradas expiradas cada cierto tiempo
      if (Math.random() > 0.99) {
        cleanupExpiredEntries(rateLimitStore);
      }

      const key = `${ip}:${effectiveLimits.maxRequests}:${effectiveLimits.windowMs}`;
      const now = Date.now();
      let entry = rateLimitStore.get(key);

      // Si no existe entrada o ha expirado, crear nueva
      if (!entry || entry.resetTime < now) {
        entry = {
          count: 0,
          resetTime: now + effectiveLimits.windowMs,
        };
        rateLimitStore.set(key, entry);
      }

      // Incrementar contador
      entry.count++;

      // Agregar información al response header
      res.set("X-RateLimit-Limit", String(effectiveLimits.maxRequests));
      res.set(
        "X-RateLimit-Remaining",
        String(Math.max(effectiveLimits.maxRequests - entry.count, 0))
      );
      res.set("X-RateLimit-Reset", String(entry.resetTime));

      // Verificar si excedió el límite
      if (entry.count > effectiveLimits.maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

        res.set("Retry-After", String(retryAfter));

        throw createError(
          `Demasiadas solicitudes desde esta IP. Intenta más tarde.`,
          429,
          {
            code: "RATE_LIMIT_EXCEEDED",
            retryAfter,
            limit: effectiveLimits.maxRequests,
            windowMs: effectiveLimits.windowMs,
          }
        );
      }

      next();
    } catch (error: unknown) {
      next(error);
    }
  };
};

/**
 * Middleware de rate limiting específico para endpoints de autenticación (más restrictivo)
 * @param maxRequests Número máximo de solicitudes
 * @param windowMs Ventana de tiempo
 */
export const authRateLimiter = (maxRequests: number = 5, windowMs: number = 15 * 60 * 1000) => {
  return rateLimiter(maxRequests, windowMs);
};


