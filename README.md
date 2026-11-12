# QvaPay SDK: client-node

Este proyecto consiste en un SDK de TypeScript para Node.js que permite a los desarrolladores interactuar con la API de QvaPay. El SDK proporciona un conjunto de funciones asíncronas que retornan una promesa con la data o el error de la consulta, permitiendo a los desarrolladores crear aplicaciones que se conecten a la API de QvaPay. Se incluye una documentación detallada y ejemplos de código.

---

## SDK v2 (recomendado)

La versión 2 del SDK introduce una API basada en clases (`QvaPaySDK`) que organiza la funcionalidad en 19 módulos temáticos, mejorando la descubribilidad, el tipado y la mantenibilidad.

### Instalación

```shell
npm install qvapay-sdk
# o
yarn add qvapay-sdk
```

### Configuración

```ts
import { QvaPaySDK } from "qvapay-sdk";

const sdk = new QvaPaySDK({
  appId: "TU_APP_ID",
  appSecret: "TU_APP_SECRET",
  token: "TOKEN_OPCIONAL",        // Bearer token preexistente (opcional)
  baseUrl: "https://api.qvapay.com", // URL base de la API (opcional, por defecto https://api.qvapay.com)
  timeout: 10000                 // Timeout en ms (opcional, por defecto 10000)
});
```

**Parámetros del constructor:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `appId` | `string` | Sí | ID de la aplicación |
| `appSecret` | `string` | Sí | Secreto de la aplicación |
| `token` | `string` | No | Token Bearer preexistente |
| `baseUrl` | `string` | No | URL base de la API (default: `https://api.qvapay.com`) |
| `timeout` | `number` | No | Timeout de petición en ms (default: `10000`) |

El constructor lanza `QvaPayValidationError` si `appId` o `appSecret` están vacíos o son `undefined`.

### Manejo de errores

El SDK define una jerarquía de errores tipados:

| Error | Cuándo se lanza | Propiedades adicionales |
|-------|-----------------|------------------------|
| `QvaPayError` | Clase base para todos los errores | — |
| `QvaPayValidationError` | Argumentos inválidos antes de la petición | `field?: string` |
| `QvaPayAuthError` | HTTP 401 / 403 (credenciales inválidas) | `statusCode: number` |
| `QvaPayApiError` | Respuesta HTTP no exitosa (≠ 2xx, salvo auth) | `statusCode: number`, `statusMessage?: string`, `code?: string` |
| `QvaPayNetworkError` | Error de red (sin respuesta, timeout) | — |

Ejemplo de captura:

```ts
try {
  const user = await sdk.user.getProfile();
} catch (err) {
  if (err instanceof QvaPayAuthError) {
    console.error("Error de autenticación:", err.statusCode);
  } else if (err instanceof QvaPayApiError) {
    console.error("Error de API:", err.statusCode, err.message, err.code);
  } else if (err instanceof QvaPayNetworkError) {
    console.error("Error de red:", err.message);
  } else if (err instanceof QvaPayValidationError) {
    console.error("Validación:", err.field, err.message);
  }
}
```

### Módulos disponibles

El SDK expone 19 módulos a través de la instancia `QvaPaySDK`:

