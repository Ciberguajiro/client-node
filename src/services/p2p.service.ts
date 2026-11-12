import type { AxiosInstance } from "axios";
import { QvaPayValidationError } from "../errors";
import { DEFAULT_BASE_URL } from "../utils";
import type {
  CreateP2PParams,
  P2PCoin,
  P2POffer,
  P2PUser,
  RawP2PCoin,
  RawP2POffer,
  RawP2PUser,
  P2PListParams,
  P2PDetailResult,
  EditP2PParams,
  ApplyP2PResult,
  CancelP2PResult,
  PaidP2PParams,
  ReceivedP2PResult,
  RateP2PParams,
  RateP2PResult,
  P2PChatMessage,
  P2PChatResult,
  P2PAverage,
  P2PCompletedPairsAverage,
  P2PAttachment,
  P2PAttachmentsResult,
  P2PPromoResult,
  P2PPromoCreateParams,
  P2PFeedSubscriptionResult,
  RawP2PAverage,
} from "../types";

function mapP2PUser(raw: RawP2PUser): P2PUser {
  return {
    uuid: raw.uuid,
    username: raw.username,
    name: raw.name,
    image: raw.image,
    kyc: raw.kyc,
    vip: raw.vip,
    goldenCheck: raw.golden_check,
  };
}

function mapP2PCoin(raw: RawP2PCoin): P2PCoin {
  return { tick: raw.tick, name: raw.name, logo: raw.logo };
}

function mapP2POffer(raw: RawP2POffer): P2POffer {
  return {
    uuid: raw.uuid,
    type: raw.type_1,
    coin: raw.coin,
    amount: raw.amount,
    receive: raw.receive,
    status: raw.status,
    onlyKyc: raw.only_kyc,
    onlyVip: raw.only_vip,
    isPrivate: raw.private,
    message: raw.message,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    user: mapP2PUser(raw.User),
    coinInfo: mapP2PCoin(raw.Coin),
  };
}

export class P2PService {
  constructor(private readonly http: AxiosInstance) {}

  async list(params: P2PListParams = {}) {
    const page = params.page ?? 1;
    const take = params.take ?? 20;
    if (page < 1) {
      throw new QvaPayValidationError("La página debe ser mayor o igual a 1", "page");
    }
    if (take < 1) {
      throw new QvaPayValidationError("La cantidad por página debe ser mayor a 0", "take");
    }
    const { data } = await this.http.get<{ offers: RawP2POffer[] }>("/p2p", {
      params: {
        page,
        take,
        ...(params.type !== undefined && { type: params.type }),
        ...(params.coin !== undefined && { coin: params.coin }),
        ...(params.orderBy !== undefined && { orderBy: params.orderBy }),
        ...(params.orderType !== undefined && { orderType: params.orderType }),
        ...(params.my !== undefined && { my: params.my }),
        ...(params.peer !== undefined && { peer: params.peer }),
        ...(params.sortByStatus !== undefined && { sortByStatus: params.sortByStatus }),
        ...(params.min !== undefined && { min: params.min }),
        ...(params.max !== undefined && { max: params.max }),
        ...(params.search !== undefined && { search: params.search }),
        ...(params.status !== undefined && { status: params.status }),
      },
    });
    return { offers: data.offers.map(mapP2POffer) };
  }

