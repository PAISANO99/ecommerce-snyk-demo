import type { NextFunction, Request, Response } from "express";

/**
 * Interfaz personalizada para errores de la aplicación
 */
interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

/**
 * Middleware de manejo de errores centralizado
 * Captura todos los errores de la aplicación y retorna una respuesta consistente
 */
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Error interno del servidor";
  const details = error.details || null;

  console.error(`[ERROR] ${statusCode} - ${message}`, {
    path: req.path,
    method: req.method,
    details,
    timestamp: new Date().toISOString(),
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === "development" && { details }),
    },
  });
};

/**
 * Wrapper para manejar errores asincronos en rutas
 * Úsalo así: router.post('/ruta', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Función para crear errores personalizados
 */
export const createError = (
  message: string,
  statusCode: number = 500,
  details?: unknown
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.details = details;
  return error;
};
