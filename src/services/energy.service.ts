import type { AxiosInstance } from "axios";
import { QvaPayValidationError } from "../errors";

export interface EnergyPricePreset {
  preset: string;
  title: string;
  detail: string;
  volume: number;
  duration: string;
  price_usd: number;
  unit_price_usd: number;
}

export interface EnergyPricesResult {
  data: EnergyPricePreset[];
  meta: {
    durations: string[];
    min_volume: number;
    max_volume: number;
    note: string;
  };
}

export interface EnergyQuoteParams {
  volume: number;
  duration: "1h" | "1d" | "3d" | "7d" | string;
}

export interface EnergyQuoteResult {
  data: {
    quote_id: string;
    volume: number;
    duration: string;
    price_usd: number;
    expires_at: string;
  };
}

export interface EnergyRentParams {
  target_address: string;
  volume: number;
  duration: "1h" | "1d" | "3d" | "7d" | string;
  idempotency_key: string;
  quote_id?: string;
  max_price_usd?: number;
}

export interface EnergyOrder {
  uuid: string;
  resource: string;
  target_address: string;
  volume: number;
  duration: string;
  price_usd: number;
  status: "pending" | "dispatching" | "completed" | "refunded" | "needs_review" | string;
  reason?: string | null;
  order_id?: string;
  txid?: string | null;
  explorer?: string;
  created_at: string;
  completed_at?: string;
}

export interface EnergyRentResult {
  data: EnergyOrder;
  balance: number;
}

/**
 * Servicio para cotizar y alquilar energía de la red TRON con saldo QvaPay.
 */
export class EnergyService {
  constructor(private readonly http: AxiosInstance) {}

  /**
   * Consulta los precios actuales y por unidad de energía (GET /v2/energy/prices).
   */
  async getPrices(): Promise<EnergyPricesResult> {
    const { data } = await this.http.get<EnergyPricesResult>("/v2/energy/prices");
    return data;
  }

  /**
   * Congela una cotización de energía por ~90 segundos (POST /v2/energy/quote).
   */
  async getQuote(params: EnergyQuoteParams): Promise<EnergyQuoteResult> {
    if (params.volume < 32_000 || params.volume > 5_000_000) {
      throw new QvaPayValidationError(
        "El volumen de energía debe estar entre 32,000 y 5,000,000",
        "volume",
      );
    }
    if (!params.duration?.trim()) {
      throw new QvaPayValidationError("La duración es requerida", "duration");
    }

    const { data } = await this.http.post<EnergyQuoteResult>("/v2/energy/quote", params);
    return data;
  }

  /**
   * Alquila energía para una dirección TRON delegada (POST /v2/energy/rent).
   */
  async rent(params: EnergyRentParams): Promise<EnergyRentResult> {
    if (!params.target_address?.trim()) {
      throw new QvaPayValidationError("La dirección destino es requerida", "target_address");
    }
    if (params.volume < 32_000 || params.volume > 5_000_000) {
      throw new QvaPayValidationError(
        "El volumen de energía debe estar entre 32,000 y 5,000,000",
        "volume",
      );
    }
    if (!params.duration?.trim()) {
      throw new QvaPayValidationError("La duración es requerida", "duration");
    }
    if (!params.idempotency_key?.trim()) {
      throw new QvaPayValidationError("La clave de idempotencia es requerida", "idempotency_key");
    }

    const { data } = await this.http.post<EnergyRentResult>("/v2/energy/rent", params);
    return data;
  }

  /**
   * Consulta el listado de órdenes de energía del usuario (GET /v2/energy/orders).
   */
  async listOrders(params: { page?: number; status?: string } = {}): Promise<any> {
    const { data } = await this.http.get<any>("/v2/energy/orders", {
      params,
    });
    return data;
  }

  /**
   * Consulta los detalles de una orden de energía por su UUID (GET /v2/energy/orders/:uuid).
   */
  async getOrder(uuid: string): Promise<{ data: EnergyOrder }> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la orden es requerido", "uuid");
    }
    const { data } = await this.http.get<{ data: EnergyOrder }>(`/v2/energy/orders/${uuid}`);
    return data;
  }
}
