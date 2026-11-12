import type { AxiosInstance } from "axios";
import { QvaPayValidationError } from "../errors";
import type {
  RawStock,
  RawStockTrade,
  Stock,
  StockDetail,
  StockPortfolioParams,
  StockPortfolioResult,
  StockPricePoint,
  StockTrade,
  RawStockPortfolioResult,
} from "../types";

export class StocksService {
  constructor(private readonly http: AxiosInstance) {}

  async list(): Promise<Stock[]> {
    const { data } = await this.http.get<RawStock[]>("/stocks");
    return data.map(mapStock);
  }

  /**
   * Obtiene el historial de precios o cotización extendida de una acción (GET /stocks/:tick).
   * @param tick Símbolo bursátil de la acción (ej: AAPL, TSLA)
   * @param params Opciones de consulta: timeframe ('1H' | '24H' | '1W' | '1M' | '1Y') y/o type ('quote')
   */
  async get(
    tick: string,
    params: { type?: "quote"; timeframe?: "1H" | "24H" | "1W" | "1M" | "1Y" | string } = {},
  ): Promise<StockDetail | StockPricePoint[]> {
    if (!tick?.trim()) {
      throw new QvaPayValidationError("El símbolo es requerido", "tick");
    }
    const { data } = await this.http.get<StockDetail | StockPricePoint[]>(
      `/stocks/${tick}`,
      { params },
    );
    return data;
  }

  /**
   * Obtiene el detalle o historial de precios de una acción específica.
   * Alias de `get()`.
   */
  async detail(
    symbol: string,
    params: { type?: "quote"; timeframe?: "1H" | "24H" | "1W" | "1M" | "1Y" | string } = {},
  ): Promise<StockDetail | StockPricePoint[]> {
    return this.get(symbol, params);
  }

  async buy(symbol: string, amount: number): Promise<StockTrade> {
    if (!symbol?.trim()) {
      throw new QvaPayValidationError("El símbolo es requerido", "symbol");
    }
    if (amount <= 0) {
      throw new QvaPayValidationError("El monto debe ser mayor a 0", "amount");
    }
    const { data } = await this.http.post<RawStockTrade>(
      `/stocks/${symbol}/buy`,
      { amount },
    );
    return mapStockTrade(data);
  }

  async sell(symbol: string, quantity: number): Promise<StockTrade> {
    if (!symbol?.trim()) {
      throw new QvaPayValidationError("El símbolo es requerido", "symbol");
    }
    if (quantity <= 0) {
      throw new QvaPayValidationError("La cantidad debe ser mayor a 0", "quantity");
    }
    const { data } = await this.http.post<RawStockTrade>(
      `/stocks/${symbol}/sell`,
      { quantity },
    );
    return mapStockTrade(data);
  }

  async portfolio(params: StockPortfolioParams = {}): Promise<StockPortfolioResult> {
    const page = params.page ?? 1;
    const take = params.take ?? 20;
    if (page < 1) {
      throw new QvaPayValidationError("La página debe ser mayor o igual a 1", "page");
    }
    if (take < 1 || take > 50) {
      throw new QvaPayValidationError(
        "La cantidad por página debe estar entre 1 y 50",
        "take",
      );
    }
    const { data } = await this.http.get<{ success: boolean; data: RawStockPortfolioResult }>(
      "/stocks/portfolio",
      { params: { page, take } },
    );
    const raw = data.data;
    return {
      positions: raw.positions.map(mapPortfolioPosition),
      summary: mapPortfolioSummary(raw.summary),
      trades: raw.trades.map(mapPortfolioTrade),
      pagination: raw.pagination,
    };
  }
}

function mapStock(raw: RawStock): Stock {
  return {
    symbol: raw.symbol,
    name: raw.name,
    icon: raw.icon,
    iconStyle: raw.icon_style,
    image: raw.image,
    price: raw.price,
    change: raw.change,
    changeDollar: raw.change_dollar,
    volume: raw.volume,
    timestamp: raw.timestamp,
  };
}

function mapStockTrade(raw: RawStockTrade): StockTrade {
  return {
    tradeUuid: raw.trade_uuid,
    transactionUuid: raw.transaction_uuid,
    symbol: raw.symbol,
    quantity: raw.quantity,
    effectivePrice: raw.effective_price,
    marketPrice: raw.market_price,
    spreadPercent: raw.spread_percent,
    fee: raw.fee,
    extra: raw.extra,
  };
}

function mapPortfolioPosition(raw: RawStockPortfolioResult["positions"][number]): StockPortfolioResult["positions"][number] {
  return {
    id: raw.id,
    symbol: raw.symbol,
    quantity: raw.quantity,
    avgCost: raw.avg_cost,
    currentPrice: raw.current_price,
    marketValue: raw.market_value,
    costBasis: raw.cost_basis,
    unrealizedPnl: raw.unrealized_pnl,
    unrealizedPnlPercent: raw.unrealized_pnl_percent,
  };
}

function mapPortfolioSummary(raw: RawStockPortfolioResult["summary"]): StockPortfolioResult["summary"] {
  return {
    totalMarketValue: raw.total_market_value,
    totalCostBasis: raw.total_cost_basis,
    totalUnrealizedPnl: raw.total_unrealized_pnl,
    totalUnrealizedPnlPercent: raw.total_unrealized_pnl_percent,
    marketOpen: raw.market_open,
  };
}

function mapPortfolioTrade(raw: RawStockPortfolioResult["trades"][number]): StockPortfolioResult["trades"][number] {
  return {
    id: raw.id,
    uuid: raw.uuid,
    symbol: raw.symbol,
    type: raw.type,
    quantity: raw.quantity,
    marketPrice: raw.market_price,
    effectivePrice: raw.effective_price,
    spreadPercent: raw.spread_percent,
    feeAmount: raw.fee_amount,
    totalAmount: raw.total_amount,
    realizedPnl: raw.realized_pnl,
    afterHours: raw.after_hours,
    createdAt: raw.created_at,
  };
}
