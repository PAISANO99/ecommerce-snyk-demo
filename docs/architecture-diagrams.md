# Diagramas de arquitectura

## 1. Estado actual observado en develop

El sistema esta organizado como frontend React/Vite y backend Express/Prisma, con JWT para sesion, admin por rol y logica de compra repartida entre carrito, checkout y ordenes.

## 2. Evidencia concreta

- App backend: `server/src/app.ts`
- Auth y JWT: `server/src/config/jwt.ts`, `server/src/middlewares/auth.ts`
- Carrito: `server/src/routes/cart.ts`
- Ordenes: `server/src/routes/orders.ts`, `server/src/controllers/orderController.ts`
- Inventario: `server/src/services/inventoryService.ts`
- Cliente API: `client/src/services/api.ts`
- Rutas frontend: `client/src/routes/AppRoutes.tsx`

## 3. Diagramas actuales

### Componentes principales

```text
React/Vite client
  -> AppRoutes guards
  -> services/api.ts
  -> localStorage session
  -> pages Cart / Checkout / Admin

Express API
  -> app.ts mounts routes
  -> auth routes/controllers
  -> cart routes with inventory reservation
  -> orders route/controller
  -> admin routes with role checks
  -> validation and error middlewares

Prisma/PostgreSQL
  -> User / Cart / CartItem
  -> Product / ProductVariant / Category
  -> Order / OrderItem
```

### Flujo de sesion

```text
POST /api/auth/login or /api/auth/register
  -> controller validates credentials
  -> generateToken({ id, email, role })
  -> client stores token and user in localStorage
  -> authApi adds Authorization header on authenticated requests
```

### Flujo actual de compra

```text
Catalog/ProductDetail
  -> POST /api/cart/items
  -> cart reserves stock atomically

Cart
  -> PATCH or DELETE /api/cart/items/:id
  -> backend adjusts stock delta or restore

Checkout frontend
  -> guarded route in AppRoutes
  -> createOrderRequest via authApi

POST /api/orders backend
  -> validates payload
  -> tries req.userId or JWT if present
  -> if not, can resolve by payload.userId or email
  -> restores reserved cart stock
  -> recalculates total from DB prices
  -> decrements authoritative stock
  -> creates order and clears cart
```

### Flujo admin

```text
Admin route in frontend
  -> RequireAdmin guard
  -> /api/admin/*
  -> authenticateToken + authorizeRole([ADMIN])
```

## 4. Decisiones pendientes o brechas activas

- El flujo de compra no esta plenamente alineado entre capas:
  - frontend: checkout autenticado
  - backend: `POST /api/orders` todavia admite resolucion sin token
- El review de la PR `#17` pide usar la solucion segura como arquitectura canonica; `develop` actual solo la cumple parcialmente en ordenes.
- La arquitectura actual no tiene un modulo unificado para politica de totales; carrito, checkout y orden persisten calculos distintos.

## 5. Propuesta de estandarizacion futura

- Consolidar el flujo de compra en una arquitectura con ownership de usuario unico y validado por token.
- Unificar calculo de totales en una capa compartida o explicitamente canonica.
- Publicar estos diagramas como anexo de arquitectura viva del proyecto, no como foto de un sprint historico.
