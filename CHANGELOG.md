# Changelog

Todas las novedades y cambios notables de este proyecto se documentarán en este archivo.

## [0.1.0] - 2026-11-10

### 🚀 Novedades y Endpoints Implementados
- **Nuevos Servicios**:
  - `SupportService` (`qvapay.support`): Gestión completa de tickets de soporte (`GET /user/support`, `POST /user/support`, `GET /user/support/:id`, `POST /user/support/:id/reply`).
  - `PushService` (`qvapay.push`): Registro y revocación de tokens push (`POST/DELETE /push/tokens`), bandeja de notificaciones (`GET /push/inbox`) y reporte de eventos de entrega (`POST /push/events`).
  - `SavingService` (`qvapay.saving`): Consulta de cuenta de ahorro (`GET /saving`), historial de movimientos (`GET /saving/transactions`), depósitos/extracciones (`POST /saving/deposit`, `POST /saving/withdraw`) y redondeo automático (`POST /saving/roundup`).
  - `EnergyService` (`qvapay.energy`): Consulta de precios (`GET /v2/energy/prices`), cotizaciones congeladas (`POST /v2/energy/quote`), alquiler de energía TRON (`POST /v2/energy/rent`) y consulta de órdenes (`GET /v2/energy/orders`, `GET /v2/energy/orders/:uuid`).
  - `MarketService` (`qvapay.market`): Gestión de tiendas (`/market/shops`), categorías (`/market/shops/:uuid/categories`), productos (`/market/products`, bulk, variantes), vitrina pública (`/market/catalog`, `/market/stores`, `/market/stores/:slug`), checkout y gestión de órdenes (`/market/orders`, refund, rate) y subida de imágenes multipart (`POST /market/upload`).
  - `MiniAppsService` (`qvapay.miniapps`): Catálogo móvil de mini-apps (`GET /miniapps`, `GET /miniapps/:slug`) y gestión de consentimientos (`GET /miniapps/grants`, `DELETE /miniapps/grants/:slug`).

- **Coins**:
  - Implementado `listV2(params)` para `GET /coins/v2` con filtros `enabledIn`, `enabledOut`, `enabledP2p`.
  - Historial de precios `priceHistory(tick, timeframe)` (`GET /coins/price-history/:tick`).

- **Withdraw**:
  - Consulta individual `get(id)` (`GET /withdraw/:id`).
  - Validación de ruta bancaria `bankLookup(routing)` (`GET /withdraw/bank-lookup`).
  - Zonas y tarifas de efectivo `getCashZones(coin)` (`GET /withdraw/cash-zones`).
  - Parámetros extendidos en `create()`: `pin`, `note`, `webhook`, `idempotencyKey`, `destLabel` y objeto `compliance` (OFAC/CACR).
  - Filtros de listado: `page`, `take`, `status`, `paymentMethod`, `includeTotal`.

- **Transactions**:
  - Comentarios en transacciones: `getComments(uuid)`, `createComment(uuid, body)`, `deleteComment(uuid, commentId)`.
  - Consulta ligera de estado: `getStatus(uuid)` (`GET /api/transaction/:uuid/status`).
  - Corrección de ruta de listado: migrado de `GET /transactions` a `GET /transaction`.

- **P2P**:
  - Destacados `getFeatured()` (`GET /p2p/featured`).
  - Puesto promocionado `getPromo(coin)` y `createPromo(params)` (`GET/POST /p2p/promo`).
  - Pausa y reactivación de ofertas `pause(uuid, paused)` (`POST /p2p/:uuid/pause`).
  - Edición de valoración `updateRate(uuid, params)` (`PATCH /p2p/:uuid/rate`).
  - Comprobantes y adjuntos: `getAttachments(uuid)`, `uploadAttachment(uuid, file)`, `getAttachment(uuid, id)`.
  - Webhooks de feed: `getFeedSubscription()` y `getFeedDeliveries()`.
  - Promedios: `getAverages()` y `getCompletedPairsAverage(coin)`.
  - Helpers SSE: `getStreamUrlAndHeaders()` y `getChatStreamUrlAndHeaders(uuid, order)`.

- **User**:
  - Métodos de pago: `updatePaymentMethod()` (`PATCH /user/payment-methods`), filtrado por `coin` en `getPaymentMethods()`.
  - Enlaces de invitación: `getReferralLinks()`, `createReferralLink()`.
  - Lightning Address: `getLightningAddress()`, `updateLightningAddress()`, `decodeLightning()`.
  - Cambio de correo: `getEmailChangeStatus()`, `updateEmail()`.
  - Telegram: `verifyTelegram()`, `requestTelegramLink()`, `unlinkTelegram()`.
  - Verificación CIP / CPF / SSN: `getCip()`, `verifyCpf()`, `verifySsn()`, `getDepositEligibility()`.
  - Cuentas de empresa: `getCompanyApplications()`, `applyCompany()`.

- **Store**:
  - Listado general `list()` (`GET /store`).
  - Mis compras: `getMyPurchases()`, `getMyPurchase(id)` (`GET /store/my`, `GET /store/my/:id`).
  - eSIM: `getEsimCatalog()`, `purchaseEsim()`.
  - PIX: `getPixEligibility()`, `createPixCheckout()`, `getPixCheckout()`, `cancelPixCheckout()`.

- **Apps**:
  - Pay Buttons CRUD: `getPayButtons()`, `createPayButton()`, `updatePayButton()`.
  - MiniApp soporte y conversación: `getMiniAppConversation()`, `sendMiniAppMessage()`.
  - Logs con filtros (`page`, `limit`, `type`).

- **Stocks**:
  - Detalle extendido y quote con `detail(symbol, params)` (`GET /stocks/:tick`).

- **Errores**:
  - `QvaPayApiError` ahora expone la propiedad `code` correspondiente a códigos de error estables de la API (ej. `KYC_REQUIRED`, `DUPLICATE_REQUEST`, `RATE_LIMITED`, `W1_ATTESTATION_REQUIRED`).
  - Manejo de rate limiting (429) preservando mensajes completos.

### 🔄 Corrección de Rutas y Deprecaciones
- `AuthService.login`: actualizado a `POST /auth/login`. Soporta `remember` y `twoFactorCode`. Retorna resultado tipado manejando respuestas 200 y 202 (2FA requerido).
- `AuthService.register`: actualizado a `POST /auth/register`.
- `AuthService.registerConfirmation`: actualizado a `POST /auth/confirm-registration`.
- `AuthService.logout`: actualizado a `POST /auth/logout`.
- `AuthService.logoutAll`: actualizado a `DELETE /auth/logout`.
- `AuthService.requestPin`: actualizado a `POST /auth/request-pin`.
- `AuthService.checkAuth`: marcado como `@deprecated` (sunset 2026-07-15); ahora delega en `GET /user`.
- `MeService`: marcado como `@deprecated`. Delega en `UserService.getProfile()` y `TransactionsService.transfer()`.
- `InvoicesService`: marcado como `@deprecated`. Delega en `AppService.createInvoice()` (`POST /v2/create_invoice`).
- `TransactionsService`, `P2PService` y `MeService`: configurados con `userHttp` respetando los requisitos de Bearer Token según la documentación oficial.
