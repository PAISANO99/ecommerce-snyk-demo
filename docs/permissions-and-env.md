# Permisos y entorno

## 1. Estado actual observado en develop

La aplicacion combina permisos por rol, proteccion por token y configuracion por variables de entorno para auth, CORS y rate limiting.

## 2. Evidencia concreta

- App y montaje de rutas: `server/src/app.ts`
- Auth y roles: `server/src/middlewares/auth.ts`
- Rutas admin: `server/src/routes/admin.ts`
- Rate limiting: `server/src/middlewares/rateLimiter.ts`
- Variables de ejemplo: `server/.env.example`
- Cliente API base: `client/src/services/api.ts`
- Guards frontend: `client/src/routes/AppRoutes.tsx`

## 3. Permisos actuales

### Publico

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- catalogo y categorias por lectura
- `POST /api/orders` en backend actual

### Usuario autenticado

- `/home`, `/catalogo`, `/products/:id`, `/cart`, `/checkout` y rutas relacionadas en frontend
- `/api/auth/me`
- `/api/auth/profile`
- `/api/cart/*`
- `GET /api/orders`

### Administrador

- `/admin` y subrutas frontend
- `/api/auth/admin-only`
- `/api/admin/*`
- mutaciones admin de productos y categorias

## 4. Variables de entorno observadas

### Backend

- `DATABASE_URL`
- `PORT`
- `JWT_SECRET`
- `JWT_EXPIRY`
- `CLIENT_ORIGIN`
- `ADMIN_SEED_PASSWORD`
- `CLIENT_SEED_PASSWORD`
- `RATE_LIMIT_MAX_REQUESTS`
- `RATE_LIMIT_WINDOW_MS`
- `AUTH_RATE_LIMIT_MAX_REQUESTS`
- `AUTH_RATE_LIMIT_WINDOW_MS`
- `TRUST_PROXY_HOPS`

### Variables leidas en app pero no visibles en `.env.example`

- `ALLOWED_ORIGINS`
- `ALLOWED_ORIGIN_PATTERNS`

Observacion:

- `server/src/app.ts` ya soporta esas variables para CORS, pero `server/.env.example` todavia no las documenta.

### Frontend

- `VITE_API_URL`

Comportamiento observado:

- si no existe `VITE_API_URL`, el cliente usa `http://localhost:3000`

## 5. Rate limiting actual

- `development`: minimo `1000` requests por ventana y bypass para `127.0.0.1`, `::1`, `::ffff:127.0.0.1`
- `production`: usa los limites configurados
- `authRateLimiter` reutiliza el mismo middleware con parametros distintos

Contexto de equipo:

- PR `#16` valido este ajuste por ambiente como nueva base tecnica para QA de rendimiento local

## 6. Decisiones pendientes o brechas activas

- `AUTH_RATE_LIMIT_MAX_REQUESTS` y `AUTH_RATE_LIMIT_WINDOW_MS` en `.env.example` aparecen hoy con `100/120000`, mientras comentarios historicos del repo hablan de `5/15m`; la documentacion debe reflejar el estado actual y no el comentario viejo.
- `ALLOWED_ORIGINS` y `ALLOWED_ORIGIN_PATTERNS` necesitan documentacion explicita en el ejemplo de entorno para evitar configuraciones parciales.
- `POST /api/orders` sigue publico en backend actual; por eso no puede incluirse en la matriz de permisos como autenticado estricto.

## 7. Propuesta de estandarizacion futura

- Alinear `server/.env.example`, README y despliegue con todas las variables realmente soportadas.
- Publicar una matriz unica de permisos por ruta y rol como referencia operativa del equipo.
- Revisar si el bypass de rate limiting en `development` debe convivir con una configuracion diferenciada para `test` si el proyecto crece.
