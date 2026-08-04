# Ecommerce Vibe Pulse

Aplicacion web de e-commerce con frontend en React/Vite y backend en Express/Prisma. El estado actual de `develop` ya incluye autenticacion, catalogo, carrito, checkout, ordenes y modulo administrativo.

## Estado actual

- Este repositorio ya no corresponde solo a Sprint 1.
- Alcance observable hoy:
  - autenticacion y registro
  - catalogo y categorias
  - carrito persistente para usuario autenticado
  - checkout y creacion de orden
  - panel administrativo
  - pruebas API, component y E2E base

## Documentacion tecnica del Bloque 5

Referencia canonica actual:

- `docs/README.md`
- `docs/data-model.md`
- `docs/auth-session.md`
- `docs/business-rules-cart-order-payment.md`
- `docs/traceability-matrix.md`
- `docs/api-contracts-and-errors.md`
- `docs/permissions-and-env.md`
- `docs/architecture-diagrams.md`

Contexto local usado para QA:

- `docs/Informe_Consolidado_QA_VibePulse.docx.pdf`

Referencia historica de integracion:

- `INTEGRACION-SPRINT3.md`

## Stack

- Frontend: React 18 + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Base de datos: PostgreSQL + Prisma ORM
- Seguridad: JWT + bcrypt
- Testing: Vitest, Supertest, Cypress Component, Playwright

## Configuracion rapida

### Backend

```bash
cd server
npm install
cp .env.example .env
npx prisma db push
npx prisma db seed
npm run dev
```

Puerto observado por defecto:

- `http://localhost:3000`

Health check observado:

```json
{"status":"ok","message":"API is running"}
```

Variables clave observadas:

- `DATABASE_URL`
- `PORT`
- `JWT_SECRET`
- `JWT_EXPIRY`
- `CLIENT_ORIGIN`
- `RATE_LIMIT_MAX_REQUESTS`
- `RATE_LIMIT_WINDOW_MS`
- `AUTH_RATE_LIMIT_MAX_REQUESTS`
- `AUTH_RATE_LIMIT_WINDOW_MS`
- `TRUST_PROXY_HOPS`

### Frontend

```bash
cd client
npm install
npm run dev
```

Puerto de desarrollo esperado:

- `http://localhost:5173`

Backend por defecto si no se define `VITE_API_URL`:

- `http://localhost:3000`

## Flujos principales observables

- Registro y login con JWT.
- Guards de frontend para usuario autenticado y admin.
- Carrito protegido con reserva atomica de stock.
- Checkout con metodos `tarjeta` y `paypal` simulados.
- Creacion de orden con recalculo autoritativo de precios.
- Backoffice admin para metricas, usuarios, pedidos, productos y categorias.

## Endpoints principales

### Publicos observados

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/products/featured`
- `GET /api/products/:id`
- `GET /api/categories`
- `GET /api/categories/:slug`
- `POST /api/orders`

### Protegidos observados

- `GET /api/auth/me`
- `GET /api/auth/profile`
- `GET /api/auth/admin-only`
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:id`
- `DELETE /api/cart/items/:id`
- `GET /api/orders`
- `GET /api/admin/dashboard/metrics`
- `GET /api/admin/users`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id/status`
- mutaciones admin de productos y categorias

## Tension abierta importante

El criterio del equipo expresado en el review de la PR `#17` pide tratar ordenes como flujo `100%` autenticado y alineado con la solucion segura de la PR `#14`. El `develop` actual no cierra del todo esa expectativa:

- frontend: `/checkout` esta protegido y `createOrderRequest` usa request autenticada
- backend: `GET /api/orders` si requiere token
- backend: `POST /api/orders` sigue sin `authenticateToken`

La documentacion del Bloque 5 toma `develop` como verdad principal y deja esa diferencia como brecha activa, no como contrato falso.

## Seguridad relevante hoy

- Registro duplicado responde `400` con mensaje generico.
- Login usa comparacion dummy para reducir timing leak.
- Inventario de carrito y orden usa operaciones atomicas sobre producto o variante.
- El backend recalcula el total de orden con precio de base de datos.

## Cuenta admin por seed

El proyecto incluye seed para cuenta administrativa. Revisa `server/prisma/seed.ts` y `server/.env.example` antes de usar credenciales en entornos compartidos.

## Testing rapido

Backend:

```bash
cd server
npm test
```

Frontend:

```bash
cd client
npm run test
npm run test:component
npm run test:e2e
```

## Licencia

Proyecto con fin educativo.
