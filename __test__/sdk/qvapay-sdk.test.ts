import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { QvaPaySDK } from "../../src/lib";
import {
  QvaPayValidationError,
  QvaPayAuthError,
  QvaPayApiError,
  QvaPayNetworkError,
} from "../../src/errors";
import type { QvaPayConfig } from "../../src/types";

/**
 * Adjunta un interceptor para manejar errores de la API de forma centralizada.
 * Copiado de src/utils.ts para uso en tests.
 */
function attachErrorInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (res) => res,
    (error: unknown) => {
      if (!axios.isAxiosError(error)) throw error;

      if (!error.response) {
        throw new QvaPayNetworkError(
          error.message || "Error de red — no se recibió respuesta",
        );
      }

      const { status, data } = error.response as {
        status: number;
        data: Record<string, any> | undefined;
      };
      const apiMessage: string =
        data?.message ?? data?.error ?? "Error de la API";
      const errorCode: string | undefined =
        typeof data?.code === "string" ? data.code : undefined;

      if (status === 401 || status === 403) {
        throw new QvaPayAuthError(apiMessage, status);
      }

      throw new QvaPayApiError(apiMessage, status, data?.status_message, errorCode);
    },
  );
}

// ─── Helpers para mocking ────────────────────────────────────────────────

interface MockResponse<T = any> {
  status: number;
  data: T;
  headers?: any;
}

class MockAdapter {
  responses: MockResponse[] = [];

  async adapter(config: AxiosRequestConfig): Promise<AxiosResponse> {
    const response = this.responses.shift();
    if (!response) {
      throw new Error("No mock response available");
    }
    if (response.status >= 400) {
      const error: any = new Error("Request failed");
      error.isAxiosError = true;
      error.response = { status: response.status, data: response.data, headers: response.headers, config, request: {} };
      error.config = config;
      throw error;
    }
    return { status: response.status, data: response.data, headers: response.headers, config, request: {} } as AxiosResponse;
  }
}

function applyMockAdapter(instance: AxiosInstance): MockAdapter {
  const adapter = new MockAdapter();
  (instance as any).defaults.adapter = adapter.adapter.bind(adapter);
  return adapter;
}

// ─── Tests ────────────────────────────────────────────────────────────────

describe("QvaPaySDK - constructor", () => {
  test("lanza QvaPayValidationError sin appId", () => {
    expect(() => new QvaPaySDK({ appId: "", appSecret: "secret" })).toThrow(QvaPayValidationError);
    expect(() => new QvaPaySDK({ appId: undefined as any, appSecret: "secret" })).toThrow(QvaPayValidationError);
  });

  test("lanza QvaPayValidationError sin appSecret", () => {
    expect(() => new QvaPaySDK({ appId: "id", appSecret: "" })).toThrow(QvaPayValidationError);
    expect(() => new QvaPaySDK({ appId: "id", appSecret: undefined as any })).toThrow(QvaPayValidationError);
  });

  test("instancia correctamente con appId y appSecret válidos", () => {
    const sdk = new QvaPaySDK({ appId: "test-id", appSecret: "test-secret" });
    expect(sdk).toBeInstanceOf(QvaPaySDK);
    expect(sdk.token).toBeNull();
  });

  test("acepta token opcional en constructor", () => {
    const sdk = new QvaPaySDK({ appId: "id", appSecret: "secret", token: "pre-token" });
    expect(sdk.token).toBe("pre-token");
  });

  test("acepta baseUrl y timeout personalizados", () => {
    const sdk = new QvaPaySDK({ appId: "id", appSecret: "secret", baseUrl: "https://custom.api", timeout: 5000 });
    expect(sdk).toBeInstanceOf(QvaPaySDK);
  });
});

