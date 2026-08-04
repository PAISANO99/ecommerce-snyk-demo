# Contratos API y errores

## 1. Estado actual observado en develop

`develop` expone un inventario de rutas estable y util para QA, pero no un contrato unico de errores. El sistema mezcla respuestas centralizadas via `errorHandler` con respuestas manuales de controladores.

## 2. Evidencia concreta

- Inventario de endpoints: `server/tests/api/route-manifest.contract.test.ts`
- Protecciones: `server/tests/api/route-protections.api.test.ts`
- Auth: `server/src/controllers/authControllerLogin.ts`, `server/src/controllers/authControllerRegister.ts`
- Ordenes: `server/src/controllers/orderController.ts`, `server/tests/api/orders.api.test.ts`
- Validacion centralizada: `server/src/middlewares/validation.ts`
- Error handler: `server/src/middlewares/errorHandler.ts`
- Contexto de intencion: review de PR `#17`, PRs `#14`, `#16` y `#18`

## 3. Contratos actuales observados

### Endpoints publicos observados

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products/`
- `GET /api/products/featured`
- `GET /api/products/:id`
- `GET /api/categories/`
- `GET /api/categories/:slug`
- `POST /api/orders/`

### Endpoints protegidos observados

- `GET /api/auth/me`
- `GET /api/auth/profile`
- `GET /api/auth/admin-only`
- `GET /api/cart/`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:id`
- `DELETE /api/cart/items/:id`
- `GET /api/orders/`
- `GET /api/admin/dashboard/metrics`
- `GET /api/admin/users`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id/status`
- `POST /api/products/`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `POST /api/categories/`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

### Contratos concretos relevantes

#### `POST /api/auth/register`

Request observado:

```json
{
  "name": "Usuario",
  "email": "user@example.com",
  "password": "Password123"
}
```

Respuesta exitosa observada:

```json
{
  "message": "Registro exitoso",
  "token": "<jwt>",
  "user": {
    "id": 1,
    "name": "Usuario",
    "email": "user@example.com",
    "role": "CLIENT"
  }
}
```

Contrato de seguridad vigente:

- ante duplicado de email, responde `400` con mensaje generico
- no usa `409` ni confirma si el correo existe

#### `POST /api/auth/login`

Request observado:

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

Respuesta exitosa observada:

```json
{
  "message": "Inicio de sesion exitoso",
  "token": "<jwt>",
  "user": {
    "id": 1,
    "name": "Usuario",
    "email": "user@example.com",
    "role": "CLIENT"
  }
}
```

#### `GET /api/cart`

Respuesta de alto nivel observada:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "total": 0,
    "items": []
  }
}
```

#### `POST /api/orders`

Request observado desde cliente y tests:

```json
{
  "userId": 1,
  "name": "Cliente",
  "email": "cliente@example.com",
  "address": "Calle 123",
  "city": "Bogota",
  "country": "Colombia",
  "postalCode": "110111",
  "phone": "3001234567",
  "paymentMethod": "tarjeta",
  "items": [
    {
      "productId": 10,
      "quantity": 1,
      "price": 120000
    }
  ]
}
```

Respuesta exitosa de alto nivel observada:

```json
{
  "success": true,
  "order": {
    "id": 1,
    "total": 120000,
    "status": "pendiente"
  }
}
```

Nota critica:

- el backend recalcula `total` desde base de datos
- el request todavia admite `userId` y no exige token en la ruta
- esta es la principal tension entre `develop` y el criterio expresado en el review de PR `#17`

## 4. Formatos de error actuales

### Estandar central disponible

`server/src/middlewares/errorHandler.ts` expone este formato base:

```json
{
  "success": false,
  "error": {
    "message": "Mensaje",
    "statusCode": 400
  }
}
```

### Formatos legacy observados

- auth manual: `{"error": "..."}`
- cart mixto: `{"success": false, "error": "..."}`
- orders manual: `{"success": false, "message": "..."}`
- order reference errors: `{"success": false, "code": "...", "message": "..."}`

### Casos relevantes ya corregidos

- registro duplicado ya no debe documentarse como `409`; hoy el contrato observado es `400` generico
- login usa mensaje homogeneo para credenciales invalidas
- validaciones Zod que pasan por middleware usan el `errorHandler`

## 5. Decisiones pendientes o brechas activas

- El review de la PR `#17` pide definir un formato unico de error basado en `errorHandler`; `develop` todavia no lo aplica en todos los modulos.
- `POST /api/orders` no puede documentarse hoy como endpoint autenticado estricto porque su implementacion y sus tests contradicen esa lectura.
- README historico y contratos viejos que mencionen `409` en registro deben considerarse desactualizados.

## 6. Propuesta de estandarizacion futura

- Estandar sugerido para toda la API:

```json
{
  "success": false,
  "error": {
    "code": "MACHINE_CODE",
    "message": "Mensaje legible",
    "statusCode": 400,
    "details": null
  }
}
```

- Tratar como `legacy` todos los formatos distintos mientras el backend no se unifique.
- Publicar una tabla de codigos de error por modulo cuando se converja el contrato.
