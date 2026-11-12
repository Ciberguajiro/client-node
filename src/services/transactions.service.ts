import type { AxiosInstance } from "axios";
import { QvaPayValidationError } from "../errors";
import type {
  PaginatedResponse,
  RawPaginatedResponse,
  RawTransaction,
  RawTransactionDetail,
  RawTransactionDetailResult,
  RawTransactionListWithTotal,
  Transaction,
  TransactionComment,
  TransactionCommentsResult,
  TransactionDetail,
  TransactionDetailResult,
  TransactionListParams,
  TransactionListWithTotal,
  TransactionStatusResult,
  TransferParams,
  TransferResult,
} from "../types";
import { mapPaginated } from "../utils";
import { mapAppInfo } from "./app.service";

export class TransactionsService {
  constructor(private readonly http: AxiosInstance) {}

  /**
   * Obtiene el listado de transacciones del usuario autenticado.
   * La ruta oficial documentada es GET /transaction.
   */
  async list(page = 1): Promise<Transaction[]> {
    if (page < 1) {
      throw new QvaPayValidationError("La página debe ser mayor o igual a 1", "page");
    }
    const { data } = await this.http.get<RawTransaction[]>("/transaction", {
      params: { page },
    });
    return data.map(mapTransaction);
  }

  async listUser(params: TransactionListParams = {}): Promise<Transaction[] | TransactionListWithTotal> {
    const take = params.take ?? 20;
    const page = params.page ?? 1;
    if (take < 1 || take > 30) {
      throw new QvaPayValidationError(
        "La cantidad por página debe estar entre 1 y 30",
        "take",
      );
    }
    if (page < 1) {
      throw new QvaPayValidationError("La página debe ser mayor o igual a 1", "page");
    }
    const queryParams: Record<string, unknown> = { take, page };
    if (params.status) queryParams.status = params.status;
    if (params.search) queryParams.search = params.search;
    if (params.query) queryParams.query = params.query;
    if (params.uuid) queryParams.uuid = params.uuid;
    if (params.userUuid) queryParams.user_uuid = params.userUuid;
    if (params.order) queryParams.order = params.order;
    if (params.orderBy) queryParams.orderBy = params.orderBy;
    if (params.minAmount !== undefined) queryParams.min_amount = params.minAmount;
    if (params.maxAmount !== undefined) queryParams.max_amount = params.maxAmount;
    if (params.dateFrom) queryParams.date_from = params.dateFrom;
    if (params.dateTo) queryParams.date_to = params.dateTo;
    if (params.includeTotal) queryParams.include_total = "true";
    if (params.includeTotal) {
      const { data } = await this.http.get<RawTransactionListWithTotal>(
        "/transaction",
        { params: queryParams },
      );
      return {
        transactions: data.transactions.map(mapTransaction),
        total: data.total,
      };
    }
    const { data } = await this.http.get<RawTransaction[]>("/transaction", {
      params: queryParams,
    });
    return data.map(mapTransaction);
  }

