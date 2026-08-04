import { Request, Response, NextFunction } from "express";

/**
 * Colores para la consola
 */
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

/**
 * Obtiene el color basado en el código de estado HTTP
 */
const getStatusColor = (statusCode: number): string => {
  if (statusCode >= 500) return colors.red;
  if (statusCode >= 400) return colors.yellow;
  if (statusCode >= 300) return colors.cyan;
  if (statusCode >= 200) return colors.green;
  return colors.blue;
};

/**
 * Middleware de logging para todas las solicitudes HTTP
 * Registra: método, ruta, tiempo de respuesta, código de estado, tamaño de respuesta
 */
export const logger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalSend = res.send.bind(res) as Response["send"];

  // Interceptar el envío de respuesta
  res.send = ((data: unknown) => {
    const duration = Date.now() - startTime;
    const statusColor = getStatusColor(res.statusCode);

    const logMessage = `${colors.bright}[${new Date().toISOString()}]${colors.reset} ${statusColor}${res.statusCode}${colors.reset} ${colors.blue}${req.method}${colors.reset} ${req.path} - ${duration}ms`;

    console.log(logMessage);

    // Log adicional en desarrollo para requests fallidas
    if (process.env.NODE_ENV === "development" && res.statusCode >= 400) {
      console.log(`  Body: ${JSON.stringify(req.body)}`);
    }

    return originalSend(data);
  }) as Response["send"];

  next();
};

/**
 * Middleware que registra detalles de la solicitud (útil para debugging)
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(
    `${colors.cyan}[REQUEST]${colors.reset}`,
    {
      method: req.method,
      path: req.path,
      query: req.query,
      ...(Object.keys(req.body).length > 0 && {
        body: JSON.stringify(req.body),
      }),
      timestamp: new Date().toISOString(),
    }
  );

  next();
};