| Módulo | Propiedad en SDK | Descripción | Métodos públicos principales |
|--------|------------------|-------------|------------------------------|
| **Auth** | `sdk.auth` | Autenticación y sesiones | `login`, `register`, `logout`, `logoutAll`, `registerConfirmation`, `checkAuth`, `requestPin`, `getSessions`, `deleteSession`, `create2fa`, `check2fa`, `reset2fa`, `confirmReset2fa`, `requestResetPassword`, `confirmResetPassword` |
| **App** | `sdk.app` | Gestión de aplicación (merchant) | `getInfo`, `getBalance`, `createInvoice`, `modifyInvoice`, `charge`, `authorizePayments`, `listTransactions`, `getTransaction` |
| **Apps** | `sdk.apps` | Administración de apps del usuario | `list`, `create`, `get`, `update`, `delete`, `getLogs`, `getPayButtons`, `createPayButton`, `updatePayButton`, `getMiniAppConversation`, `sendMiniAppMessage` |
| **Coins** | `sdk.coins` | Criptomonedas y tasas | `list`, `listCategorized`, `listV2`, `detail`, `priceHistory` |
| **Invoices** | `sdk.invoices` | Facturas de pago (v1, deprecado) | `create` |
| **Me** | `sdk.me` | Perfil del usuario autenticado (deprecado) | `getProfile`, `transfer` |
| **P2P** | `sdk.p2p` | Exchange peer-to-peer | `list`, `get`, `create`, `edit`, `apply`, `cancel`, `paid`, `received`, `rate`, `getChat`, `sendChatMessage`, `getAverages`, `getCompletedPairsAverage`, `getFeatured`, `getPromo`, `createPromo`, `pause`, `updateRate`, `getAttachments`, `uploadAttachment`, `getAttachment`, `getFeedSubscription`, `getFeedDeliveries`, `getStreamUrlAndHeaders`, `getChatStreamUrlAndHeaders` |
| **PaymentLinks** | `sdk.paymentLinks` | Enlaces de pago | `list`, `create`, `delete` |
| **Stocks** | `sdk.stocks` | Acciones / stocks | `list`, `get` / `detail`, `buy`, `sell`, `portfolio` |
| **Store** | `sdk.store` | Tienda (eSIM, vouchers, recargas, PIX) | `list`, `getMyPurchases`, `getMyPurchase`, `getEsimCatalog`, `purchaseEsim`, `getPixEligibility`, `createPixCheckout`, `getPixCheckout`, `cancelPixCheckout`, `getPhonePackages`, `buyPhonePackage`, `getVoucherFeatured`, `getVoucherCountries`, `getVoucherBrands`, `getVoucherOffers`, `purchaseVoucher`, `getLatamTopupCountries`, `getLatamTopupOperators`, `getLatamTopupOffers`, `getLatamTopup`, `purchaseLatamTopup` |
| **Transactions** | `sdk.transactions` | Transacciones del usuario | `list`, `listUser`, `get`, `getDetail`, `transfer`, `pay`, `downloadPdf`, `getComments`, `createComment`, `deleteComment`, `getStatus` |
| **User** | `sdk.user` | Perfil y configuración de usuario | `getProfile`, `getExtendedProfile`, `updateProfile`, `uploadAvatar`, `searchUsers`, `getKycStatus`, `requestKyc`, `getPaymentMethods`, `createPaymentMethod`, `updatePaymentMethod`, `deletePaymentMethod`, `getReferralLinks`, `createReferralLink`, `getLightningAddress`, `updateLightningAddress`, `decodeLightning`, `getEmailChangeStatus`, `updateEmail`, `verifyTelegram`, `requestTelegramLink`, `unlinkTelegram`, `getCip`, `verifyCpf`, `verifySsn`, `getDepositEligibility`, `getCompanyApplications`, `applyCompany`, `getPaymentAuths`, `revokePaymentAuth`, `getNotifications`, `updateNotifications`, `getContacts`, `createContact`, `deleteContact`, `toggleFavorite`, `getGoldStatus`, `buyGold`, `getReferrals`, `topUp` |
| **Withdraw** | `sdk.withdraw` | Retiros | `list`, `get`, `bankLookup`, `getCashZones`, `create` |
| **Support** | `sdk.support` | Tickets de soporte | `list`, `get`, `create`, `reply` |
| **Push** | `sdk.push` | Notificaciones push | `registerToken`, `revokeToken`, `getInbox`, `reportEvent` |
| **Saving** | `sdk.saving` | Cuenta de ahorro | `getAccount`, `getTransactions`, `deposit`, `withdraw`, `setRoundup` |
| **Energy** | `sdk.energy` | Energía TRON | `getPrices`, `getQuote`, `rent`, `listOrders`, `getOrder` |
| **Market** | `sdk.market` | Marketplace vendedores | `listShops`, `getShop`, `createShop`, `updateShop`, `deleteShop`, `getShopCategories`, `createShopCategory`, `reorderShopCategories`, `updateShopCategory`, `deleteShopCategory`, `listProducts`, `createProduct`, `updateProduct`, `deleteProduct`, `createProductsBulk`, `getProductVariants`, `syncProductVariants`, `listStores`, `getStoreBySlug`, `getCatalog`, `getPublicProduct`, `listOrders`, `createOrder`, `updateOrder`, `refundOrder`, `rateOrder`, `uploadImage` |
| **MiniApps** | `sdk.miniapps` | Catálogo de mini-apps | `list`, `get`, `getGrants`, `revokeGrant` |

