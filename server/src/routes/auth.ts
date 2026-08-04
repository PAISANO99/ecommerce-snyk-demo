import { Router, Response } from "express";
import { login } from "../controllers/authControllerLogin";
import { register } from "../controllers/authControllerRegister";
import {
  validateRequest,
  authRateLimiter,
  validationSchemas,
  authenticateToken,
  authorizeRole,
} from "../middlewares";
import { AuthenticatedRequest } from "../middlewares/auth";

const router = Router();
const authRateLimitMaxRequests = Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 5;
const authRateLimitWindowMs = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;

/**
 * POST /api/auth/register
 * Registrar un nuevo usuario con validación de datos
 * Rate limited: 5 solicitudes por 15 minutos
 */
router.post(
  "/register",
  authRateLimiter(authRateLimitMaxRequests, authRateLimitWindowMs),
  validateRequest(validationSchemas.register),
  register
);

/**
 * POST /api/auth/login
 * Login de usuario con validación de datos
 * Rate limited: 5 solicitudes por 15 minutos
 */
router.post(
  "/login",
  authRateLimiter(authRateLimitMaxRequests, authRateLimitWindowMs),
  validateRequest(validationSchemas.login),
  login
);

/**
 * GET /api/auth/me
 * Obtener datos del usuario autenticado
 * Requerido: Bearer token JWT válido
 */
router.get("/me", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    message: "Datos del usuario autenticado",
    user: req.user,
  });
});

/**
 * GET /api/auth/profile
 * Obtener perfil del usuario
 * Requerido: Bearer token JWT válido
 */
router.get(
  "/profile",
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    res.json({
      message: "Perfil del usuario",
      userId: req.user?.id,
      email: req.user?.email,
      role: req.user?.role,
    });
  }
);

/**
 * GET /api/auth/admin-only
 * Ejemplo de endpoint solo para administradores
 * Requerido: Bearer token JWT válido con rol ADMIN
 */
router.get(
  "/admin-only",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  (req: AuthenticatedRequest, res: Response) => {
    res.json({
      message: "Acceso de administrador confirmado",
      accessLevel: "admin",
    });
  }
);

export default router;
