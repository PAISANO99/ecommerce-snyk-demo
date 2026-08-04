# Reglas de carrito, checkout, orden y pago

## 1. Estado actual observado en develop

El sistema actual ya no esta en estado de Sprint 1. `develop` muestra un flujo de compra con carrito persistente, checkout protegido en frontend, stock atomico y recalculo autoritativo de precios. Al mismo tiempo, conserva una brecha importante en la autenticacion efectiva de `POST /api/orders`.

## 2. Evidencia concreta

- Carrito e inventario: `server/src/routes/cart.ts`
- Servicio de stock atomico: `server/src/services/inventoryService.ts`
- Ordenes y recalculo de total: `server/src/controllers/orderController.ts`
- Rutas de orden: `server/src/routes/orders.ts`
- Checkout frontend: `client/src/pages/Checkout.tsx`
- Resumen visual del carrito: `client/src/pages/Cart.tsx`
- Cliente API: `client/src/services/api.ts`
- Tipos y schema de checkout: `client/src/types/checkout.ts`, `client/src/schemas/checkoutSchema.ts`
- Pruebas de ordenes: `server/tests/api/orders.api.test.ts`
- Proteccion de rutas: `server/tests/api/route-protections.api.test.ts`
- PR `#14`: endurecimiento de inventario, precios y seguridad
- PR `#18`: estado final actual de pruebas y ordenes en `develop`

## 3. Reglas observadas

### Carrito

- Cada usuario autenticado opera sobre un carrito persistente por `userId`.
- Si el carrito no existe, el backend lo crea con `upsert`.
- El backend consolida lineas repetidas usando `lineKey` con `productId`, `variantId`, `color` y `size`.
- `quantity` debe ser entero positivo y se valida por Zod.
- El total del carrito se recalcula desde los subtotales persistidos de `CartItem`.

### Inventario

- Al agregar al carrito, el backend intenta reservar stock de forma atomica.
- Si el item tiene `variantId`, opera sobre `ProductVariant.stock`.
- Si no tiene `variantId`, opera sobre `Product.stock`.
- Al aumentar cantidad se descuenta solo el delta.
- Al disminuir cantidad o eliminar item se repone stock del recurso correspondiente.
- Este comportamiento coincide con la intencion aprobada en PR `#14`.

### Checkout

- El frontend no deja confirmar una compra con carrito vacio.
- El formulario recoge nombre, email, direccion, ciudad, pais, codigo postal, telefono y metodo de pago.
- Los metodos visibles siguen siendo `tarjeta` y `paypal`.
- PayPal es flujo simulado de interfaz, no integracion real de pasarela.
- Existe cupon simulado `VIBRA10` que afecta solo el calculo visual del frontend.

### Ordenes

- `createOrder` normaliza items por `productId` + `variantId`.
- El backend busca los productos en base de datos y recalcula el total usando `product.price`.
- El `price` enviado por el cliente ya no gobierna el total final de la orden.
- Si hay `variantId`, la creacion de orden usa `decrementVariantStock(...)`.
- Si no hay `variantId`, usa `decrementProductStock(...)`.
- Si el usuario tiene carrito, la orden restaura primero el stock reservado en carrito y luego vuelve a descontar el stock autoritativo en la orden.
- Tras crear la orden, el carrito se vacia y su `total` queda en `0`.

### Estados de orden

Estado inicial observado:

- `pendiente`

Estados aceptados hoy por validacion admin:

- `pendiente`
- `pagado`
- `enviado`
- `entregado`
- `cancelado`

## 4. Decisiones pendientes o brechas activas

- El review de la PR `#17` pide documentar checkout como `100%` autenticado. `develop` actual no cumple eso en backend:
  - `client/src/services/api.ts` llama `POST /api/orders` con token
  - `client/src/routes/AppRoutes.tsx` protege `/checkout`
  - `server/src/routes/orders.ts` deja `POST /api/orders` sin `authenticateToken`
  - `server/src/controllers/orderController.ts` todavia admite `userId` del cliente o resolucion por email y puede crear usuario placeholder
- El PDF QA clasifica `POST /api/orders` y `GET /api/orders` como autenticados. Hoy solo `GET /api/orders` lo cumple en codigo y en tests de proteccion.
- `server/tests/api/orders.api.test.ts` consolida el contrato actual de `develop` para crear orden sin token usando `userId`.
- El frontend y el backend no usan la misma formula de total:
  - `client/src/pages/Cart.tsx` aplica envio e impuestos
  - `client/src/pages/Checkout.tsx` aplica envio gratis y cupon simulado
  - `server/src/controllers/orderController.ts` solo persiste suma autoritativa de items
- `OrderItem` no guarda `variantId`, aunque el descuento de stock si usa variante cuando existe.

## 5. Propuesta de estandarizacion futura

- Unificar el contrato de ownership de orden: autenticado estricto o excepcion transitoria explicitamente documentada.
- Publicar una sola formula oficial de subtotal, envio, impuestos, descuentos y total.
- Si las variantes son parte estable del checkout, persistir snapshot suficiente de variante en `OrderItem`.
- Definir estados de orden y transiciones como contrato de negocio formal, no solo como lista de valores admitidos.
