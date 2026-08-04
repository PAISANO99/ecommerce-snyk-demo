# Modelo de datos

## 1. Estado actual observado en develop

El modelo fuente del sistema esta en `server/prisma/schema.prisma`.

Entidades observadas:

- `User`
- `Category`
- `Product`
- `ProductVariant`
- `Cart`
- `CartItem`
- `Order`
- `OrderItem`
- enum `Role`

Reglas estructurales observadas:

- `User.email` es unico y `User.role` usa `Role` con `CLIENT` y `ADMIN`.
- `Cart.userId` es unico, por lo que el modelo soporta un carrito persistente por usuario.
- `CartItem` consolida lineas con `@@unique([cartId, lineKey])`.
- `ProductVariant` depende de `Product` y participa en carrito, pero no tiene tabla propia en `OrderItem`.
- `Order.status` no usa enum Prisma; hoy es `String` con default `pendiente`.
- `OrderItem` guarda `productId`, `quantity` y `price`, pero no `variantId`.

## 2. Evidencia concreta

- Modelo Prisma base: `server/prisma/schema.prisma`
- Stock atomico por producto y variante: `server/src/services/inventoryService.ts`
- Consolidacion de carrito por `lineKey`: `server/src/routes/cart.ts`
- Ordenes con recalculo autoritativo y descuento de stock: `server/src/controllers/orderController.ts`
- Estados aceptados por validacion admin: `server/src/middlewares/validation.ts`
- PR `#14`: valida la introduccion de control autoritativo de precio e inventario
- PR `#18`: consolida en `develop` el estado final actual del flujo de ordenes

## 3. Modelo documentado

### `Role`

Valores observados:

- `CLIENT`
- `ADMIN`

### `User`

Campos observados:

- `id: Int`
- `name: String`
- `email: String @unique`
- `password: String`
- `role: Role = CLIENT`
- `createdAt: DateTime`
- `updatedAt: DateTime`

Relaciones:

- `cart: Cart?`
- `orders: Order[]`

### `Category`

Campos observados:

- `id: Int`
- `name: String @unique`
- `slug: String @unique`
- `imageUrl: String?`
- `description: String?`
- `createdAt: DateTime`

Relaciones:

- `products: Product[]`

### `Product`

Campos observados:

- `id: Int`
- `name: String`
- `description: String?`
- `price: Float`
- `comparePrice: Float?`
- `imageUrl: String`
- `stock: Int = 0`
- `featured: Boolean = false`
- `badge: String?`
- `categoryId: Int`
- `createdAt: DateTime`
- `updatedAt: DateTime`

Relaciones:

- `category: Category`
- `variants: ProductVariant[]`
- `cartItems: CartItem[]`
- `orderItems: OrderItem[]`

Indices observados:

- `@@index([categoryId])`
- `@@index([name])`

### `ProductVariant`

Campos observados:

- `id: Int`
- `name: String`
- `color: String?`
- `size: String?`
- `price: Float`
- `stock: Int`
- `productId: Int`

Relaciones:

- `product: Product`
- `cartItems: CartItem[]`

Observacion:

- La variante participa en carrito y en el decremento de stock de orden, pero el snapshot persistido en `OrderItem` no guarda `variantId`.

### `Cart`

Campos observados:

- `id: Int`
- `userId: Int @unique`
- `total: Float = 0`
- `createdAt: DateTime`
- `updatedAt: DateTime`

Relaciones:

- `user: User`
- `items: CartItem[]`

### `CartItem`

Campos observados:

- `id: Int`
- `cartId: Int`
- `productId: Int`
- `variantId: Int?`
- `lineKey: String`
- `color: String?`
- `size: String?`
- `quantity: Int = 1`
- `unitPrice: Float`
- `subtotal: Float`
- `createdAt: DateTime`
- `updatedAt: DateTime`

Relaciones:

- `cart: Cart`
- `product: Product`
- `variant: ProductVariant?`

Restricciones observadas:

- `@@unique([cartId, lineKey])`
- `onDelete: Cascade` sobre `cart`

### `Order`

Campos observados:

- `id: Int`
- `userId: Int`
- `email: String`
- `total: Float`
- `status: String = "pendiente"`
- `name: String`
- `address: String`
- `city: String`
- `country: String`
- `postalCode: String`
- `phone: String`
- `paymentMethod: String`
- `createdAt: DateTime`

Relaciones:

- `user: User`
- `items: OrderItem[]`

### `OrderItem`

Campos observados:

- `id: Int`
- `orderId: Int`
- `productId: Int`
- `quantity: Int`
- `price: Float`

Relaciones:

- `order: Order`
- `product: Product`

## 4. Decisiones pendientes o brechas activas

- `Order.status` sigue como `String`; el PDF QA esperaba definicion formal de estados y transiciones.
- `OrderItem` no persiste `variantId`, aunque la orden si descuenta stock por variante cuando aplica.
- El review de la PR `#17` pedia usar la solucion segura como contrato canonico; `develop` actual si refleja precio autoritativo y stock atomico, pero no cierra del todo la historia de ownership de orden.
- No hay snapshot explicito de nombre de variante, color o talla en `OrderItem`; el detalle historico de compra depende del producto base.

## 5. Propuesta de estandarizacion futura

- Convertir `Order.status` a enum Prisma para alinear base, validacion y admin.
- Evaluar agregar `variantId` o snapshot de variante en `OrderItem` para trazabilidad historica.
- Definir si `Order` debe modelar descuentos, envio e impuestos como campos propios, ya que hoy solo persiste `total`.
- Publicar este modelo como contrato de referencia del equipo para evitar divergencias entre frontend, backend y QA.
