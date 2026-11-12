import axios from "axios";
import type { AxiosInstance } from "axios";
import type { QvaPayConfig } from "./types";
import { QvaPayApiError, QvaPayAuthError, QvaPayNetworkError } from "./errors";

export const DEFAULT_BASE_URL = "https://api.qvapay.com";
const DEFAULT_TIMEOUT = 10_000;

/**
 * Adjunta un interceptor para manejar errores de la API de forma centralizada.
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

/**
 * Instancia de Axios que inyecta app_id + app_secret en cada petición.
 */
export function createHttpClient(config: QvaPayConfig): AxiosInstance {
  const instance = axios.create({
    baseURL: config.baseUrl ?? DEFAULT_BASE_URL,
    timeout: config.timeout ?? DEFAULT_TIMEOUT,
    adapter: config.adapter,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(config.appId ? { "app-id": config.appId } : {}),
      ...(config.appSecret ? { "app-secret": config.appSecret } : {}),
    },
  });

  instance.interceptors.request.use((req) => {
    return req;
  });

  attachErrorInterceptor(instance);
  return instance;
}

/**
 * Instancia de Axios sin inyección de autenticación — usada para endpoints públicos.
 */
export function createPlainHttpClient(
  config: Pick<QvaPayConfig, "baseUrl" | "timeout" | "adapter">,
): AxiosInstance {
  const instance = axios.create({
    baseURL: config.baseUrl ?? DEFAULT_BASE_URL,
    timeout: config.timeout ?? DEFAULT_TIMEOUT,
    adapter: config.adapter,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  attachErrorInterceptor(instance);
  return instance;
}

/**
 * Instancia de Axios que inyecta un token Bearer dinámicamente en cada petición.
 */
export function createUserHttpClient(
  config: Pick<QvaPayConfig, "baseUrl" | "timeout" | "adapter">,
  getToken: () => string | null,
): AxiosInstance {
  const instance = axios.create({
    baseURL: config.baseUrl ?? DEFAULT_BASE_URL,
    timeout: config.timeout ?? DEFAULT_TIMEOUT,
    adapter: config.adapter,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  instance.interceptors.request.use((req) => {
    const token = getToken();
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  });

  attachErrorInterceptor(instance);
  return instance;
}

/**
 * Mapper genérico para respuestas paginadas.
 */
export function mapPaginated<Raw, Out>(
  raw: {
    current_page: number;
    data: Raw[];
    last_page: number;
    per_page: number;
    total: number;
  },
  mapItem: (item: Raw) => Out,
): {
  currentPage: number;
  data: Out[];
  lastPage: number;
  perPage: number;
  total: number;
} {
  return {
    currentPage: raw.current_page,
    data: raw.data.map(mapItem),
    lastPage: raw.last_page,
    perPage: raw.per_page,
    total: raw.total,
  };
}
