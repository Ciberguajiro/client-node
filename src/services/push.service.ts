import type { AxiosInstance } from "axios";
import { QvaPayValidationError } from "../errors";

export interface RegisterPushTokenParams {
  platform: "ios" | "android" | "web" | string;
  token: string;
  keys?: { p256dh: string; auth: string };
  device_id?: string;
  app_version?: string;
  os_version?: string;
  model?: string;
  locale?: string;
  timezone?: string;
  apns_environment?: "production" | "sandbox" | string;
}

export interface PushTokenResult {
  id: string;
  platform: string;
  status: string;
  created?: boolean;
}

export interface RevokePushTokenParams {
  token?: string;
  device_id?: string;
  all?: boolean;
}

export interface PushInboxItem {
  id: string;
  type: string;
  category: "transactional" | "p2p" | "promo" | string;
  title: string;
  body: string;
  deeplink: string | null;
  url: string | null;
  image: string | null;
  campaign_id: string | null;
  opened_at: string | null;
  created_at: string;
}

export interface PushInboxResult {
  items: PushInboxItem[];
  next_cursor: string | null;
}

export interface PushEventReportParams {
  did: string;
  event: "received" | "opened" | string;
}

/**
 * Servicio para gestión de notificaciones push de QvaPay.
 */
export class PushService {
  constructor(private readonly http: AxiosInstance) {}

  /**
   * Registra o actualiza el token push de un dispositivo o navegador (POST /push/tokens).
   */
  async registerToken(params: RegisterPushTokenParams): Promise<PushTokenResult> {
    if (!params.platform?.trim()) {
      throw new QvaPayValidationError("La plataforma es requerida", "platform");
    }
    if (!params.token?.trim()) {
      throw new QvaPayValidationError("El token push es requerido", "token");
    }

    const { data } = await this.http.post<PushTokenResult>("/push/tokens", params);
    return data;
  }

  /**
   * Revoca un token push registrado (DELETE /push/tokens).
   */
  async revokeToken(params: RevokePushTokenParams): Promise<{ revoked: number }> {
    const { data } = await this.http.delete<{ revoked: number }>("/push/tokens", {
      data: params,
    });
    return data;
  }

  /**
   * Lista los últimos avisos push del usuario en su bandeja (GET /push/inbox).
   */
  async getInbox(params: { cursor?: string; limit?: number } = {}): Promise<PushInboxResult> {
    const { data } = await this.http.get<PushInboxResult>("/push/inbox", {
      params,
    });
    return data;
  }

  /**
   * Reporta la recepción o apertura de una notificación push (POST /push/events).
   */
  async reportEvent(params: PushEventReportParams): Promise<{ ok: boolean; applied: boolean }> {
    if (!params.did?.trim()) {
      throw new QvaPayValidationError("El ID de entrega (did) es requerido", "did");
    }
    if (!params.event?.trim()) {
      throw new QvaPayValidationError("El tipo de evento es requerido", "event");
    }

    const { data } = await this.http.post<{ ok: boolean; applied: boolean }>("/push/events", params);
    return data;
  }
}
