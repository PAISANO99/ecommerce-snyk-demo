/**
 * Archivo central de exportación de middlewares
 * Facilita la importación de todos los middlewares desde un único punto
 */

// Error Handler
export {
  errorHandler,
  asyncHandler,
  createError,
} from "./errorHandler";

// Logger
export { logger, requestLogger } from "./logger";

// Authentication
export {
  authenticateToken,
  authorizeRole,
  guestOnly,
  AuthenticatedRequest,
} from "./auth";

// Validation
export {
  validateRequest,
  validateRequired,
  validationSchemas,
} from "./validation";

// Rate Limiter
export { rateLimiter, authRateLimiter, clearRateLimitStore } from "./rateLimiter";
