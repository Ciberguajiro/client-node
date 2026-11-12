import type { AxiosInstance } from "axios";
import { QvaPayValidationError } from "../errors";
import type {
  BankLookupResult,
  CashZonesResult,
  CreateWithdrawParams,
  CreateWithdrawResult,
  RawCreateWithdrawResult,
  RawWithdraw,
  RawWithdrawListResult,
  Withdraw,
  WithdrawListParams,
  WithdrawListResult,
} from "../types";

function mapWithdraw(raw: RawWithdraw): Withdraw {
  return {
    withdrawId: raw.withdraw_id,
    transactionId: raw.transaction_id,
    receiveAmount: raw.receive_amount,
    receiveAmountCoin: raw.receive_amount_coin,
    feeToApply: raw.fee_to_apply,
    amount: raw.amount,
    coin: raw.coin,
    status: raw.status,
    paymentMethod: raw.payment_method,
    txId: raw.tx_id,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function mapCreateWithdrawResult(raw: RawCreateWithdrawResult): CreateWithdrawResult {
  return {
    withdrawId: raw.withdraw_id,
    transactionId: raw.transaction_id,
    receiveAmount: raw.receive_amount,
    receiveAmountCoin: raw.receive_amount_coin,
    feeToApply: raw.fee_to_apply,
    amount: raw.amount,
    coin: raw.coin,
  };
}

export class WithdrawService {
  constructor(private readonly http: AxiosInstance) {}

  async list(params: WithdrawListParams = {}): Promise<WithdrawListResult & { meta?: any }> {
    const queryParams: Record<string, unknown> = {};
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.take !== undefined) queryParams.take = params.take;
    if (params.status) queryParams.status = params.status;
    if (params.paymentMethod) queryParams.payment_method = params.paymentMethod;
    if (params.includeTotal) queryParams.include_total = "true";

    const { data } = await this.http.get<any>("/withdraw", {
      params: queryParams,
    });
    return {
      result: data.result,
      data: Array.isArray(data.data) ? data.data.map(mapWithdraw) : [],
      ...(data.meta && { meta: data.meta }),
    };
  }

  async get(id: number | string): Promise<any> {
    if (!id) {
      throw new QvaPayValidationError("El ID es requerido", "id");
    }
    const { data } = await this.http.get<any>(`/withdraw/${id}`);
    return data;
  }

  async bankLookup(routing: string): Promise<BankLookupResult> {
    if (!routing?.trim()) {
      throw new QvaPayValidationError("El número de ruta es requerido", "routing");
    }
    const { data } = await this.http.get<BankLookupResult>("/withdraw/bank-lookup", {
      params: { routing },
    });
    return data;
  }

  async getCashZones(coin = "USDCASH"): Promise<CashZonesResult> {
    const { data } = await this.http.get<CashZonesResult>("/withdraw/cash-zones", {
      params: { coin },
    });
    return data;
  }

  async create(params: CreateWithdrawParams): Promise<CreateWithdrawResult> {
    if (params.amount < 1) {
      throw new QvaPayValidationError("El monto mínimo es 1 USD", "amount");
    }
    if (params.amount > 100_000) {
      throw new QvaPayValidationError(
        "El monto no puede exceder 100,000 USD",
        "amount",
      );
    }
    if (!params.payMethod?.trim()) {
      throw new QvaPayValidationError(
        "El método de pago es requerido",
        "payMethod",
      );
    }
    if (!params.details || Object.keys(params.details).length === 0) {
      throw new QvaPayValidationError("Los detalles son requeridos", "details");
    }

    const payload: Record<string, unknown> = {
      amount: params.amount,
      pay_method: params.payMethod,
      details: params.details,
    };

    if (params.pin) payload.pin = params.pin;
    if (params.note) payload.note = params.note;
    if (params.webhook) payload.webhook = params.webhook;
    if (params.idempotencyKey) payload.idempotency_key = params.idempotencyKey;
    if (params.destLabel) payload.dest_label = params.destLabel;
    if (params.compliance) payload.compliance = params.compliance;

    const { data } = await this.http.post<RawCreateWithdrawResult>(
      "/withdraw",
      payload,
    );
    return mapCreateWithdrawResult(data);
  }
}
