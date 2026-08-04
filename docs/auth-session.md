# Autenticacion y sesion

## 1. Estado actual observado en develop

La aplicacion usa JWT con almacenamiento en frontend y rutas protegidas tanto en cliente como en backend, pero el flujo de ordenes conserva una brecha de consistencia.

Comportamiento observado:

- Login y registro devuelven `token` y `user`.
- El JWT contiene `id`, `email` y `role`.
- El frontend guarda usuario y token en `localStorage`.
- Las guards del frontend protegen rutas de cliente y admin usando `getAuth()`.
- El backend espera `Authorization: Bearer <token>` para rutas protegidas.
- `GET /api/orders` requiere token.
- `POST /api/orders` no exige `authenticateToken`, aunque el frontend lo llama como request autenticada.

## 2. Evidencia concreta

- JWT y expiracion: `server/src/config/jwt.ts`
- Login: `server/src/controllers/authControllerLogin.ts`
- Registro: `server/src/controllers/authControllerRegister.ts`
- Middleware auth: `server/src/middlewares/auth.ts`
- Rutas auth: `server/src/routes/auth.ts`
- Rutas cliente/admin: `client/src/routes/AppRoutes.tsx`
- Almacenamiento local: `client/src/utils/auth.ts`
- Interceptor Axios: `client/src/services/api.ts`
- Proteccion de rutas sin token: `server/tests/api/route-protections.api.test.ts`
- Contexto de intencion del equipo: PRs `#14`, `#16` y review de PR `#17`

## 3. Flujo actual documentado

### Emision del token

- `POST /api/auth/register` crea usuario `CLIENT` y devuelve JWT.
- `POST /api/auth/login` devuelve JWT cuando email y password son validos.
- `JWT_EXPIRY` usa `process.env.JWT_EXPIRY` o `7d` por defecto.
- En `NODE_ENV=test` existe fallback a `test-secret-key`; fuera de test, `JWT_SECRET` es obligatorio.

### Payload del token

Campos observados:

- `id`
- `email`
- `role`

### Persistencia en frontend

- Usuario serializado en `localStorage` con clave `vibe-pulse-auth`.
- Token en `localStorage` con clave `vibe-pulse-token`.
- `authApi` agrega `Authorization` automaticamente en requests autenticadas.

### Rutas protegidas en frontend

Invitado solamente:

- `/login`
- `/register`

Usuario autenticado:

- `/home`
- `/catalogo`
- `/products/:id`
- `/cart`
- `/checkout`
- `/processing-payment`
- `/purchase-alert`
- `/confirmation`

Administrador autenticado:

- `/admin`
- `/admin/products`
- `/admin/orders`
- `/admin/users`
- `/admin/settings`

### Rutas protegidas en backend

- `/api/auth/me`
- `/api/auth/profile`
- `/api/auth/admin-only`
- `/api/cart/*` por montaje con `authenticateToken` en `server/src/app.ts`
- `/api/admin/*` por `router.use(authenticateToken, authorizeRole(["ADMIN"]))`
- `GET /api/orders`

### Mitigaciones de seguridad vigentes

- Login usa hash dummy para reducir timing leak cuando el usuario no existe.
- Registro devuelve `400` con mensaje generico ante email duplicado, alineado con la correccion de user enumeration pedida en PR `#14`.

## 4. Decisiones pendientes o brechas activas

- El review de la PR `#17` pide tratar ordenes como flujo `100%` autenticado; `develop` actual no cumple esa condicion porque `POST /api/orders` sigue sin `authenticateToken`.
- `server/src/controllers/orderController.ts` todavia puede resolver identidad desde `userId` o `email` cuando no hay token.
- Las guards del frontend validan presencia de sesion local, no validez criptografica en tiempo real.
- No existe refresh token.
- No existe rutina global de logout automatico ante `401`.

## 5. Propuesta de estandarizacion futura

- Formalizar una politica unica de sesion: almacenamiento, expiracion, renovacion y UX ante `401`.
- Alinear `POST /api/orders` con el mismo modelo de autenticacion que ya usa el frontend, o documentarlo explicitamente como excepcion transitoria mientras siga abierto.
- Publicar una tabla unica de rutas publicas, autenticadas y administrativas para QA y desarrollo.
- Si se mantiene `localStorage`, dejarlo como decision explicita de implementacion actual y no como recomendacion de seguridad general.