### Ejemplo completo

```ts
import { QvaPaySDK, QvaPayAuthError, QvaPayValidationError } from "qvapay-sdk";

const sdk = new QvaPaySDK({
  appId: process.env.APP_ID!,
  appSecret: process.env.APP_SECRET!,
});

// Login con email y password
try {
  const result = await sdk.auth.login({
    email: "usuario@ejemplo.com",
    password: "secreto123",
  });

  if (result.twoFactorRequired) {
    console.log("2FA requerido:", result.info);
    // Pedir código 2FA y reintentar con twoFactorCode
  } else {
    console.log("Login OK, token:", result.token);
    console.log("Usuario:", result.user.username);
  }
} catch (err) {
  if (err instanceof QvaPayValidationError) {
    console.error("Campo inválido:", err.field);
  } else if (err instanceof QvaPayAuthError) {
    console.error("Credenciales incorrectas");
  }
}

// Usar módulos que requieren autenticación (inyectan Authorization: Bearer <token>)
const profile = await sdk.user.getProfile();
console.log("Balance:", profile.balance);

// Crear factura (usa app-id / app-secret)
const invoice = await sdk.app.createInvoice({
  amount: 10.50,
  description: "Pago de prueba",
  remote_id: "ref-12345",
});
console.log("URL de pago:", invoice.url);
```

---

## API legacy (deprecada)

La documentación a continuación corresponde a la API funcional legacy (exportada desde `src/api/*`). Se mantiene por compatibilidad pero **no se recomienda para nuevos proyectos**. Migre a **SDK v2** (sección anterior).

---

## 🚀 Estructura del Proyecto

Dentro del proyecto verás la estructura de carpetas y archivos:

```
/
├── src/
│   ├── api/
│   │   └── ...
│   ├── helpers/
│   │   └── ...
│   ├── interfaces/
│   │   └── ...
│   ├── services/       # SDK v2 - servicios basados en clases
│   │   └── ...
│   ├── lib.ts          # SDK v2 - clase principal QvaPaySDK
│   ├── utils.ts        # Utilidades (axios, mappers, interceptores)
│   ├── errors.ts       # SDK v2 - clases de error
│   └── types.ts        # SDK v2 - tipos e interfaces
├── __test__/
│   ├── sdk/            # Tests offline del SDK v2
│   └── auth/           # Tests legacy (requieren credenciales reales)
└── package.json
```

---

## 📖 Documentación legacy:

1. Instala el SDK.

```shell
npm install qvapay-sdk
o
yarn add qvapay-sdk
```

2. Configure en su archivo .env las siguientes variables de entorno:

```shell
APP_ID=
APP_SECRET=
EMAIL=
PASSWORD=
```

3. Cree un objeto con sus credenciales, incluyendo nombre de usuario y contraseña. Asegúrese de que la contraseña sea segura y no se comparta con nadie:

```js
const userLogin = {
  email: process.env.EMAIL,
  password: process.env.PASSWORD,
};
```

4. Cree un objeto con sus credenciales de Auth para su aplicación:

```js
const appAuth = {
  app_id: process.env.APP_ID,
  app_secret: process.env.APP_SECRET,
};
```

