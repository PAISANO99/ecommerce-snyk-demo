# Sistema de Middlewares - Documentación

## Descripción General

Este proyecto incluye un sistema completo y bien estructurado de middlewares para Express.js. Cada middleware está diseñado para manejar aspectos específicos de la aplicación de forma modular y reutilizable.

---

## Middlewares Disponibles

### 1. **Error Handler** (`errorHandler.ts`)

Maneja todos los errores de la aplicación de forma centralizada y retorna respuestas consistentes.

#### Funciones principales:

- **`errorHandler`** - Middleware principal para capturar y procesar errores
- **`asyncHandler`** - Wrapper para manejar errores en rutas asincrónicas
- **`createError`** - Función factory para crear errores personalizados

#### Ejemplo de uso:

```typescript
import { asyncHandler, createError } from "../middlewares";

// En un controlador
export const miRuta = asyncHandler(async (req, res) => {
  if (!req.body.email) {
    throw createError("Email es requerido", 400, {
      code: "MISSING_EMAIL",
    });
  }
  res.json({ success: true });
});

// El error será capturado y manejado por errorHandler
```

#### Respuesta de error:

```json
{
  "success": false,
  "error": {
    "message": "Email es requerido",
    "statusCode": 400,
    "details": {
      "code": "MISSING_EMAIL"
    }
  }
}
```

---

### 2. **Logger** (`logger.ts`)

Registra todas las solicitudes HTTP con información detallada sobre método, ruta, tiempo de respuesta y código de estado.

#### Funciones principales:

- **`logger`** - Middleware principal que registra todas las solicitudes
- **`requestLogger`** - Middleware adicional para debugging

#### Características:

- Registro de tiempo de respuesta
- Colores en la consola para mejor legibilidad
- Diferentes colores según código de estado HTTP
- Información adicional en modo desarrollo

#### Ejemplo de salida:

```
[2026-04-13T10:30:45.123Z] 401 POST /api/auth/login - 145ms
```

---

### 3. **Autenticación** (`auth.ts`)

Middlewares para gestionar la autenticación y autorización de usuarios.

#### Funciones principales:

- **`authenticateToken`** - Valida que exista token en headers
- **`authorizeRole`** - Valida roles de usuario (extensible)
- **`guestOnly`** - Restricción para rutas que requieren estar desautenticado

#### Ejemplo de uso:

```typescript
import { authenticateToken, guestOnly } from "../middlewares";

// Ruta protegida (requiere autenticación)
router.get(
  "/profile",
  authenticateToken,
  (req, res) => {
    res.json({ message: "Perfil del usuario" });
  }
);

// Ruta solo para no autenticados (login, registro)
router.post(
  "/login",
  guestOnly,
  (req, res) => {
    res.json({ message: "Login exitoso" });
  }
);
```

---

### 4. **Validación** (`validation.ts`)

Sistema completo de validación para datos de entrada con mensajes de error personalizables.

#### Funciones principales:

- **`validateRequest`** - Valida el request body contra un esquema
- **`validateRequired`** - Valida campos requeridos
- **`validationSchemas`** - Esquemas predefinidos para casos comunes

#### Esquemas disponibles:

- `validationSchemas.login` - Email y contraseña
- `validationSchemas.register` - Email, contraseña y nombre

#### Ejemplo de uso:

```typescript
import { validateRequest, validationSchemas } from "../middlewares";

// Usar esquema predefinido
router.post(
  "/login",
  validateRequest(validationSchemas.login),
  loginController
);

// Crear esquema personalizado
const customSchema = {
  username: {
    required: true,
    type: "string" as const,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: "Username inválido (3-20 caracteres, solo letras, números, _)",
  },
  age: {
    type: "number" as const,
    custom: async (value) => value >= 18,
    message: "Debes ser mayor de 18 años",
  },
};

router.post(
  "/special",
  validateRequest(customSchema),
  specialController
);
```

#### Reglas de validación disponibles:

- `required: boolean` - Si el campo es obligatorio
- `type: string | email | number | boolean` - Tipo de dato
- `minLength: number` - Longitud mínima (para strings)
- `maxLength: number` - Longitud máxima (para strings)
- `pattern: RegExp` - Patrón regex a cumplir
- `custom: (value) => boolean | Promise<boolean>` - Validación personalizada
- `message: string` - Mensaje de error personalizado

#### Respuesta de validación fallida:

```json
{
  "success": false,
  "error": {
    "message": "Datos inválidos",
    "statusCode": 400,
    "details": {
      "code": "VALIDATION_ERROR",
      "errors": {
        "email": "Email válido requerido",
        "password": "Contraseña requerida (mínimo 8 caracteres)"
      }
    }
  }
}
```

---

### 5. **Rate Limiter** (`rateLimiter.ts`)

Middleware para limitar el número de solicitudes por IP en un período de tiempo.

