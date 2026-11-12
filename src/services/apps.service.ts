import type { AxiosInstance } from "axios";
import type {
  AppDetail,
  RawAppDetail,
  CreateAppParams,
  CreateAppResult,
  UpdateAppParams,
  AppLog,
  AppLogsParams,
  AppLogsResult,
} from "../types";
import { QvaPayValidationError } from "../errors";

function mapAppDetail(raw: RawAppDetail): AppDetail {
  return {
    uuid: raw.uuid,
    name: raw.name,
    url: raw.url,
    logo: raw.logo,
    description: raw.description,
    callback: raw.callback,
    success_url: raw.success_url,
    cancel_url: raw.cancel_url,
    active: raw.active,
    enabled: raw.enabled,
    allowed_payment_auth: raw.allowed_payment_auth,
    card: raw.card,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

export class AppsService {
  constructor(private readonly userHttp: AxiosInstance) {}

  async list(): Promise<AppDetail[]> {
    const { data } = await this.userHttp.get<RawAppDetail[]>("/app");
    return data.map(mapAppDetail);
  }

  async create(params: CreateAppParams): Promise<CreateAppResult> {
    if (!params.name?.trim()) {
      throw new QvaPayValidationError("El nombre es requerido", "name");
    }
    if (!params.url?.trim()) {
      throw new QvaPayValidationError("La URL es requerida", "url");
    }
    if (!params.logo) {
      throw new QvaPayValidationError("El logo es requerido", "logo");
    }
    if (!params.desc?.trim()) {
      throw new QvaPayValidationError("La descripción es requerida", "desc");
    }
    if (!params.callback?.trim()) {
      throw new QvaPayValidationError("El callback es requerido", "callback");
    }
    if (!params.success_url?.trim()) {
      throw new QvaPayValidationError("La success_url es requerida", "success_url");
    }
    if (!params.cancel_url?.trim()) {
      throw new QvaPayValidationError("La cancel_url es requerida", "cancel_url");
    }

    const formData = new FormData();
    formData.append("name", params.name);
    formData.append("url", params.url);
    formData.append("logo", params.logo);
    formData.append("desc", params.desc);
    formData.append("callback", params.callback);
    formData.append("success_url", params.success_url);
    formData.append("cancel_url", params.cancel_url);

    const { data } = await this.userHttp.post<CreateAppResult>("/app/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }

  async get(uuid: string): Promise<AppDetail> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    const { data } = await this.userHttp.get<RawAppDetail>(`/app/${uuid}`);
    return mapAppDetail(data);
  }

  async update(uuid: string, params: UpdateAppParams): Promise<AppDetail> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    const { data } = await this.userHttp.patch<RawAppDetail>(
      `/app/${uuid}`,
      params,
    );
    return mapAppDetail(data);
  }

  async delete(uuid: string): Promise<string> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    const { data } = await this.userHttp.delete<{ result: string }>(`/app/${uuid}`);
    return data.result;
  }

  async getLogs(uuid: string, params: AppLogsParams = {}): Promise<AppLogsResult> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    const { data } = await this.userHttp.get<AppLogsResult>(`/app/${uuid}/logs`, {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 50,
        ...(params.type !== undefined && { type: params.type }),
      },
    });
    return data;
  }

  /**
   * Lista los botones de pago de una aplicación (GET /app/:uuid/pay-buttons).
   */
  async getPayButtons(uuid: string): Promise<any> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la app es requerido", "uuid");
    }
    const { data } = await this.userHttp.get<any>(`/app/${uuid}/pay-buttons`);
    return data;
  }

  /**
   * Crea un nuevo botón de pago para la aplicación (POST /app/:uuid/pay-buttons).
   */
  async createPayButton(
    uuid: string,
    params: { name: string; description?: string; amount: number },
  ): Promise<any> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la app es requerido", "uuid");
    }
    if (!params.name?.trim()) {
      throw new QvaPayValidationError("El nombre es requerido", "name");
    }
    if (params.amount <= 0) {
      throw new QvaPayValidationError("El monto debe ser mayor a 0", "amount");
    }
    const { data } = await this.userHttp.post<any>(
      `/app/${uuid}/pay-buttons`,
      params,
    );
    return data;
  }

  /**
   * Modifica un botón de pago de la aplicación (PATCH /app/:uuid/pay-buttons/:button).
   */
  async updatePayButton(
    uuid: string,
    buttonUuid: string,
    params: { name?: string; description?: string; amount?: number; active?: boolean },
  ): Promise<any> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la app es requerido", "uuid");
    }
    if (!buttonUuid?.trim()) {
      throw new QvaPayValidationError("El UUID del botón es requerido", "buttonUuid");
    }
    const { data } = await this.userHttp.patch<any>(
      `/app/${uuid}/pay-buttons/${buttonUuid}`,
      params,
    );
    return data;
  }

  /**
   * Consulta la conversación de revisión de una mini-app (GET /app/:uuid/miniapp).
   */
  async getMiniAppConversation(uuid: string): Promise<any> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la app es requerido", "uuid");
    }
    const { data } = await this.userHttp.get<any>(`/app/${uuid}/miniapp`);
    return data;
  }

  /**
   * Envía un mensaje en la conversación de revisión de la mini-app (POST /app/:uuid/miniapp/messages).
   */
  async sendMiniAppMessage(uuid: string, message: string): Promise<any> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la app es requerido", "uuid");
    }
    if (!message?.trim()) {
      throw new QvaPayValidationError("El mensaje es requerido", "message");
    }
    const { data } = await this.userHttp.post<any>(
      `/app/${uuid}/miniapp/messages`,
      { message },
    );
    return data;
  }
}