> Ahora que ha instalado el SDK y configurado sus opciones primarias, está listo para comenzar a usar todas las funcionalidades que le ofrece. ¡Aproveche al máximo todas las posibilidades que este SDK le ofrece!

---

## 🔐 Auth (legacy):

> La sección Auth contiene las funciones login, register y logout. Estas funciones son esenciales para garantizar que solo los usuarios autorizados puedan acceder al contenido y realizar acciones en la aplicación. Todas las funciones son asíncronas y retornan una promesa con la data o el error de la request.

### Login

> Esta función se encarga de realizar una petición POST a la API de Qvapay para iniciar sesión.

```js
import { login } from 'qvapay-sdk';

const res = await login(userLogin);
```

### Register

> Esta función se usa para registrar un usuario. Utiliza la API de qvapay para enviar los datos de registro al servidor. Si el registro se realiza correctamente, devuelve los datos recibidos del servidor. Si hay algún error, devuelve el error.

```js
import { register } from 'qvapay-sdk';

const newUser = {
  name: 'Juan Perez',
  email: 'juan@gmail.com',
  password: 'CffasdKB73iTtzNJN',
  c_password: 'CffasdKB73iTtzNJN',
  invite: 'referer_username (OPTIONAL)',
};

const res = await register(newUser);
```

### Logout

> Esta función intenta realizar una solicitud GET a la API qvapay para cerrar la sesión del usuario. Si la solicitud se realiza con éxito, devuelve los datos de respuesta. Si hay algún error, devuelve los datos de respuesta del error.

```js
import { login, logout } from 'qvapay-sdk';

const { accessToken } = await login(userLogin);
const res = await logout(accessToken);
```

> En los ejemplos que siguen, se usa el accessToken que retorna la función login(). Sin embargo, tenga presente que usted puede guardar este token de la forma que prefiera y usarlo posteriormente para realizar operaciones en su aplicación.

---

## 😎 User (legacy):

> La sección User ofrece una variedad de funcionalidades para administrar la información de los usuarios. La función getUser permite obtener información acerca de un usuario específico. La función updateUser permite actualizar la información del usuario. La función deposit permite realizar depósitos en la cuenta del usuario. Por último, la función withdraw permite realizar retiros desde la cuenta del usuario. Estas funcionalidades permiten a los usuarios administrar sus cuentas de forma segura y eficiente. Todas las funciones retornan una promesa con la data o el error de la request.

### getUser

> Este código es una función asíncrona que obtiene un usuario de la API de Qvapay. Esta función toma un token de acceso como parámetro y realiza una solicitud GET a la ruta '/user' con el token de acceso en los encabezados. Si la solicitud se completa con éxito, devuelve los datos del usuario como respuesta. Si hay algún error, devuelve los datos del error como respuesta.

```js
import { login, getUser } from 'qvapay-sdk';

const { accessToken } = await login(userLogin);
const res = await getUser(accessToken);
```

### updateUser

> Esta función se utiliza para actualizar un usuario en la API de Qvapay. Toma dos parámetros: un token de acceso y los datos a actualizar. La función intenta realizar la solicitud PUT a la API con los datos proporcionados y el token de acceso. Si la solicitud es exitosa, devuelve los datos recibidos. Si hay algún error, devuelve los datos recibidos en la respuesta del error.

```js
import { login, updateUser } from 'qvapay-sdk';

const { accessToken } = await login(userLogin);
const dataToUpdate = {
  name: 'Pedro Perez1',
  lastname: 'st',
  bio: 'svwb erberberb',
  logo: '',
  kyc: 1,
  username: 'wpiuwe',
  email: 'egc31@gmail.com',
  password: 'CffasdKB73iTtzNJN',
};

const res = await updateUser(accessToken, dataToUpdate);
```

### deposit

> Esta función se utiliza para realizar un depósito. La función toma dos parámetros: un token de acceso y un nuevo depósito. Utiliza la API de Qvapay para realizar el depósito. Si hay un error, la función devuelve los datos de la respuesta del servidor. Si no hay errores, devuelve los datos de la transacción.

