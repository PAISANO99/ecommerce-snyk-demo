# Bloque 5 QA

## Alcance

Esta carpeta rehace la documentacion de la issue `#12` sobre `origin/develop`.

Cobertura del bloque:

- `QA-016`: modelo de datos
- `QA-017`: sesion y JWT
- `QA-018`: reglas de carrito, checkout, orden y pago
- `QA-019`: trazabilidad requisito -> codigo -> prueba
- `QA-020`: contratos API, errores, permisos, entorno y diagramas minimos

## Fuentes obligatorias usadas

- issue `#12`
- review principal de la PR `#17`
- PRs `#14`, `#16` y `#18`
- `origin/develop`
- `docs/Informe_Consolidado_QA_VibePulse.docx.pdf` como contexto local de trabajo

## Regla de lectura

Cada documento separa cuatro capas:

1. estado actual observado en `develop`
2. evidencia concreta en archivos, tests o PRs aceptadas
3. decisiones pendientes o brechas activas
4. propuesta de estandarizacion futura

## Criterio editorial aplicado

- `develop` es la fuente principal del estado actual.
- Las PRs `#14`, `#16` y `#18` se usan como contexto de intencion y validacion del equipo.
- Si el review de la PR `#17` afirma una solucion que `develop` no refleja por completo, esa diferencia se documenta como brecha abierta.
- No se documentan bugs viejos ya corregidos como si fueran reglas oficiales.
- Tampoco se vende como implementado algo que `develop` todavia no cumple.

## Mapa de documentos

- `docs/data-model.md`: `QA-016`
- `docs/auth-session.md`: `QA-017`
- `docs/business-rules-cart-order-payment.md`: `QA-018`
- `docs/traceability-matrix.md`: `QA-019`
- `docs/api-contracts-and-errors.md`: `QA-020`
- `docs/permissions-and-env.md`: permisos, variables y despliegue local
- `docs/architecture-diagrams.md`: diagramas de componentes, compra y responsabilidades

## Tension principal del bloque

El review de la PR `#17` pide documentar el flujo de orden como `100%` autenticado y alineado con la solucion segura de la PR `#14`. Sin embargo, el `develop` actual mantiene una tension real:

- el frontend trata checkout y creacion de orden como flujo autenticado
- `GET /api/orders` si exige token
- `POST /api/orders` sigue expuesto sin `authenticateToken`
- `server/src/controllers/orderController.ts` todavia acepta `userId` del cliente y puede resolver o crear usuario por email

Esa tension no se oculta en esta carpeta; se marca como brecha activa hasta que el codigo y los tests converjan.

## Uso recomendado

- Para estado funcional y alcance general: `README.md`
- Para contratos de backend: `docs/api-contracts-and-errors.md`
- Para seguridad de sesion y rutas: `docs/auth-session.md`
- Para reglas de compra e inventario: `docs/business-rules-cart-order-payment.md`
- Para evidencia cruzada de QA: `docs/traceability-matrix.md`
