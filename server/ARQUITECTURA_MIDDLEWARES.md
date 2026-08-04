# Arquitectura de Middlewares

## Estructura de Carpetas

```
server/
├── src/
│   ├── middlewares/                 ← 🎯 CARPETA NUEVA DE MIDDLEWARES
│   │   ├── errorHandler.ts          ← Manejo centralizado de errores
│   │   ├── logger.ts                ← Logging de solicitudes HTTP
│   │   ├── auth.ts                  ← Autenticación y autorización
│   │   ├── validation.ts            ← Validación de datos de entrada
│   │   ├── rateLimiter.ts           ← Limitador de tasa de solicitudes
│   │   └── index.ts                 ← Archivo de exportación central
│   ├── routes/
│   │   └── auth.ts                  [MODIFICADO - Ahora usa middlewares]
│   ├── controllers/
│   ├── services/
│   ├── config/
│   ├── types/
│   └── index.ts                     [MODIFICADO - Middlewares integrados]
├── MIDDLEWARES.md                   ← 📖 Documentación completa
└── ARQUITECTURA_MIDDLEWARES.md      ← Este archivo
```

---

## Flujo de Solicitudes

```
┌─────────────────────────────────────────────────────────────────┐
│                     Cliente HTTP                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │   1. CORS & JSON Parser              │
        │   (Middlewares de Express)           │
        └──────────────────────┬───────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────┐
        │   2. Logger                          │
        │   (Registra solicitud)               │
        └──────────────────────┬───────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────┐
        │   3. Rate Limiter Global             │
        │   (Verifica límite por IP)           │
        └──────────────────────┬───────────────┘
                               │
                    ┌──────────┴─────────┐
                    │                    │
         ¿Límite excedido?      ¿Límite OK?
                    │                    │
                    ▼                    ▼
              Error 429          ┌──────────────────────────┐
                                 │   4. Rutas              │
                                 │   (/api/auth/...)       │
                                 └──────────┬───────────────┘
                                            │
                        ┌───────────────────┼───────────────────┐
                        │                   │                   │
                        ▼                   ▼                   ▼
            ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐
            │   Auth Rate      │  │   Validación    │  │ Autenticación│
            │   Limiter        │  │   de Datos      │  │              │
            │   (5 req/15min)  │  │   (schema)      │  │              │
            └────────┬─────────┘  └────────┬────────┘  └────────┬─────┘
                     │                     │                     │
                     └─────────┬───────────┴─────────┬───────────┘
                               │                     │
                     ¿Válido?   │         ¿Válido?    │ ¿Token OK?
                               │                     │
                               ▼                     ▼
                          Controlador            Controlador
                          (Lógica de negocio)    (Lógica de negocio)
                               │                     │
                               └─────────┬───────────┘
                                         │
                                         ▼
                            ┌──────────────────────────┐
                            │   5. Error Handler       │
                            │   (Captura excepciones)  │
                            └──────────┬───────────────┘
                                       │
                                       ▼
                              Response JSON formateada
                                       │
                                       ▼
                               Cliente recibe
                                 respuesta
```

---

## Cada Middleware en Detalle

### 1️⃣ **errorHandler.ts**
```
Responsabilidad: Capturar y procesar errores
Ubicación en flujo: FINAL (después de todas las rutas)
Funciones principales:
  • errorHandler(error, req, res, next)
  • asyncHandler(fn) - Wrapper para rutas async
  • createError(message, statusCode, details)
```

### 2️⃣ **logger.ts**
```
Responsabilidad: Registrar solicitudes HTTP
Ubicación en flujo: TEMPRANO (después de CORS y JSON)
Funciones principales:
  • logger(req, res, next) - Logging principal
  • requestLogger(req, res, next) - Logging detallado (debugging)
```

### 3️⃣ **auth.ts**
```
Responsabilidad: Autenticación y autorización
Ubicación en flujo: POR RUTA (en rutas específicas)
Funciones principales:
  • authenticateToken(req, res, next) - Verifica token
  • authorizeRole(roles) - Valida roles
  • guestOnly(req, res, next) - Solo no autenticados
```