```js
import { login, deposit } from 'qvapay-sdk';

const { accessToken } = await login(userLogin);
const newDeposit = {
  pay_method: 'BTCLN',
  amount: 67,
};

const res = await deposit(accessToken, newDeposit);
```

### withdraw

> Esta función se utiliza para hacer una extracción de la API Qvapay. Toma dos parámetros: un token de acceso y un objeto Withdraw. Luego, intenta realizar una solicitud POST a la ruta '/withdraw' con los datos del objeto Withdraw y el token de acceso en el encabezado. Si la solicitud es exitosa, devuelve los datos recibidos. Si hay algún error, devuelve los datos recibidos en la respuesta del error.

```js
import { login, withdraw } from 'qvapay-sdk';

const { accessToken } = await login(userLogin);
const newWithdraw = {
  pay_method: 'BTCLN',
  amount: 4,
  details: [
    {
      Wallet: 'bc1qs67kwcf7znpnc06xjh8cnc0zwsechcfxscghun',
    },
  ],
};

const res = await withdraw(accessToken, newWithdraw);
```

---

## 💱 Transactions (legacy):

> La sección Transactions ofrece una variedad de funciones para administrar las transacciones y retiros realizados por los usuarios. Estas funciones incluyen getOneTransaction, que permite obtener información sobre una transacción específica; getOneWithdraw, que permite obtener información sobre un retiro específico; getTransactionsFromUserAuth, que permite obtener todas las transacciones realizadas por el usuario autenticado; getWithdrawsFromUserAuth, que permite obtener todos los retiros realizados por el usuario autenticado; payPendingTransaction, que permite pagar una transacción pendiente; y transferBetweenUser, que permite transferir fondos entre dos usuarios. Estas funciones permiten a los usuarios administrar sus transacciones y retiros de forma segura y eficiente.

### getTransactionsFromUserAuth

> Esta función obtiene transacciones de un usuario autenticado. Toma dos parámetros, un token de acceso y un objeto de propiedades de transacción. Convierte el objeto de propiedades en entradas y parámetros de búsqueda, luego hace una solicitud GET a la API qvapay con los encabezados adecuados. Si la solicitud se realiza con éxito, devuelve los datos recibidos. Si hay un error, devuelve los datos recibidos como respuesta del error.

```js
import {login, getTransactionsFromUserAuth} from 'qvapay-sdk'

const { accessToken } = await login(userLogin);
const props = {
    start: date_time
    end: date_time
    status: [paid, pending, cancelled]
    remote_id: string
    description: string
}

const res = await getTransactionsFromUserAuth(accessToken, props)
```

### getOneTransaction

> Este código es una función asíncrona que se utiliza para obtener una transacción específica a partir de un token de acceso y un ID. Utiliza la API Qvapay para hacer la solicitud, y devuelve los datos de la transacción como respuesta. Si hay algún error, devuelve los datos de la respuesta del error.

```js
import { login, getOneTransaction } from 'qvapay-sdk';

const { accessToken } = await login(userLogin);
const id = '7e48853f-949c-4271-9b4a-1213ee83ac11';

const res = await getOneTransaction(accessToken, id);
```

### getWithdrawsFromUserAuth

> Esta función se utiliza para obtener los retiros de un usuario autenticado. Utiliza el token de acceso proporcionado como parámetro para realizar una solicitud GET a la API Qvapay. Si la solicitud es exitosa, devuelve los datos recibidos en forma de respuesta con retiro. Si hay algún error, devuelve los datos recibidos en la respuesta del error.

```js
import { login, getWithdrawsFromUserAuth } from 'qvapay-sdk';

const { accessToken } = await login(userLogin);
const res = await getWithdrawsFromUserAuth(accessToken);
```

### getOneWithdraw

> Esta función recibe dos parámetros: un token de acceso y una identificación. Esta función intenta obtener los datos de un retiro específico a través de la API Qvapay utilizando el token de acceso proporcionado. Si la solicitud se realiza con éxito, devuelve los datos del retiro. Si hay algún error, devuelve los datos del error.

