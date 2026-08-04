## 🚀 Ejemplos Prácticos - Copia y Pega

### 1. Ruta GET pública sin validación

```typescript
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
```

---

### 2. Ruta POST pública con validación

```typescript
import { validateRequest, validationSchemas } from "../middlewares";

router.post(
  "/login",
  validateRequest(validationSchemas.login),
  loginController
);
```

---

### 3. Ruta POST pública con rate limiting y validación

```typescript
import { 
  validateRequest, 
  validationSchemas, 
  authRateLimiter 
} from "../middlewares";

router.post(
  "/register",
  authRateLimiter(5, 900000), // 5 solicitudes por 15 min
  validateRequest(validationSchemas.register),
  registerController
);
```

---

### 4. Ruta GET privada (requiere autenticación)

```typescript
import { authenticateToken } from "../middlewares";

router.get(
  "/profile",
  authenticateToken,
  profileController
);
```

---

### 5. Ruta PUT privada con validación

```typescript
import { 
  authenticateToken, 
  validateRequest 
} from "../middlewares";

const updateProfileSchema = {
  name: {
    required: true,
    type: "string" as const,
    minLength: 2,
    maxLength: 100,
  },
  email: {
    required: true,
    type: "email" as const,
  },
};

router.put(
  "/profile",
  authenticateToken,
  validateRequest(updateProfileSchema),
  updateProfileController
);
```

---

### 6. Ruta DELETE con rate limiting específico

```typescript
import { authenticateToken, authRateLimiter } from "../middlewares";

router.delete(
  "/account",
  authenticateToken,
  authRateLimiter(3, 600000), // 3 intentos por 10 minutos
  deleteAccountController
);
```

---

### 7. Controlador con manejo de errores

```typescript
import { asyncHandler, createError } from "../middlewares";

export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Buscar usuario
  const user = await userService.findByEmail(email);
  
  if (!user) {
    throw createError("Credenciales inválidas", 401, {
      code: "INVALID_CREDENTIALS",
    });
  }

  // Verificar contraseña
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw createError("Credenciales inválidas", 401, {
      code: "INVALID_CREDENTIALS",
    });
  }

  // Generar token y responder
  const token = generateToken(user.id);
  
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  });
});
```

---

### 8. Esquema de validación personalizado

```typescript
import { validateRequest } from "../middlewares";

const createProductSchema = {
  title: {
    required: true,
    type: "string" as const,
    minLength: 3,
    maxLength: 200,
    message: "Título debe tener entre 3 y 200 caracteres",
  },
  
  price: {
    required: true,
    type: "number" as const,
    custom: (value) => value > 0,
    message: "El precio debe ser mayor a 0",
  },
  
  category: {
    required: true,
    type: "string" as const,
    pattern: /^[a-z_]+$/,
    message: "Categoría inválida (solo minúsculas y guion bajo)",
  },
  
  description: {
    type: "string" as const,
    maxLength: 1000,
  },
  
  stock: {
    type: "number" as const,
    custom: async (value) => {
      // Validación asincrónica si lo necesitas
      return value >= 0;
    },
  },
};

router.post(
  "/products",
  authenticateToken,
  validateRequest(createProductSchema),
  createProductController
);
```

---

### 9. Múltiples middlewares en una ruta

```typescript
import {
  authenticateToken,
  validateRequest,
  authRateLimiter,
  authorizeRole,
} from "../middlewares";

router.post(
  "/admin/users",
  authenticateToken,        // 1. Verificar autenticación
  authorizeRole(["admin"]), // 2. Verificar rol
  authRateLimiter(10, 70000), // 3. Limitar solicitudes
  validateRequest(createUserSchema), // 4. Validar datos
  createUserController      // 5. Ejecutar controlador
);
```

---

### 10. Ruta con error personalizado en controlador

