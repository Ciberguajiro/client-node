import type { AxiosInstance } from "axios";
import { QvaPayValidationError } from "../errors";
import type {
  AppInfo,
  InvoiceParamsV2,
  InvoiceResultV2,
  RawAppInfo,
  ModifyInvoiceParams,
  ChargeParams,
  ChargeResult,
  AuthorizePaymentsParams,
  AuthorizePaymentsResult,
  V2TransactionsListParams,
  V2TransactionsListResult,
  V2TransactionDetailResult,
  V2Transaction,
} from "../types";

export function mapAppInfo(raw: RawAppInfo): AppInfo {
  return {
    uuid: raw.uuid,
    name: raw.name,
    url: raw.url,
    desc: raw.desc,
    logo: raw.logo,
    active: raw.active,
    userId: raw.user_id,
  };
}

export class AppService {
  constructor(private readonly http: AxiosInstance) {}

  async getInfo(): Promise<AppInfo> {
    const { data } = await this.http.post<RawAppInfo>("/v2/info");
    return mapAppInfo(data);
  }

  async getBalance(): Promise<number> {
    const { data } = await this.http.post<string>("/v2/balance");
    return parseFloat(data);
  }

  async createInvoice(params: InvoiceParamsV2): Promise<InvoiceResultV2> {
    if (params.amount <= 0) {
      throw new QvaPayValidationError("El monto debe ser mayor a 0", "amount");
    }
    if (params.amount > 100_000) {
      throw new QvaPayValidationError(
        "El monto no puede exceder 100,000",
        "amount",
      );
    }
    if (!params.description?.trim()) {
      throw new QvaPayValidationError("La descripción es requerida", "description");
    }
    if (params.description.length > 255) {
      throw new QvaPayValidationError(
        "La descripción debe tener 255 caracteres o menos",
        "description",
      );
    }
    if (!params.remote_id?.trim()) {
      throw new QvaPayValidationError("El remote_id es requerido", "remote_id");
    }
    if (params.remote_id.length > 255) {
      throw new QvaPayValidationError(
        "El remote_id debe tener 255 caracteres o menos",
        "remote_id",
      );
    }
    if (params.products) {
      for (let i = 0; i < params.products.length; i++) {
        const p = params.products[i];
        if (!p?.name?.trim()) {
          throw new QvaPayValidationError(
            `El nombre del producto en la posición ${i} es requerido`,
            `products[${i}].name`,
          );
        }
        if (p.price <= 0) {
          throw new QvaPayValidationError(
            `El precio del producto en la posición ${i} debe ser mayor a 0`,
            `products[${i}].price`,
          );
        }
        if (p.quantity !== undefined && p.quantity < 1) {
          throw new QvaPayValidationError(
            `La cantidad del producto en la posición ${i} debe ser al menos 1`,
            `products[${i}].quantity`,
          );
        }
      }
    }
    const { data } = await this.http.post<InvoiceResultV2>(
      "/v2/create_invoice",
      params,
    );
    return data;
  }

  async modifyInvoice(params: ModifyInvoiceParams): Promise<InvoiceResultV2> {
    if (!params.transaction_uuid?.trim()) {
      throw new QvaPayValidationError(
        "El transaction_uuid es requerido",
        "transaction_uuid",
      );
    }
    if (params.amount !== undefined && params.amount <= 0) {
      throw new QvaPayValidationError("El monto debe ser mayor a 0", "amount");
    }
    if (params.amount !== undefined && params.amount > 100_000) {
      throw new QvaPayValidationError(
        "El monto no puede exceder 100,000",
        "amount",
      );
    }
    if (params.description !== undefined && params.description.length > 255) {
      throw new QvaPayValidationError(
        "La descripción debe tener 255 caracteres o menos",
        "description",
      );
    }
    if (params.remote_id !== undefined && params.remote_id.length > 255) {
      throw new QvaPayValidationError(
        "El remote_id debe tener 255 caracteres o menos",
        "remote_id",
      );
    }
    const { data } = await this.http.post<InvoiceResultV2>(
      "/v2/modify_invoice",
      params,
    );
    return data;
  }

  async charge(params: ChargeParams): Promise<ChargeResult> {
    if (params.amount <= 0) {
      throw new QvaPayValidationError("El monto debe ser mayor a 0", "amount");
    }
    if (params.amount > 100_000) {
      throw new QvaPayValidationError(
        "El monto no puede exceder 100,000",
        "amount",
      );
    }
    if (!params.user_uuid?.trim()) {
      throw new QvaPayValidationError("El user_uuid es requerido", "user_uuid");
    }
    if (!params.description?.trim()) {
      throw new QvaPayValidationError("La descripción es requerida", "description");
    }
    if (!params.remote_id?.trim()) {
      throw new QvaPayValidationError("El remote_id es requerido", "remote_id");
    }
    const { data } = await this.http.post<ChargeResult>("/v2/charge", params);
    return data;
  }

  async authorizePayments(
    params: AuthorizePaymentsParams,
  ): Promise<AuthorizePaymentsResult> {
    if (!params.remote_id?.trim()) {
      throw new QvaPayValidationError("El remote_id es requerido", "remote_id");
    }
    if (!params.callback?.trim()) {
      throw new QvaPayValidationError("El callback es requerido", "callback");
    }
    const { data } = await this.http.post<AuthorizePaymentsResult>(
      "/v2/authorize_payments",
      params,
    );
    return data;
  }

  async listTransactions(
    params: V2TransactionsListParams = {},
  ): Promise<V2TransactionsListResult> {
    const page = params.page ?? 1;
    const take = params.take ?? 30;
    if (page < 1) {
      throw new QvaPayValidationError("La página debe ser mayor o igual a 1", "page");
    }
    if (take < 1 || take > 100) {
      throw new QvaPayValidationError(
        "La cantidad por página debe estar entre 1 y 100",
        "take",
      );
    }
    const { data } = await this.http.post<V2TransactionsListResult>(
      "/v2/transactions",
      { page, take },
    );
    return data;
  }

  async getTransaction(uuid: string): Promise<V2Transaction> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    const { data } = await this.http.post<V2TransactionDetailResult>(
      `/v2/transactions/${uuid}`,
    );
    return data.transaction;
  }
}