```js
import { login, getOneWithdraw } from 'qvapay-sdk';

const { accessToken } = await login(userLogin);
const id = '10790';

const res = await getOneWithdraw(accessToken, id);
```

### transferBetweenUser

> Esta función se utiliza para transferir fondos entre usuarios. La función toma dos parámetros: accessToken y transfer. El accessToken se utiliza para autenticar la solicitud de transferencia. El transfer es un objeto que contiene información sobre el monto a transferir, el destinatario, etc. La función realiza una solicitud POST a la API qvapay para realizar la transferencia. Si la solicitud es exitosa, devuelve los datos de la transacción como resultado. En caso de error, devuelve los datos de error.

```js
import { login, transferBetweenUser } from 'qvapay-sdk';

const { accessToken } = await login(userLogin);
const transfer = {
  to: '52ff1628-5e91-4083-bc8e-6accce9a7d15',
  amount: 10,
  description: 'TESTING',
};

const res = await transferBetweenUser(accessToken, transfer);
```

### payPendingTransaction

> Esta función se encarga de realizar el pago de una transacción pendiente. Toma como parámetros el token de acceso y los detalles de la transacción a pagar. Intenta realizar el pago utilizando la API Qvapay y devuelve una respuesta con los resultados. Si hay un error, devuelve los datos del error. El PIN por defecto es 0000, pero se recomienda configurar un PIN secreto en el panel de usuario para mayor seguridad.

```js
import { login, payPendingTransaction } from 'qvapay-sdk';

const { accessToken } = await login(userLogin);
const pay = {
  uuid: '710296b7-0d5d-4e86-ab1b-9d79080dd042',
  pin: '0000',
};

const res = await payPendingTransaction(accessToken, pay);
```

---

## 🤑 Merchants (legacy)

> La sección Merchants le permite a los usuarios realizar operaciones financieras como consultar el saldo de una aplicación, obtener información sobre una aplicación, crear facturas, obtener una transacción de una aplicación y obtener transacciones de una aplicación. Estas funcionalidades le permiten al usuario administrar sus finanzas con facilidad y seguridad.

### appInfo

> Esta función se utiliza para obtener información sobre una aplicación. La función toma un objeto "AppAuth" como parámetro y devuelve un objeto "AppInfo" como promesa. La función intenta realizar una solicitud POST a la API qvapay para obtener la información de la aplicación. Si la solicitud es exitosa, devuelve los datos recibidos en el objeto "data". Si hay algún error, devuelve los datos recibidos en el objeto "response".

```js
import { appInfo } from 'qvapay-sdk';

const res = await appInfo(appAuth);
```

### appBalance

> Esta función se utiliza para obtener el saldo de una aplicación. Utiliza la API de Qvapay para enviar una solicitud POST con los datos de autenticación de la aplicación. Si la solicitud se procesa correctamente, devuelve los datos del saldo. Si hay un error, devuelve los datos del error.

```js
import { appBalance } from 'qvapay-sdk';

const res = await appBalance(appAuth);
```

### createInvoice

> Esta función permite crear una factura mediante la API de Qvapay. La función toma un objeto "invoice" como parámetro y devuelve una promesa con el objeto de respuesta "InvoiceResponse". El código intenta realizar una solicitud POST a la API de Qvapay para crear la factura. Si hay algún error, el código captura el error y devuelve los datos de la respuesta.

```js
import { createInvoice } from 'qvapay-sdk';

const invoice = {
  ...appAuth,
  amount: 99.99,
  description: 'Enanitos verdes',
  remote_id: 'MY_OWN_CUSTOM_ID',
  signed: 1,
};
const res = await createInvoice(invoice);
```

### getTransactionsFromApp

> Esta función toma un parámetro auth de tipo AppAuth. Esta función hace una solicitud POST a la API qvapay para obtener datos de transacciones. Si la solicitud se realiza con éxito, devuelve los datos recuperados en formato de promesa. Si hay algún error, devuelve los datos recuperados en el objeto de respuesta AxiosError.