### 4️⃣ **validation.ts**
```
Responsabilidad: Validar datos de entrada
Ubicación en flujo: POR RUTA (antes del controlador)
Funciones principales:
  • validateRequest(schema) - Valida según esquema
  • validateRequired(fields) - Valida campos requeridos
  • validationSchemas - Esquemas predefinidos
```

### 5️⃣ **rateLimiter.ts**
```
Responsabilidad: Limitar tasa de solicitudes
Ubicación en flujo: Por ruta O global
Funciones principales:
  • rateLimiter(max, windowMs) - Rate limit configurable
  • authRateLimiter(max, windowMs) - Para autenticación
```

---

## Ejemplo: Ruta POST /api/auth/login

```
POST /api/auth/login
↓
[1] CORS & JSON Parser ✓
↓
[2] Logger
    → Registra: "POST /api/auth/login"
↓
[3] Rate Limiter Global (100/min)
    → Verifica IP
↓
[4] Auth Rate Limiter (5/15min)
    → Límite específico para autenticación
↓
[5] Validación
    → Esquema: validationSchemas.login
    → Valida: email y password
↓
[6] Controlador Login
    → Busca usuario en BD
    → Verifica contraseña
    → Genera token
↓
[7] Respuesta exitosa
    → Logger registra: 200, 145ms
↓
← Cliente recibe: { token, user }
```

---

## Tipos de Errores Manejados

```
400 Bad Request
├── Validación fallida
├── Campos requeridos faltantes
└── Datos en formato incorrecto

401 Unauthorized
├── Token no proporcionado
└── Token inválido

403 Forbidden
└── Permisos insuficientes

429 Too Many Requests
└── Límite de solicitudes excedido

500 Internal Server Error
└── Error no previsto en el servidor
```

---

## Integración Paso a Paso

### Ya está integrado:

✅ **En `index.ts`:**
- Logger global
- Rate limiter global
- Error handler

✅ **En `routes/auth.ts`:**
- Auth rate limiter (login y register)
- Validación de datos

### Cómo agregar a nuevas rutas:

```typescript
import { Router } from "express";
import {
  validateRequest,
  authenticateToken,
  asyncHandler,
  authRateLimiter,
} from "../middlewares";

const router = Router();

// Ejemplo 1: Ruta pública con validación
router.post(
  "/crear-producto",
  validateRequest(validationSchemas.product),
  asyncHandler(async (req, res) => {
    // Tu lógica
  })
);

// Ejemplo 2: Ruta privada
router.get(
  "/mi-perfil",
  authenticateToken,
  asyncHandler(async (req, res) => {
    // Tu lógica
  })
);

// Ejemplo 3: Ruta con todos los middlewares
router.post(
  "/cambiar-password",
  authRateLimiter(3, 600000), // 3 intentos por 10 min
  authenticateToken,
  validateRequest(validationSchemas.changePassword),
  asyncHandler(async (req, res) => {
    // Tu lógica
  })
);

export default router;
```

---

## Configuración Recomendada por Ambiente

### Desarrollo (NODE_ENV=development)
```
Rate Limiting: 1000 solicitudes/minuto
Logging: Detallado con colores
Errores: Incluyen detalles técnicos
```

### Producción (NODE_ENV=production)
```
Rate Limiting: 100 solicitudes/minuto
Logging: Solo solicitudes fallidas
Errores: Mensajes genéricos (sin detalles)
```

---

## Seguridad

| Aspecto | Middleware | Nivel |
|--------|-----------|-------|
| Validación entrada | `validation.ts` | 🟢 Alto |
| Rate limiting | `rateLimiter.ts` | 🟢 Alto |
| Autenticación | `auth.ts` | 🟡 Medio |
| Manejo errores | `errorHandler.ts` | 🟢 Alto |
| Logging/Auditoría | `logger.ts` | 🟡 Medio |

---

## Próximas Mejoras Sugeridas

- JWT para autenticación robusta
- Helmet para headers de seguridad
- CSRF protection
- Request compression
- Response caching
- Métricas/Monitoreo
- Swagger/OpenAPI docs
