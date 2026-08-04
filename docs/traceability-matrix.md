# Matriz de trazabilidad

## 1. Estado actual observado en develop

Esta matriz cubre `QA-019` sobre el estado real de `origin/develop`. Se enlazan requisitos operativos observables con frontend, backend, pruebas y contexto de PRs aceptadas cuando ayudan a entender la intencion del equipo.

## 2. Evidencia concreta

- Rutas y protecciones: `server/src/app.ts`, `server/src/routes/*.ts`
- Controllers y middlewares: `server/src/controllers/*.ts`, `server/src/middlewares/*.ts`
- Frontend y guards: `client/src/routes/AppRoutes.tsx`, `client/src/services/api.ts`, `client/src/utils/auth.ts`
- Pruebas API: `server/tests/api/route-manifest.contract.test.ts`, `server/tests/api/route-protections.api.test.ts`, `server/tests/api/orders.api.test.ts`
- Contexto de seguridad y consistencia: PRs `#14`, `#16` y `#18`

## 3. Matriz

| ID | Requisito operativo | Evidencia frontend | Evidencia backend | Evidencia en tests | Estado actual |
| --- | --- | --- | --- | --- | --- |
| RF-AUTH-001 | Un usuario puede registrarse con nombre, email y password | `client/src/services/api.ts` | `server/src/routes/auth.ts`, `server/src/controllers/authControllerRegister.ts` | `server/tests/api/route-protections.api.test.ts` | implementado |
| RF-AUTH-002 | Un usuario puede iniciar sesion y recibir JWT | `client/src/services/api.ts`, `client/src/utils/auth.ts` | `server/src/routes/auth.ts`, `server/src/controllers/authControllerLogin.ts`, `server/src/config/jwt.ts` | `server/tests/api/route-protections.api.test.ts` | implementado |
| RF-AUTH-003 | Un usuario autenticado puede consultar su identidad | consumo disponible desde cliente API | `server/src/routes/auth.ts`, `server/src/middlewares/auth.ts` | `server/tests/api/route-protections.api.test.ts` | implementado |
| RF-AUTH-004 | Solo un admin puede acceder al backoffice | `client/src/routes/AppRoutes.tsx` | `server/src/routes/admin.ts`, `server/src/middlewares/auth.ts` | `server/tests/api/route-protections.api.test.ts` | implementado |
| RF-CART-001 | Un usuario autenticado puede consultar su carrito | `client/src/pages/Cart.tsx`, `client/src/services/api.ts` | `server/src/app.ts`, `server/src/routes/cart.ts` | `server/tests/api/route-protections.api.test.ts`, `server/tests/api/route-manifest.contract.test.ts` | implementado |
| RF-CART-002 | Un usuario autenticado puede agregar items al carrito con validacion y reserva de stock | `client/src/services/api.ts` | `server/src/routes/cart.ts`, `server/src/services/inventoryService.ts` | `server/tests/api/route-protections.api.test.ts`, contexto PR `#14` | implementado |
| RF-CART-003 | Un usuario autenticado puede editar o eliminar items y el stock se ajusta por delta | `client/src/pages/Cart.tsx` | `server/src/routes/cart.ts`, `server/src/services/inventoryService.ts` | `server/tests/api/route-protections.api.test.ts` | implementado |
| RF-ORDER-001 | El frontend de checkout opera como flujo autenticado | `client/src/routes/AppRoutes.tsx`, `client/src/pages/Checkout.tsx`, `client/src/services/api.ts` | sin paridad total en `POST /api/orders` | sin prueba dedicada de proteccion en POST | parcial |
| RF-ORDER-002 | El sistema puede crear una orden con precio autoritativo e inventario atomico | `client/src/pages/Checkout.tsx`, `client/src/services/api.ts` | `server/src/controllers/orderController.ts`, `server/src/services/inventoryService.ts` | `server/tests/api/orders.api.test.ts`, contexto PR `#14` | implementado con brecha de auth |
| RF-ORDER-003 | Un usuario autenticado puede listar sus ordenes | sin pantalla cliente dedicada fuera del flujo general | `server/src/routes/orders.ts`, `server/src/controllers/orderController.ts` | `server/tests/api/route-protections.api.test.ts`, `server/tests/api/route-manifest.contract.test.ts` | implementado |
| RF-ADMIN-001 | Un admin puede consultar metricas, usuarios y pedidos | `client/src/routes/AppRoutes.tsx`, modulos admin lazy | `server/src/routes/admin.ts` | `server/tests/api/route-protections.api.test.ts`, `server/tests/api/route-manifest.contract.test.ts` | implementado |
| RF-ADMIN-002 | Un admin puede mutar productos y categorias | `client/src/services/api.ts` | `server/src/routes/products.ts`, `server/src/routes/categories.ts` | `server/tests/api/route-protections.api.test.ts`, `server/tests/api/route-manifest.contract.test.ts` | implementado |

## 4. Decisiones pendientes o brechas activas

- `RF-ORDER-001` sigue parcial porque frontend y backend no comparten el mismo contrato de autenticacion para crear orden.
- La matriz puede enlazar la intencion de PR `#14`, pero no debe presentar esa intencion como cumplimiento pleno mientras `develop` mantenga `POST /api/orders` abierto.
- Faltan casos de prueba de proteccion especificos para `POST /api/orders` sin token, justamente porque el contrato actual en `develop` no lo rechaza.
- Varias evidencias de admin son contractuales por ruta y proteccion, no por flujos E2E detallados del bloque.

## 5. Propuesta de estandarizacion futura

- Asociar cada requisito a IDs de caso de prueba estables en API, unit, component y E2E.
- Agregar casos dedicados para cerrar o confirmar la brecha de autenticacion en ordenes.
- Mantener esta matriz como anexo vivo del proceso QA para que review, codigo y pruebas usen el mismo lenguaje.