```js
import { getTransactionsFromApp } from 'qvapay-sdk';

const res = await getTransactionsFromApp(appAuth);
```

### getOneTransactionFromApp

> Esta función se utiliza para obtener una transacción específica de una aplicación. Toma dos parámetros: auth (una autenticación de la aplicación) y id (el identificador de la transacción). La función envía una solicitud POST al servidor para recuperar los datos de la transacción especificada. Si la solicitud tiene éxito, devuelve los datos recuperados. En caso contrario, devuelve los datos del error.

```js
import { getOneTransactionFromApp } from 'qvapay-sdk';

const id = '54079648-39bc-49ef-bd3e-b89032a7ac05';
const res = await getOneTransactionFromApp(appAuth, id);
```

---

## 🔗 Payment Links (legacy)

> La sección Payment Links le permite a los usuarios crear enlaces de pago personalizados para recibir pagos de sus clientes. Estos enlaces pueden ser compartidos a través de correo electrónico, redes sociales o cualquier otra plataforma para que los clientes realicen el pago directamente desde su dispositivo. Además, la sección Payment Links también le permite al usuario ver todos los enlaces de pago creados y consultar el estado de cada uno.

### getAllPaymentLinks

> Esta función se utiliza para obtener todos los enlaces de pago. Utiliza la API QVAPay para realizar una solicitud GET a la ruta '/payment_links' con el token de acceso proporcionado como encabezado. Si la solicitud se realiza correctamente, devuelve los datos recibidos en la respuesta. En caso de error, devuelve los datos recibidos en la respuesta del error.

```js
import { login, getAllPaymentLinks } from 'qvapay-sdk';

const { accessToken } = await login(userLogin);
const res = await getAllPaymentLinks(accessToken);
```

### createPaymentLink

> Esta función crea un enlace de pago usando la API de Qvapay. Toma un token de acceso y un objeto con información sobre el pago como parámetros, realiza una solicitud POST a la API y devuelve los datos de respuesta. Si hay algún error, captura la excepción y devuelve los datos de respuesta.

```js
import { login, createPaymentLink } from 'qvapay-sdk';

const { accessToken } = await login(userLogin);
const info = {
  name: 'Pulover de guinga azul',
  product_id: 'PVG-AZUL',
  amount: 10.32,
};

const res = await createPaymentLink(accessToken, info);
```

---

## 🤖 Services (legacy)

> Nuestra sección de servicios cuenta con dos funcionalidades principales: getAllServices y getOneService, que te permiten obtener información detallada sobre cada uno de nuestros servicios.

### getAllServices

> Esta función se encarga de obtener todos los servicios disponibles. Esta función toma un token de acceso como parámetro y realiza una solicitud GET a la API qvapay para obtener los datos de los servicios. Si la solicitud es exitosa, devuelve los datos como respuesta. En caso contrario, devuelve los datos de la respuesta del error.

```js
import { login, getAllServices } from 'qvapay-sdk';

const { accessToken } = await login(userLogin);
const res = await getAllServices(accessToken);
```

### getOneService

> Esta función se utiliza para obtener un servicio específico utilizando un token de acceso y un ID. Utiliza la API Qvapay para realizar la solicitud y devolver los datos del servicio solicitado. Si hay un error, maneja el error y devuelve los datos de la respuesta.

```js
import { login, getOneService } from 'qvapay-sdk';

const { accessToken } = await login(userLogin);
const id = 'e286449c-5bf4-4fbc-9a85-95bb5b54c73e';

const res = await getOneService(accessToken, id);
```

---

## 💆‍♂️ P2P (legacy)

> La sección P2P ofrece una variedad de funciones para facilitar el intercambio de monedas digitales entre usuarios. Estas funciones incluyen getEnabledCurrencies, que permite a los usuarios ver qué monedas están habilitadas para el intercambio; getOffers, que permite a los usuarios ver todas las ofertas disponibles; getOneOffer, que permite a los usuarios ver una oferta específica; y getPairsAverage, que calcula el promedio de precios para un par de monedas específico. Estas herramientas permiten a los usuarios realizar transacciones rápidas y seguras con otros usuarios en la plataforma.