  async get(uuid: string): Promise<P2PDetailResult> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    const { data } = await this.http.get<P2PDetailResult>(`/p2p/${uuid}`);
    return data;
  }

  async create(params: CreateP2PParams): Promise<P2POffer> {
    if (params.amount <= 0) {
      throw new QvaPayValidationError("El monto debe ser mayor a 0", "amount");
    }
    if (params.amount > 100_000) {
      throw new QvaPayValidationError(
        "El monto no puede exceder 100,000 QUSD",
        "amount",
      );
    }
    if (params.receive <= 0) {
      throw new QvaPayValidationError(
        "El monto a recibir debe ser mayor a 0",
        "receive",
      );
    }
    if (params.receive > 1_000_000) {
      throw new QvaPayValidationError(
        "El monto a recibir no puede exceder 1,000,000",
        "receive",
      );
    }
    if (!params.coin?.trim()) {
      throw new QvaPayValidationError("La moneda es requerida", "coin");
    }
    if (!params.details || params.details.length === 0) {
      throw new QvaPayValidationError("Los detalles del pago son requeridos", "details");
    }
    if (params.message && params.message.length > 79) {
      throw new QvaPayValidationError(
        "El mensaje debe tener 79 caracteres o menos",
        "message",
      );
    }
    if (params.tags && params.tags.length > 10) {
      throw new QvaPayValidationError(
        "No se permiten más de 10 etiquetas",
        "tags",
      );
    }
    const { data } = await this.http.post<{ msg: string; p2p: RawP2POffer }>(
      "/p2p/create",
      {
        type: params.type,
        coin: params.coin,
        amount: params.amount,
        receive: params.receive,
        details: params.details,
        only_kyc: params.onlyKyc ? 1 : 0,
        only_vip: params.onlyVip ? 1 : 0,
        private: params.isPrivate ? 1 : 0,
        ...(params.message !== undefined && { message: params.message }),
        ...(params.webhook !== undefined && { webhook: params.webhook }),
        ...(params.tags !== undefined && { tags: params.tags }),
      },
    );
    return mapP2POffer(data.p2p);
  }

  async edit(uuid: string, params: EditP2PParams): Promise<P2POffer> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    if (params.amount !== undefined && params.amount <= 0) {
      throw new QvaPayValidationError("El monto debe ser mayor a 0", "amount");
    }
    if (params.amount !== undefined && params.amount > 100_000) {
      throw new QvaPayValidationError(
        "El monto no puede exceder 100,000 QUSD",
        "amount",
      );
    }
    if (params.receive !== undefined && params.receive <= 0) {
      throw new QvaPayValidationError(
        "El monto a recibir debe ser mayor a 0",
        "receive",
      );
    }
    if (params.receive !== undefined && params.receive > 1_000_000) {
      throw new QvaPayValidationError(
        "El monto a recibir no puede exceder 1,000,000",
        "receive",
      );
    }
    if (params.message !== undefined && params.message.length > 79) {
      throw new QvaPayValidationError(
        "El mensaje debe tener 79 caracteres o menos",
        "message",
      );
    }
    if (params.tags !== undefined && params.tags.length > 10) {
      throw new QvaPayValidationError(
        "No se permiten más de 10 etiquetas",
        "tags",
      );
    }
    const { data } = await this.http.post<{ msg: string; p2p: RawP2POffer }>(
      `/p2p/${uuid}/edit`,
      params,
    );
    return mapP2POffer(data.p2p);
  }

  async apply(uuid: string): Promise<ApplyP2PResult> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    const { data } = await this.http.post<ApplyP2PResult>(`/p2p/${uuid}/apply`);
    return data;
  }

  async cancel(uuid: string): Promise<CancelP2PResult> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    const { data } = await this.http.post<CancelP2PResult>(`/p2p/${uuid}/cancel`);
    return data;
  }

  async paid(uuid: string, params: PaidP2PParams): Promise<string> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    if (!params.tx_id?.trim()) {
      throw new QvaPayValidationError("El tx_id es requerido", "tx_id");
    }
    const { data } = await this.http.post<{ message: string }>(
      `/p2p/${uuid}/paid`,
      { tx_id: params.tx_id },
    );
    return data.message;
  }

  async received(uuid: string): Promise<ReceivedP2PResult> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    const { data } = await this.http.post<ReceivedP2PResult>(
      `/p2p/${uuid}/received`,
    );
    return data;
  }

  async rate(uuid: string, params: RateP2PParams): Promise<RateP2PResult> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    if (params.rating < 1 || params.rating > 5) {
      throw new QvaPayValidationError(
        "El rating debe estar entre 1 y 5",
        "rating",
      );
    }
    if (params.comment && params.comment.length > 120) {
      throw new QvaPayValidationError(
        "El comentario debe tener 120 caracteres o menos",
        "comment",
      );
    }
    const { data } = await this.http.post<RateP2PResult>(
      `/p2p/${uuid}/rate`,
      {
        rating: params.rating,
        ...(params.comment !== undefined && { comment: params.comment }),
        ...(params.tags !== undefined && { tags: params.tags }),
      },
    );
    return data;
  }

  async getChat(uuid: string): Promise<P2PChatResult> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    const { data } = await this.http.get<P2PChatResult>(`/p2p/${uuid}/chat`);
    return data;
  }

  async sendChatMessage(uuid: string, message: string): Promise<string> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    if (!message?.trim()) {
      throw new QvaPayValidationError("El mensaje es requerido", "message");
    }
    if (message.length > 599) {
      throw new QvaPayValidationError(
        "El mensaje debe tener 599 caracteres o menos",
        "message",
      );
    }
    const { data } = await this.http.post<{ message: string }>(
      `/p2p/${uuid}/chat`,
      { message },
    );
    return data.message;
  }

  async getAverages(): Promise<Record<string, P2PAverage>> {
    const { data } = await this.http.get<RawP2PAverage>("/p2p/averages");
    const result: Record<string, P2PAverage> = {};
    for (const [key, entry] of Object.entries(data)) {
      if (!entry) continue;
      result[key] = {
        name: entry.name,
        average: entry.average,
        average_buy: entry.average_buy,
        average_sell: entry.average_sell,
        count: entry.count,
        count_buy: entry.count_buy,
        count_sell: entry.count_sell,
        median: entry.median,
        median_buy: entry.median_buy,
        median_sell: entry.median_sell,
        window_hours: entry.window_hours,
        updated_at: entry.updated_at,
      };
    }
    return result;
  }

  async getCompletedPairsAverage(coin: string): Promise<P2PCompletedPairsAverage> {
    if (!coin?.trim()) {
      throw new QvaPayValidationError("La moneda es requerida", "coin");
    }
    const { data } = await this.http.get<P2PCompletedPairsAverage>(
      "/p2p/completed_pairs_average",
      { params: { coin } },
    );
    return data;
  }

  async getFeatured(): Promise<{ data: { promoted: any[]; offers: any[] } }> {
    const { data } = await this.http.get<{ data: { promoted: any[]; offers: any[] } }>(
      "/p2p/featured",
    );
    return data;
  }

  async getPromo(coin: string): Promise<P2PPromoResult> {
    if (!coin?.trim()) {
      throw new QvaPayValidationError("La moneda es requerida", "coin");
    }
    const { data } = await this.http.get<P2PPromoResult>("/p2p/promo", {
      params: { coin },
    });
    return data;
  }

  async createPromo(params: P2PPromoCreateParams): Promise<any> {
    if (!params.coin?.trim()) {
      throw new QvaPayValidationError("La moneda es requerida", "coin");
    }
    if (!params.idempotency_key?.trim()) {
      throw new QvaPayValidationError("La clave de idempotencia es requerida", "idempotency_key");
    }
    const { data } = await this.http.post<any>("/p2p/promo", params);
    return data;
  }

  async pause(uuid: string, paused: boolean): Promise<{ message: string; p2p: string; pause: any }> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    const { data } = await this.http.post<{ message: string; p2p: string; pause: any }>(
      `/p2p/${uuid}/pause`,
      { paused },
    );
    return data;
  }

  async updateRate(
    uuid: string,
    params: { rating?: number; comment?: string | null; tags?: string[] | null; order?: string },
  ): Promise<any> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    const { data } = await this.http.patch<any>(`/p2p/${uuid}/rate`, params);
    return data;
  }

  async getAttachments(uuid: string, order?: string): Promise<P2PAttachmentsResult> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    const { data } = await this.http.get<P2PAttachmentsResult>(
      `/p2p/${uuid}/attachments`,
      { params: order ? { order } : undefined },
    );
    return data;
  }

  async uploadAttachment(
    uuid: string,
    file: File | Blob,
    order?: string,
  ): Promise<{ attachment: P2PAttachment }> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    if (!file) {
      throw new QvaPayValidationError("El archivo es requerido", "file");
    }
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await this.http.post<{ attachment: P2PAttachment }>(
      `/p2p/${uuid}/attachments`,
      formData,
      {
        params: order ? { order } : undefined,
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return data;
  }

  async getAttachment(uuid: string, attachmentId: string, order?: string): Promise<Blob> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    if (!attachmentId?.trim()) {
      throw new QvaPayValidationError("El ID del archivo adjunto es requerido", "attachmentId");
    }
    const { data } = await this.http.get<Blob>(
      `/p2p/${uuid}/attachments/${attachmentId}`,
      {
        params: order ? { order } : undefined,
        responseType: "blob",
      },
    );
    return data;
  }

  async getFeedSubscription(): Promise<P2PFeedSubscriptionResult> {
    const { data } = await this.http.get<P2PFeedSubscriptionResult>("/v2/p2p/feed");
    return data;
  }

  async getFeedDeliveries(): Promise<any> {
    const { data } = await this.http.get<any>("/v2/p2p/feed/deliveries");
    return data;
  }

  /**
   * Helper SSE para stream del feed de mercado P2P.
   * Devuelve la URL completa y cabeceras recomendadas sin añadir dependencias extras.
   */
  getStreamUrlAndHeaders(baseUrl = DEFAULT_BASE_URL) {
    return {
      url: `${baseUrl.replace(/\/$/, "")}/v2/p2p/stream`,
      headers: {
        Accept: "text/event-stream",
      },
    };
  }

  /**
   * Helper SSE para stream del chat de un trato P2P.
   */
  getChatStreamUrlAndHeaders(uuid: string, order?: string, baseUrl = DEFAULT_BASE_URL) {
    const query = order ? `?order=${encodeURIComponent(order)}` : "";
    return {
      url: `${baseUrl.replace(/\/$/, "")}/p2p/${uuid}/chat/stream${query}`,
      headers: {
        Accept: "text/event-stream",
      },
    };
  }
}