#### Funciones principales:

- **`rateLimiter`** - Rate limit general configurable
- **`authRateLimiter`** - Rate limit específico para autenticación (más restrictivo)

#### Ejemplo de uso:

```typescript
import { rateLimiter, authRateLimiter } from "../middlewares";

// Rate limit global: 100 solicitudes por minuto
app.use(rateLimiter(100, 60000));

// Rate limit para autenticación: 5 solicitudes por 15 minutos
router.post(
  "/login",
  authRateLimiter(5, 900000),
  loginController
);
```

#### Headers de respuesta:

- `X-RateLimit-Limit` - Límite máximo de solicitudes
- `X-RateLimit-Remaining` - Solicitudes restantes
- `X-RateLimit-Reset` - Marca de tiempo para reset
- `Retry-After` - Segundos hasta poder reintentar (en caso de límite excedido)

#### Respuesta cuando se excede el límite:

```json
{
  "success": false,
  "error": {
    "message": "Demasiadas solicitudes desde esta IP. Intenta más tarde.",
    "statusCode": 429,
    "details": {
      "code": "RATE_LIMIT_EXCEEDED",
      "retryAfter": 45,
      "limit": 5,
      "windowMs": 900000
    }
  }
}
```

---

## Orden de Middlewares en `index.ts`

El orden importa. Los middlewares deben estar en este orden:

```typescript
// 1. Middlewares de utilidad (CORS, JSON parsing)
app.use(cors());
app.use(express.json());

// 2. Logging
app.use(logger);

// 3. Rate limiting global
app.use(rateLimiter());

// 4. Rutas
app.use("/api/auth", authRoutes);

// 5. Error handler (SIEMPRE al final)
app.use(errorHandler);
```

---

## Ejemplo Completo de Ruta Protegida

```typescript
import { Router } from "express";
import {
  authenticateToken,
  validateRequest,
  rateLimiter,
  asyncHandler,
  createError,
} from "../middlewares";

const router = Router();

// Definir esquema de validación
const updateProfileSchema = {
  name: {
    required: true,
    type: "string" as const,
    minLength: 2,
  },
  bio: {
    type: "string" as const,
    maxLength: 500,
  },
};

// Ruta protegida con validación y rate limiting
router.put(
  "/profile",
  authenticateToken, // 1. Verificar autenticación
  rateLimiter(10, 60000), // 2. Rate limit: 10 solicitudes por minuto
  validateRequest(updateProfileSchema), // 3. Validar datos
  asyncHandler(async (req, res) => {
    // 4. Lógica de la ruta
    res.json({ success: true, message: "Perfil actualizado" });
  })
);

export default router;
```

---

## Integración en Nuevas Rutas

Para agregar middlewares a una nueva ruta:

```typescript
import { Router } from "express";
import {
  validateRequest,
  authRateLimiter,
  authenticateToken,
  validationSchemas,
} from "../middlewares";
import { miControlador } from "../controllers";

const router = Router();

router.post(
  "/mi-ruta",
  authRateLimiter(), // Proteger contra brute force
  validateRequest(validationSchemas.login), // Validar entrada
  authenticateToken, // Exigir autenticación
  miControlador // Tu controlador
);

export default router;
```

---

## Creación de Esquemas de Validación Reutilizables

Puedes mantener esquemas comunes en `validationSchemas`:

```typescript
// En validation.ts, agregar:
export const validationSchemas = {
  // ... esquemas existentes ...

  updateProfile: {
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
  },

  createProduct: {
    title: {
      required: true,
      type: "string" as const,
      minLength: 3,
      maxLength: 200,
    },
    price: {
      required: true,
      type: "number" as const,
      custom: (value) => value > 0,
      message: "El precio debe ser mayor a 0",
    },
  },
};
```

---

## Consideraciones de Seguridad

- ✅ **Rate Limiting**: Protege contra ataques de fuerza bruta
- ✅ **Validación**: Previene inyección de datos maliciosos
- ✅ **Manejo de Errores**: No expone información sensible en producción
- ✅ **Autenticación**: Valida identidad de usuarios
- ✅ **Logging**: Facilita auditoría y debugging

---

## Variables de Entorno

```env
# Modo de la aplicación
NODE_ENV=development  # development o production

# Puerto del servidor
PORT=4000

# Origen del cliente (CORS)
CLIENT_ORIGIN=http://localhost:5173
```

---

## Próximas Mejoras

- [ ] Implementar JWT para autenticación
- [ ] Agregar middleware CSRF
- [ ] Implementar compresión de respuestas
- [ ] Agregar helmet para headers de seguridad
- [ ] Implementar caching
- [ ] Agregar métricas y monitoreo

---

## Soporte

Si tienes dudas sobre cómo usar los middlewares, consulta los archivos en `/server/src/middlewares/` que contienen comentarios detallados.