### getEnabledCurrencies

> Esta función se utiliza para obtener una lista de monedas habilitadas. Utiliza la API de Qvapay para realizar una solicitud GET a la ruta '/p2p/get_coins_list'. Si la solicitud se completa con éxito, devuelve los datos recibidos. Si hay algún error, devuelve los datos de la respuesta del error.

```js
import { getEnabledCurrencies } from 'qvapay-sdk';

const res = await getEnabledCurrencies();
```

### getPairsAverage

> Esta función se utiliza para obtener el promedio de pares completados para una moneda específica. Utiliza la API de Qvapay para realizar la solicitud y devuelve los datos como una respuesta de promesa. En caso de que ocurra un error, maneja la excepción y devuelve los datos del error como respuesta.

```js
import { getPairsAverage } from 'qvapay-sdk';

const coin = 'TRX';
const res = await getPairsAverage(coin);
```

### getOffers

> Esta función toma dos parámetros: accessToken y props. Primero, convierte los parámetros en un objeto URLSearchParams y luego realiza una solicitud GET a la API con el token de acceso proporcionado como encabezado de autorización. Si la solicitud se completa correctamente, devuelve los datos recibidos. Si hay algún error, devuelve los datos del error recibido en la respuesta.

```js
import { login, getOffers } from 'qvapay-sdk';

const { accessToken } = await login(userLogin);
const props = {
  type: 'buy',
  coin: 'ETECSA',
  min: 1,
  max: 50,
};
const res = await getOffers(accessToken, props);
```

### getOneOffer

> Esta función se utiliza para obtener una oferta específica a través de la API QVapay. La función toma dos parámetros: accessToken y id. Utiliza el token de acceso para autenticar la solicitud y el id para identificar la oferta específica. Luego, realiza una solicitud GET a la API QVapay para recuperar los datos de la oferta. Si hay algún error, manejará la respuesta del servidor y devolverá los datos. Finalmente, devuelve los datos de la oferta como un objeto Promise.

```js
import { login, getOneOffer } from 'qvapay-sdk';

const { accessToken } = await login(userLogin);
const id = '949780ed-7303-4a34-b8c3-2d55d802c75d';

const res = await getOneOffer(accessToken, id);
```

---

## 🏦 Rates (legacy)

> La sección Rates cuenta con las funciones currentCoins, currentRates. Haciendo uso de estas puede mantener a sus usuarios al tanto de las tarifas actualizadas.

### currentRates

> Esta función devuelve una promesa de una matriz de tasas actuales. Obtiene los datos desde la API de qvapayAPI. Si la solicitud se realiza correctamente, devolverá los datos recibidos. Si hay algún error en la solicitud, devolverá los datos recibidos en la respuesta del error.

```js
import { currentRates } from 'qvapay-sdk';

const res = await currentRates();
```

### currentCoins

> Esta función devuelve una promesa con una matriz de tasas actuales. Esta función obtiene los datos de la API qvapay. Si la solicitud es exitosa, los datos se devuelven como parte de la respuesta. Si hay un error, los datos se devuelven como parte de la respuesta del error. Esta función es útil para obtener información sobre las monedas actuales y sus tasas de cambio.

```js
import { currentCoins } from 'qvapay-sdk';

const res = await currentCoins();
```

---

> Este proyecto está en desarrollo y busca ofrecer una solución de código abierto para interactuar con la API de QvaPay. Estamos abiertos a cualquier sugerencia o feedback que nos ayude a mejorar el proyecto. Estamos comprometidos con la satisfacción de nuestros usuarios, por lo que cualquier contribución es bienvenida. Si tiene alguna idea para mejorar el proyecto, no dude en compartirla con nosotros. ¡Estamos ansiosos por escuchar sus ideas!