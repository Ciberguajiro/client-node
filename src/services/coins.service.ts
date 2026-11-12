import type { AxiosInstance } from "axios";
import { QvaPayValidationError } from "../errors";
import type {
  Coin,
  CoinCategory,
  CoinDetail,
  CoinPriceHistoryPoint,
  RawCoin,
  RawCoinDetail,
} from "../types";

export class CoinsService {
  constructor(private readonly http: AxiosInstance) {}

  /**
   * Obtiene la lista de monedas disponibles agrupadas o planas.
   */
  async list(): Promise<Coin[]> {
    const { data } = await this.http.get<RawCoin[]>("/coins");
    return data.map(mapCoin);
  }

  /**
   * Obtiene todas las categorías de monedas con sus coins asociados (GET /coins).
   */
  async listCategorized(): Promise<CoinCategory[]> {
    const { data } = await this.http.get<CoinCategory[]>("/coins");
    return data;
  }

  /**
   * Obtiene la lista de monedas v2 con filtros opcionales (GET /coins/v2).
   */
  async listV2(params?: {
    enabledIn?: boolean;
    enabledOut?: boolean;
    enabledP2p?: boolean;
  }): Promise<any> {
    const queryParams: Record<string, number> = {};
    if (params?.enabledIn !== undefined) queryParams.enabled_in = params.enabledIn ? 1 : 0;
    if (params?.enabledOut !== undefined) queryParams.enabled_out = params.enabledOut ? 1 : 0;
    if (params?.enabledP2p !== undefined) queryParams.enabled_p2p = params.enabledP2p ? 1 : 0;

    const { data } = await this.http.get<any>("/coins/v2", {
      params: queryParams,
    });
    return data;
  }

  async detail(id: string): Promise<CoinDetail> {
    if (!id?.trim()) {
      throw new QvaPayValidationError("El ID de la moneda es requerido", "id");
    }
    const { data } = await this.http.get<RawCoinDetail>(`/coins/${id}`);
    return mapCoinDetail(data);
  }

  /**
   * Obtiene el historial de precios de un coin por su ticker (GET /coins/price-history/:tick).
   * @param tick Ticker del coin (ej: BTC, ETH)
   * @param params Opciones de consulta: timeframe ("1H" | "24H" | "1W" | "1M" | "1Y" | "ALL", por defecto "24H")
   */
  async priceHistory(
    tick: string,
    params?: { timeframe?: "1H" | "24H" | "1W" | "1M" | "1Y" | "ALL" | string } | "1H" | "24H" | "1W" | "1M" | "1Y" | "ALL",
  ): Promise<CoinPriceHistoryPoint[]> {
    if (!tick?.trim()) {
      throw new QvaPayValidationError("El ticker de la moneda es requerido", "tick");
    }
    const timeframeValue = typeof params === "string" ? params : (params?.timeframe ?? "24H");
    const { data } = await this.http.get<CoinPriceHistoryPoint[]>(
      `/coins/price-history/${tick}`,
      { params: { timeframe: timeframeValue } },
    );
    return data;
  }
}

function mapCoin(raw: RawCoin): Coin {
  return {
    id: raw.id,
    name: raw.name,
    tick: raw.tick,
    logo: raw.logo,
    price: raw.price,
    change24h: raw.change_24h,
  };
}

function mapCoinDetail(raw: RawCoinDetail): CoinDetail {
  return {
    id: raw.id,
    name: raw.name,
    tick: raw.tick,
    logo: raw.logo,
    price: raw.price,
    change24h: raw.change_24h,
  };
}
