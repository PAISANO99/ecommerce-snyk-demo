# Integracion Sprint 3 - Detalle de producto y carrito

> Nota historica: este archivo se conserva como referencia del trabajo de integracion del Sprint 3.
>
> No debe usarse como fuente canonica del estado actual del sistema.
>
> Para contratos vigentes, reglas observadas, brechas activas y trazabilidad de QA revisa:
>
> - `docs/README.md`
> - `docs/business-rules-cart-order-payment.md`
> - `docs/api-contracts-and-errors.md`
> - `docs/permissions-and-env.md`
>
> Este archivo puede contener referencias historicas hoy desactualizadas sobre ramas, rutas, contratos o destino de PRs.

## Rama de trabajo
- `feat/integracion-sprint3-carrito`

## Objetivo de esta integración
Conectar el flujo completo de **detalle de producto + carrito + checkout** sobre la base del repositorio `E-commerce-web`, dejando frontend y backend alineados para pruebas locales antes de merge a `main`.

---

## 1) Cambios de arquitectura y estructura

### Backend
Se consolidó y amplió la API del servidor para soportar carrito real:

- Nuevo router de carrito en `server/src/routes/cart.ts`.
- Montaje del router en `server/src/index.ts` bajo `/api/cart` con autenticación JWT.
- Ajustes en servicios de producto para incluir variantes en respuestas (`server/src/services/productService.ts`).

### Base de datos (Prisma)
Se extendió el modelo de datos para cubrir reglas del carrito:

- `server/prisma/schema.prisma`:
  - `ProductVariant`
  - `Cart`
  - `CartItem`
  - relaciones con `User` y `Product`
- Migración SQL agregada en:
  - `server/prisma/migrations/20260418143000_add_cart_and_variants/migration.sql`

### Frontend
Se integró contexto y vistas de carrito/checkout:

- Contexto global del carrito:
  - `client/src/context/CartContext.tsx`
- Nuevas vistas:
  - `client/src/pages/Cart.tsx`
  - `client/src/pages/Checkout.tsx`
- Integración en layout y rutas:
  - `client/src/layouts/MainStoreLayout.tsx`
  - `client/src/routes/AppRoutes.tsx`
  - `client/src/App.tsx`

---

## 2) Rutas y contratos alineados

### Frontend
Se normalizaron rutas principales del sprint:

- `/products/:id`
- `/cart`
- `/checkout`

Compatibilidad mantenida con rutas legacy:

- `/producto/:id`
- `/carrito`

### Backend
Endpoints implementados para carrito:

- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:id`
- `DELETE /api/cart/items/:id`

Además, se mantuvo soporte de catálogo/detalle:

- `GET /api/products`
- `GET /api/products/:id`

---

## 3) Errores y bloqueadores corregidos

### A) Rama no visible en GitHub
**Causa:** la rama existía local pero no estaba subida.

**Acción:** push con upstream:

```bash
git push -u origin feat/integracion-sprint3-carrito
```

---

### B) Error Prisma `P1012` (incompatibilidad de versión)
**Causa:** diferencias de versión y esquema.

**Acción:** estandarización de versiones y regeneración de cliente Prisma para que el esquema actual compile.

---

### C) Migración fallando por conexión (`P1000` / credenciales)
**Causa:** `DATABASE_URL` inválida o sin permisos.

**Acción:** configuración de `.env` local y validación de conexión contra PostgreSQL antes de migrar.

---

### D) Frontend con `ERR_CONNECTION_REFUSED` a backend
**Causa:** backend no estaba arriba o URL no centralizada.

**Acción:**
- backend levantado en puerto esperado,
- cliente API centralizado,
- validación con health/check de endpoints.

---

### E) Overlay/HMR 500 por estado de entorno local
**Causa:** caché/procesos locales y artefactos temporales.

**Acción:** limpieza de procesos y caches locales, luego rebuild.

---

## 4) Validaciones ejecutadas

### Compilación
- `client`: `npm run build` ✅
- `server`: `npm run build` ✅
- `server`: `npm run prisma:generate` ✅

### Flujo funcional API
- autenticación
- lectura de productos
- alta de ítem al carrito
- actualización/eliminación de ítems
- recálculo de total

### Flujo visual (local)
- navegación catálogo → detalle
- agregar al carrito
- editar cantidades
- ir a checkout

---

## 5) Ajustes finales de higiene del repo

- Eliminación de logs temporales locales.
- Actualización de `.gitignore` para evitar que vuelvan a ensuciar estado:
  - `.logs/`
  - `*.log`

---

## 6) Estado final

La rama `feat/integracion-sprint3-carrito` queda con la integración del Sprint 3 lista para revisión y PR hacia `main`, con backend + frontend + modelo de datos alineados y pruebas locales completadas.

---

## 7) Ajustes UI/UX finales solicitados

Se completaron mejoras específicas de interfaz pedidas durante la validación manual:

- Sidebar de filtros controlado desde botón tipo menú (`☰`) en la cabecera del catálogo.
  - Permite **mostrar/ocultar** el panel de filtros lateral sin romper el grid de productos.
  - Archivo: `client/src/pages/Catalog.tsx`

- Barra de búsqueda del header conectada al catálogo.
  - El input ahora navega a `/catalogo?search=...`.
  - El catálogo toma ese query param y aplica filtro real en productos.
  - Archivos:
    - `client/src/layouts/MainStoreLayout.tsx`
    - `client/src/pages/Catalog.tsx`

Con esto, la UI queda alineada con lo esperado en la revisión visual: búsqueda utilizable desde navbar y filtros desplegables/controlables desde el icono lateral.