  async get(uuid: string): Promise<Transaction> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    const { data } = await this.http.get<RawTransaction>(
      `/transaction/${uuid}`,
    );
    return mapTransaction(data);
  }

  async getDetail(uuid: string): Promise<TransactionDetailResult> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    const { data } = await this.http.get<RawTransactionDetailResult>(
      `/transaction/${uuid}`,
    );
    return {
      message: data.message,
      data: mapTransactionDetail(data.data),
    };
  }

  async transfer(props: TransferParams): Promise<TransferResult> {
    if (props.amount <= 0) {
      throw new QvaPayValidationError("El monto debe ser mayor a 0", "amount");
    }
    if (!props.to?.trim()) {
      throw new QvaPayValidationError("El destinatario es requerido", "to");
    }
    if (!props.pin?.trim()) {
      throw new QvaPayValidationError("El PIN es requerido", "pin");
    }
    const { data } = await this.http.post<TransferResult>(
      `/transaction/transfer`,
      {
        amount: props.amount.toFixed(2),
        to: props.to,
        pin: props.pin,
        ...(props.description !== undefined && { description: props.description }),
      },
    );
    return data;
  }

  async pay(id: string, comment?: string): Promise<string> {
    if (!id?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "id");
    }
    const body = comment ? { comment } : undefined;
    const { data } = await this.http.post<{ message: string; transaction: string }>(
      `/transaction/${id}/pay`,
      body,
    );
    return data.transaction;
  }

  async downloadPdf(uuid: string): Promise<Blob> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    const { data } = await this.http.get<Blob>(`/transaction/${uuid}/pdf`, {
      responseType: "blob",
    });
    return data;
  }

  /**
   * Obtiene los comentarios de una transacción (GET /transaction/:uuid/comments).
   */
  async getComments(uuid: string): Promise<TransactionCommentsResult> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    const { data } = await this.http.get<TransactionCommentsResult>(
      `/transaction/${uuid}/comments`,
    );
    return data;
  }

  /**
   * Publica un comentario en una transacción (POST /transaction/:uuid/comments).
   */
  async createComment(uuid: string, body: string): Promise<{ data: TransactionComment }> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    if (!body?.trim()) {
      throw new QvaPayValidationError("El contenido del comentario es requerido", "body");
    }
    if (body.length > 600) {
      throw new QvaPayValidationError("El comentario no puede exceder 600 caracteres", "body");
    }
    const { data } = await this.http.post<{ data: TransactionComment }>(
      `/transaction/${uuid}/comments`,
      { body },
    );
    return data;
  }

  /**
   * Elimina un comentario propio de una transacción (DELETE /transaction/:uuid/comments/:comment).
   */
  async deleteComment(uuid: string, commentId: string): Promise<{ data: { uuid: string; deleted: boolean } }> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID de transacción es requerido", "uuid");
    }
    if (!commentId?.trim()) {
      throw new QvaPayValidationError("El ID del comentario es requerido", "commentId");
    }
    const { data } = await this.http.delete<{ data: { uuid: string; deleted: boolean } }>(
      `/transaction/${uuid}/comments/${commentId}`,
    );
    return data;
  }

  /**
   * Consulta ligera del estado de una transacción propia (GET /api/transaction/:uuid/status).
   */
  async getStatus(uuid: string): Promise<TransactionStatusResult> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    const { data } = await this.http.get<TransactionStatusResult>(
      `/api/transaction/${uuid}/status`,
    );
    return data;
  }
}

function mapTransaction(raw: RawTransaction): Transaction {
  return {
    uuid: raw.uuid,
    amount: raw.amount,
    currency: raw.currency,
    status: raw.status,
    description: raw.description,
    remoteId: raw.remote_id,
    paidAt: raw.paid_at,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    app: mapAppInfo(raw.app),
  };
}

function mapTransactionDetailUser(raw: RawTransactionDetail["user"]): TransactionDetail["user"] {
  if (!raw) return null;
  return {
    uuid: raw.uuid,
    name: raw.name,
    lastname: raw.lastname,
    username: raw.username,
    image: raw.image,
    vip: raw.vip,
    kyc: raw.kyc,
    goldenCheck: raw.golden_check,
  };
}

function mapTransactionDetail(raw: RawTransactionDetail): TransactionDetail {
  return {
    uuid: raw.uuid,
    amount: raw.amount,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    status: raw.status,
    description: raw.description,
    remoteId: raw.remote_id,
    user: mapTransactionDetailUser(raw.user),
    paidBy: mapTransactionDetailUser(raw.paid_by),
    app: raw.app
      ? {
          uuid: raw.app.uuid,
          name: raw.app.name,
          url: raw.app.url,
          logo: raw.app.logo,
          desc: raw.app.desc,
        }
      : null,
    wallet: raw.wallet
      ? {
          walletType: raw.wallet.wallet_type,
          wallet: raw.wallet.wallet,
          value: raw.wallet.value,
          received: raw.wallet.received,
          txid: raw.wallet.txid,
          status: raw.wallet.status,
          createdAt: raw.wallet.created_at,
          coin: raw.wallet.coin,
        }
      : null,
    p2p: raw.p2p
      ? {
          uuid: raw.p2p.uuid,
          type: raw.p2p.type,
          amount: raw.p2p.amount,
          receive: raw.p2p.receive,
          status: raw.p2p.status,
          createdAt: raw.p2p.created_at,
          coin: raw.p2p.coin,
          user: mapTransactionDetailUser(raw.p2p.user)!,
          peer: mapTransactionDetailUser(raw.p2p.peer)!,
        }
      : null,
    withdraw: raw.withdraw
      ? {
          amount: raw.withdraw.amount,
          receive: raw.withdraw.receive,
          paymentMethod: raw.withdraw.payment_method,
          status: raw.withdraw.status,
          txId: raw.withdraw.tx_id,
          evidenceUrl: raw.withdraw.evidence_url,
          createdAt: raw.withdraw.created_at,
          coin: raw.withdraw.coin,
        }
      : null,
    service: raw.service
      ? {
          amount: raw.service.amount,
          status: raw.service.status,
          createdAt: raw.service.created_at,
          service: raw.service.service,
        }
      : null,
  };
}