```typescript
import { asyncHandler, createError } from "../middlewares";

export const updateController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  // Verificar si el email ya existe
  const existingUser = await userService.findByEmail(email);
  
  if (existingUser && existingUser.id !== id) {
    throw createError("Este email ya está registrado", 400, {
      code: "EMAIL_ALREADY_EXISTS",
      field: "email",
    });
  }

  // Actualizar usuario
  const updated = await userService.update(id, req.body);
  
  res.json({
    success: true,
    user: updated,
  });
});
```

---

### 11. Validación condicional

```typescript
const updateProductSchema = {
  title: {
    type: "string" as const,
    minLength: 3,
    maxLength: 200,
  },
  
  price: {
    type: "number" as const,
    custom: (value) => !value || value > 0, // Opcional pero si existe debe ser > 0
    message: "El precio debe ser mayor a 0",
  },
};

router.patch(
  "/products/:id",
  authenticateToken,
  validateRequest(updateProductSchema),
  updateProductController
);
```

---

### 12. Archivo de rutas completo

```typescript
import { Router } from "express";
import {
  validateRequest,
  validationSchemas,
  authRateLimiter,
  authenticateToken,
  asyncHandler,
} from "../middlewares";
import {
  loginController,
  registerController,
  logoutController,
  refreshTokenController,
} from "../controllers";

const router = Router();

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */
router.post(
  "/register",
  authRateLimiter(5, 900000),
  validateRequest(validationSchemas.register),
  registerController
);

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post(
  "/login",
  authRateLimiter(5, 900000),
  validateRequest(validationSchemas.login),
  loginController
);

/**
 * POST /api/auth/logout
 * Cerrar sesión
 */
router.post(
  "/logout",
  authenticateToken,
  logoutController
);

/**
 * POST /api/auth/refresh
 * Refrescar token
 */
router.post(
  "/refresh",
  authRateLimiter(10, 60000),
  refreshTokenController
);

export default router;
```

---

## 📋 Checklist para Nueva Ruta

- [ ] ¿Requiere autenticación? → Agregar `authenticateToken`
- [ ] ¿Requiere validación de datos? → Agregar `validateRequest(schema)`
- [ ] ¿Es sensible (login, cambio password)? → Agregar `authRateLimiter`
- [ ] ¿Es asincrónica? → Envolver en `asyncHandler`
- [ ] ¿Puede lanzar errores? → Usar `createError` dentro de asyncHandler
- [ ] ¿Está documentada? → Agregar comentario JSDoc

---

## 🔧 Solución de Problemas

### Error 400 - Datos inválidos
```json
{
  "success": false,
  "error": {
    "message": "Datos inválidos",
    "statusCode": 400,
    "details": {
      "code": "VALIDATION_ERROR",
      "errors": {
        "email": "Email válido requerido"
      }
    }
  }
}
```
**Solución:** Verificar que los datos enviados cumplan con el esquema

---

### Error 401 - No autenticado
```json
{
  "success": false,
  "error": {
    "message": "Token no proporcionado",
    "statusCode": 401
  }
}
```
**Solución:** Enviar header `Authorization: Bearer <token>`

---

### Error 429 - Demasiadas solicitudes
```json
{
  "success": false,
  "error": {
    "message": "Demasiadas solicitudes desde esta IP",
    "statusCode": 429,
    "details": {
      "code": "RATE_LIMIT_EXCEEDED",
      "retryAfter": 45
    }
  }
}
```
**Solución:** Esperar `retryAfter` segundos antes de reintentar

---

## 🎯 Casos de Uso Comunes

| Caso | Middlewares |
|------|-----------|
| Ruta pública sin datos | Nada |
| Ruta pública con datos | `validateRequest` |
| Login/Register | `authRateLimiter` + `validateRequest` |
| Acceso privado | `authenticateToken` |
| Modificar datos privados | `authenticateToken` + `validateRequest` |
| Operación crítica | `authenticateToken` + `authRateLimiter` + `validateRequest` |