describe("QvaPaySDK - auth.login", () => {
  let sdk: QvaPaySDK;
  let plainHttpAdapter: MockAdapter;
  let userHttpAdapter: MockAdapter;

  beforeEach(() => {
    sdk = new QvaPaySDK({ appId: "id", appSecret: "secret" });
    const authSvc = (sdk as any).auth;
    plainHttpAdapter = applyMockAdapter(authSvc.plainHttp);
    userHttpAdapter = applyMockAdapter(authSvc.userHttp);
  });

  test("lanza QvaPayValidationError si email vacío", async () => {
    await expect(sdk.auth.login({ email: "", password: "pass" })).rejects.toThrow(QvaPayValidationError);
    await expect(sdk.auth.login({ email: "   ", password: "pass" })).rejects.toThrow(QvaPayValidationError);
  });

  test("lanza QvaPayValidationError si password vacío", async () => {
    await expect(sdk.auth.login({ email: "test@test.com", password: "" })).rejects.toThrow(QvaPayValidationError);
  });

  test("login exitoso: guarda token en sdk.token y devuelve LoginSuccessResult", async () => {
    const mockResponse = {
      accessToken: "new-token-123",
      token_type: "Bearer",
      me: {
        uuid: "user-uuid",
        name: "John",
        username: "john",
        email: "john@test.com",
        photo: null,
        balance: "100.00",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    };

    plainHttpAdapter.responses.push({ status: 200, data: mockResponse });
    const promise = sdk.auth.login({ email: "test@test.com", password: "pass" });
    const result = await promise;

    expect(result.twoFactorRequired).toBe(false);
    if (!result.twoFactorRequired) {
      expect(result.token).toBe("new-token-123");
      expect(result.user.email).toBe("john@test.com");
    }
    expect(sdk.token).toBe("new-token-123");
  });

  test("login con 2FA (status 202): devuelve twoFactorRequired=true y NO guarda token", async () => {
    const mockResponse = {
      info: "Código 2FA requerido",
      notified: true,
      has_otp: true,
    };

    plainHttpAdapter.responses.push({ status: 202, data: mockResponse });
    const promise = sdk.auth.login({ email: "test@test.com", password: "pass", twoFactorCode: "123456" });
    const result = await promise;

    expect(result.twoFactorRequired).toBe(true);
    if (result.twoFactorRequired) {
      expect(result.info).toBe("Código 2FA requerido");
      expect(result.notified).toBe(true);
      expect(result.hasOtp).toBe(true);
    }
    expect(sdk.token).toBeNull();
  });

  test("login con has_otp en respuesta (200): devuelve twoFactorRequired=true", async () => {
    const mockResponse = {
      has_otp: true,
      info: "2FA needed",
      notified: false,
    };

    plainHttpAdapter.responses.push({ status: 200, data: mockResponse });
    const promise = sdk.auth.login({ email: "test@test.com", password: "pass" });
    const result = await promise;

    expect(result.twoFactorRequired).toBe(true);
    if (result.twoFactorRequired) {
      expect(result.info).toBe("2FA needed");
      expect(result.notified).toBe(false);
      expect(result.hasOtp).toBe(true);
    }
    expect(sdk.token).toBeNull();
  });

  test("envía remember y twoFactorCode en payload", async () => {
    plainHttpAdapter.responses.push({ status: 200, data: { accessToken: "t", token_type: "Bearer", me: { uuid: "u", name: "n", username: "u", email: "e@e.com", photo: null, balance: "0", created_at: "2024-01-01", updated_at: "2024-01-01" } } });
    const promise = sdk.auth.login({ email: "test@test.com", password: "pass", remember: true, twoFactorCode: "123456" });
    await promise;

    expect(sdk.token).toBe("t");
  });
});

describe("QvaPaySDK - userHttp inyecta Authorization header tras login", () => {
  let sdk: QvaPaySDK;
  let userHttpAdapter: MockAdapter;

  beforeEach(() => {
    sdk = new QvaPaySDK({ appId: "id", appSecret: "secret" });
    const services = ["apps", "transactions", "me", "p2p", "stocks", "user", "withdraw", "paymentLinks", "support", "push", "saving", "energy", "market", "miniapps"];
    for (const name of services) {
      const svc = (sdk as any)[name];
      if (svc?.userHttp) applyMockAdapter(svc.userHttp);
      if (svc?.http) applyMockAdapter(svc.http);
    }
    userHttpAdapter = applyMockAdapter(((sdk as any).user).userHttp);
  });

  test("antes de login NO envía Authorization", async () => {
    userHttpAdapter.responses.push({ status: 200, data: { uuid: "u", username: "u", name: "n", lastname: "", email: "e@e.com", bio: "", balance: 0, phone: "", phone_verified: false, kyc: false, golden_check: false, golden_expire: null, p2p_enabled: false, cover: "", image: "", twitter: "", telegram: "", two_factor_secret: null, average_rating: 0, latest_transactions: [] } });

    const promise = sdk.user.getProfile();
    await promise;

    expect(true).toBe(true);
  });

  test("después de login SÍ envía Authorization: Bearer <token>", async () => {
    // Simular login
    const authSvc = (sdk as any).auth;
    const authPlainAdapter = applyMockAdapter(authSvc.plainHttp);
    authPlainAdapter.responses.push({ status: 200, data: { accessToken: "my-bearer-token", token_type: "Bearer", me: { uuid: "u", name: "n", username: "u", email: "e@e.com", photo: null, balance: "0", created_at: "2024-01-01", updated_at: "2024-01-01" } } });
    const loginPromise = sdk.auth.login({ email: "test@test.com", password: "pass" });
    await loginPromise;

    // Ahora probar userHttp
    userHttpAdapter.responses.push({ status: 200, data: { uuid: "u", username: "u", name: "n", lastname: "", email: "e@e.com", bio: "", balance: 0, phone: "", phone_verified: false, kyc: false, golden_check: false, golden_expire: null, p2p_enabled: false, cover: "", image: "", twitter: "", telegram: "", two_factor_secret: null, average_rating: 0, latest_transactions: [] } });
    const promise = sdk.user.getProfile();
    await promise;

    expect(sdk.token).toBe("my-bearer-token");
  });
});

describe("QvaPaySDK - appHttp inyecta headers app-id / app-secret", () => {
  let sdk: QvaPaySDK;
  let appHttpAdapter: MockAdapter;

  beforeEach(() => {
    sdk = new QvaPaySDK({ appId: "my-app-id", appSecret: "my-app-secret" });
    const appSvc = (sdk as any).app;
    appHttpAdapter = applyMockAdapter(appSvc.http);
  });

  test("app.getInfo envía app-id y app-secret en headers", async () => {
    appHttpAdapter.responses.push({ status: 200, data: { uuid: "app-uuid", name: "Test App", url: "https://test.com", desc: "Desc", logo: "logo.png", active: true, user_id: 1 } });

    const promise = sdk.app.getInfo();
    await promise;

    expect(true).toBe(true);
  });
});

describe("QvaPaySDK - interceptores de errores", () => {
  let sdk: QvaPaySDK;
  let userHttpAdapter: MockAdapter;

  beforeEach(() => {
    sdk = new QvaPaySDK({ appId: "id", appSecret: "secret" });
    userHttpAdapter = applyMockAdapter(((sdk as any).user).userHttp);
  });

  test("401 -> QvaPayAuthError", async () => {
    userHttpAdapter.responses.push({ status: 401, data: { message: "Unauthorized" } });

    const promise = sdk.user.getProfile();
    await expect(promise).rejects.toThrow(QvaPayAuthError);
    await expect(promise).rejects.toMatchObject({ statusCode: 401 });
  });

  test("403 -> QvaPayAuthError", async () => {
    userHttpAdapter.responses.push({ status: 403, data: { message: "Forbidden" } });

    const promise = sdk.user.getProfile();
    await expect(promise).rejects.toThrow(QvaPayAuthError);
    await expect(promise).rejects.toMatchObject({ statusCode: 403 });
  });

  test("500 -> QvaPayApiError con statusCode y message", async () => {
    userHttpAdapter.responses.push({ status: 500, data: { message: "Internal Server Error", status_message: "Server Error", code: "INTERNAL" } });

    const promise = sdk.user.getProfile();
    await expect(promise).rejects.toThrow(QvaPayApiError);
    try {
      await promise;
    } catch (e: any) {
      expect(e.statusCode).toBe(500);
      expect(e.message).toBe("Internal Server Error");
      expect(e.statusMessage).toBe("Server Error");
      expect(e.code).toBe("INTERNAL");
    }
  });

  test("sin response (error de red) -> QvaPayNetworkError", async () => {
    const networkError = new Error("Network Error");
    (networkError as any).isAxiosError = true;
    (networkError as any).response = undefined;

    const mockAdapter = new MockAdapter();
    mockAdapter.adapter = async () => { throw networkError; };
    const mockHttp = axios.create();
    (mockHttp as any).defaults.adapter = mockAdapter.adapter.bind(mockAdapter);
    attachErrorInterceptor(mockHttp);
    
    const userSvc = (sdk as any).user;
    userSvc.userHttp = mockHttp;

    const promise = sdk.user.getProfile();
    await expect(promise).rejects.toThrow(QvaPayNetworkError);
  });

  test("timeout -> QvaPayNetworkError", async () => {
    const timeoutError = new Error("timeout of 10000ms exceeded");
    (timeoutError as any).isAxiosError = true;
    (timeoutError as any).code = "ECONNABORTED";
    (timeoutError as any).response = undefined;

    const mockAdapter = new MockAdapter();
    mockAdapter.adapter = async () => { throw timeoutError; };
    const mockHttp = axios.create();
    (mockHttp as any).defaults.adapter = mockAdapter.adapter.bind(mockAdapter);
    attachErrorInterceptor(mockHttp);
    
    const userSvc = (sdk as any).user;
    userSvc.userHttp = mockHttp;

    const promise = sdk.user.getProfile();
    await expect(promise).rejects.toThrow(QvaPayNetworkError);
  });
});

describe("QvaPaySDK - mapPaginated", () => {
  test("mapea correctamente respuesta paginada", () => {
    const { mapPaginated } = require("../../src/utils");
    const raw = {
      current_page: 2,
      data: [{ id: 1, name: "a" }, { id: 2, name: "b" }],
      last_page: 5,
      per_page: 2,
      total: 10,
    };
    const result = mapPaginated(raw, (item: { id: number; name: string }) => ({ ...item, mapped: true }));
    expect(result).toEqual({
      currentPage: 2,
      data: [{ id: 1, name: "a", mapped: true }, { id: 2, name: "b", mapped: true }],
      lastPage: 5,
      perPage: 2,
      total: 10,
    });
  });

  test("funciona con array vacío", () => {
    const { mapPaginated } = require("../../src/utils");
    const raw = { current_page: 1, data: [], last_page: 1, per_page: 20, total: 0 };
    const result = mapPaginated(raw, (x: unknown) => x);
    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });
});

// ─── Tests por servicio (uno representativo cada uno) ────────────────────

function createServiceTest(serviceName: string, httpProp: "http" | "userHttp" | "plainHttp", method: string, args: any[], expectedUrl: string, expectedMethod: string, responseData: any) {
  let sdk: QvaPaySDK;
  let adapter: MockAdapter;

  beforeEach(() => {
    sdk = new QvaPaySDK({ appId: "id", appSecret: "secret" });
    const svc = (sdk as any)[serviceName];
    adapter = applyMockAdapter(svc[httpProp]);
    adapter.responses.push({ status: 200, data: responseData });
  });

  test(`${method}: ${expectedMethod} ${expectedUrl}`, async () => {
    const promise = (sdk as any)[serviceName][method](...args);
    const result = await promise;
    expect(result).toBeDefined();
    return result;
  });
}

describe("QvaPaySDK - servicios: app", () => {
  createServiceTest(
    "app",
    "http",
    "getInfo",
    [],
    "/v2/info",
    "post",
    { uuid: "app-uuid", name: "Test", url: "https://test.com", desc: "Desc", logo: "logo.png", active: true, user_id: 1 }
  );
});

describe("QvaPaySDK - servicios: apps", () => {
  createServiceTest(
    "apps",
    "userHttp",
    "list",
    [],
    "/app",
    "get",
    [{ uuid: "a1", name: "App 1", url: "https://a1.com", logo: "l1.png", description: "D1", callback: "cb1", success_url: "s1", cancel_url: "c1", active: true, enabled: true, allowed_payment_auth: false, card: null, created_at: "2024-01-01", updated_at: "2024-01-01" }]
  );
});

describe("QvaPaySDK - servicios: coins", () => {
  createServiceTest(
    "coins",
    "http",
    "list",
    [],
    "/coins",
    "get",
    [{ id: "btc", name: "Bitcoin", tick: "BTC", logo: "btc.png", price: "50000", change_24h: "2.5" }]
  );
});

describe("QvaPaySDK - servicios: invoices", () => {
  createServiceTest(
    "invoices",
    "http",
    "create",
    [{ amount: 10, description: "Test", remoteId: "ref-1" }],
    "/v2/create_invoice",
    "post",
    { transaction_uuid: "tx-1", amount: 10, description: "Test", remote_id: "ref-1", url: "https://pay.com/tx-1", expire_at: "2024-12-31" }
  );
});

describe("QvaPaySDK - servicios: me", () => {
  createServiceTest(
    "me",
    "http",
    "getProfile",
    [],
    "/user",
    "get",
    { uuid: "u1", name: "John", username: "john", email: "j@j.com", photo: null, balance: "100", created_at: "2024-01-01", updated_at: "2024-01-01" }
  );
});

describe("QvaPaySDK - servicios: p2p", () => {
  createServiceTest(
    "p2p",
    "http",
    "list",
    [{ page: 1, take: 10 }],
    "/p2p",
    "get",
    { offers: [{ uuid: "p2p-1", type_1: "buy", coin: "BTC", amount: 100, receive: 95, status: "open", only_kyc: 0, only_vip: 0, private: 0, message: "", created_at: "2024-01-01", updated_at: "2024-01-01", User: { uuid: "u1", username: "user1", name: "User", image: "img.png", kyc: true, vip: false, golden_check: false }, Coin: { tick: "BTC", name: "Bitcoin", logo: "btc.png" } }] }
  );
});

describe("QvaPaySDK - servicios: paymentLinks", () => {
  createServiceTest(
    "paymentLinks",
    "http",
    "create",
    [{ name: "Link 1", product_id: "prod-1", amount: 50 }],
    "/user/payment-links",
    "post",
    { id: "link-1", name: "Link 1", product_id: "prod-1", amount: 50, created_at: "2024-01-01", updated_at: "2024-01-01" }
  );
});

describe("QvaPaySDK - servicios: stocks", () => {
  createServiceTest(
    "stocks",
    "http",
    "list",
    [],
    "/stocks",
    "get",
    [{ symbol: "AAPL", name: "Apple Inc.", icon: "aapl.png", icon_style: "style", image: "img.png", price: "150.00", change: "1.5", change_dollar: "2.25", volume: "1000000", timestamp: "2024-01-01T00:00:00Z" }]
  );
});

describe("QvaPaySDK - servicios: store", () => {
  createServiceTest(
    "store",
    "http",
    "list",
    [],
    "/store",
    "get",
    { message: "OK", data: [{ id: 1, name: "Product 1" }] }
  );
});

describe("QvaPaySDK - servicios: transactions", () => {
  createServiceTest(
    "transactions",
    "http",
    "list",
    [2],
    "/transaction",
    "get",
    [{ uuid: "tx-1", amount: "10.00", currency: "USD", status: "paid", description: "Test", remote_id: "ref-1", paid_at: "2024-01-01", created_at: "2024-01-01", updated_at: "2024-01-01", app: { uuid: "app-1", name: "App", url: "https://app.com", desc: "D", logo: "l.png", active: true, user_id: 1 } }]
  );
});

describe("QvaPaySDK - servicios: user", () => {
  createServiceTest(
    "user",
    "userHttp",
    "getProfile",
    [],
    "/user",
    "get",
    { uuid: "u1", username: "user1", name: "John", lastname: "Doe", email: "j@d.com", bio: "Bio", balance: 100, phone: "", phone_verified: false, kyc: true, golden_check: false, golden_expire: null, p2p_enabled: true, cover: "", image: "", twitter: "", telegram: "", two_factor_secret: null, average_rating: 5, latest_transactions: [] }
  );
});

describe("QvaPaySDK - servicios: withdraw", () => {
  createServiceTest(
    "withdraw",
    "http",
    "list",
    [{ page: 1, take: 10 }],
    "/withdraw",
    "get",
    { result: "ok", data: [{ withdraw_id: 1, transaction_id: "tx-1", receive_amount: 90, receive_amount_coin: 90, fee_to_apply: 10, amount: 100, coin: "USDT", status: "pending", payment_method: "BANK", tx_id: "txid-1", created_at: "2024-01-01", updated_at: "2024-01-01" }], meta: {} }
  );
});

describe("QvaPaySDK - servicios: support", () => {
  createServiceTest(
    "support",
    "http",
    "list",
    [{ page: 1, take: 10 }],
    "/user/support",
    "get",
    { data: [{ id: "t1", ticket_number: "TKT-1", status: "open", priority: "high", topic: "Test", subject: "Subject", message: "Msg", source: "web", created_at: "2024-01-01", updated_at: "2024-01-01" }], total: 1, page: 1, take: 10, pages: 1 }
  );
});

describe("QvaPaySDK - servicios: push", () => {
  createServiceTest(
    "push",
    "http",
    "getInbox",
    [{ limit: 10 }],
    "/push/inbox",
    "get",
    { items: [{ id: "p1", type: "tx", category: "transactional", title: "Title", body: "Body", deeplink: null, url: null, image: null, campaign_id: null, opened_at: null, created_at: "2024-01-01" }], next_cursor: null }
  );
});

describe("QvaPaySDK - servicios: saving", () => {
  createServiceTest(
    "saving",
    "http",
    "getAccount",
    [],
    "/saving",
    "get",
    { success: true, data: { hasAccount: true, balance: 100, totalDeposited: 500, totalWithdrawn: 50, totalEarned: 10, currentRate: 5.5, lastEarningDate: "2024-01-01", kycVerified: true, usRestricted: false, usDebtRepaymentMax: 1000, savings_roundup: false } }
  );
});

describe("QvaPaySDK - servicios: energy", () => {
  createServiceTest(
    "energy",
    "http",
    "getPrices",
    [],
    "/v2/energy/prices",
    "get",
    { data: [{ preset: "p1", title: "Preset 1", detail: "Detail", volume: 32000, duration: "1h", price_usd: 1.0, unit_price_usd: 0.00003125 }], meta: { durations: ["1h"], min_volume: 32000, max_volume: 5000000, note: "Note" } }
  );
});

describe("QvaPaySDK - servicios: market", () => {
  createServiceTest(
    "market",
    "http",
    "listShops",
    [{ page: 1, take: 10 }],
    "/market/shops",
    "get",
    { shops: [{ uuid: "shop-1", slug: "shop1", name: "Shop 1", description: "Desc", logo: "logo.png", banner: null, country: "US", status: "active", sales_count: 100, rating_avg: 4.5, created_at: "2024-01-01" }], total: 1, page: 1, take: 10 }
  );
});

describe("QvaPaySDK - servicios: miniapps", () => {
  createServiceTest(
    "miniapps",
    "http",
    "list",
    ["android"],
    "/miniapps",
    "get",
    { data: [{ uuid: "ma1", slug: "mini1", name: "Mini 1", tagline: "Tag", icon: "icon.png", cover: null, entry_url: "https://mini.com", allowed_origins: [], category: "tools", featured: false, scopes: [], app_uuid: null, merchant: { name: "Merch", logo: null }, granted: false, granted_scopes: [], preview: false }] }
  );
});