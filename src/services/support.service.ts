import type { AxiosInstance } from "axios";
import { QvaPayValidationError } from "../errors";

export interface SupportTicketAuthor {
  id: string;
  name: string;
  lastname: string;
  username: string;
  image: string;
}

export interface SupportTicketReply {
  id: string;
  support_id: string;
  user_id: string;
  message: string;
  reply_type: string;
  created_at: string;
  updated_at: string;
  User?: SupportTicketAuthor;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  status: "open" | "pending" | "resolved" | "closed" | string;
  priority: "low" | "medium" | "high" | "urgent" | string;
  topic: string;
  subject: string;
  customer_name?: string;
  customer_email?: string;
  message: string;
  source: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  closed_at?: string | null;
  first_response_at?: string | null;
  last_response_at?: string | null;
  CreatedBy?: SupportTicketAuthor;
  Replies?: SupportTicketReply[];
  dynamic_fields?: Record<string, any>;
}

export interface SupportTicketsListParams {
  page?: number;
  take?: number;
  status?: "open" | "pending" | "resolved" | "closed" | string;
}

export interface SupportTicketsListResult {
  data: SupportTicket[];
  total: number;
  page: number;
  take: number;
  pages: number;
}

export interface CreateSupportTicketParams {
  topic: string;
  subject: string;
  message: string;
  dynamic_fields?: Record<string, any>;
}

/**
 * Servicio para gestión de tickets de soporte de QvaPay.
 */
export class SupportService {
  constructor(private readonly http: AxiosInstance) {}

  /**
   * Obtiene la lista de tickets de soporte del usuario autenticado (GET /user/support).
   */
  async list(params: SupportTicketsListParams = {}): Promise<SupportTicketsListResult> {
    const queryParams: Record<string, any> = {};
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.take !== undefined) queryParams.take = params.take;
    if (params.status !== undefined) queryParams.status = params.status;

    const { data } = await this.http.get<SupportTicketsListResult>("/user/support", {
      params: queryParams,
    });
    return data;
  }

  /**
   * Obtiene el detalle de un ticket de soporte por su ID numérico o ticket_number (GET /user/support/:id).
   */
  async get(id: string): Promise<SupportTicket> {
    if (!id?.trim()) {
      throw new QvaPayValidationError("El ID del ticket es requerido", "id");
    }
    const { data } = await this.http.get<SupportTicket>(`/user/support/${id}`);
    return data;
  }

  /**
   * Crea un nuevo ticket de soporte (POST /user/support).
   */
  async create(params: CreateSupportTicketParams): Promise<SupportTicket> {
    if (!params.topic?.trim()) {
      throw new QvaPayValidationError("El tema es requerido", "topic");
    }
    if (!params.subject?.trim()) {
      throw new QvaPayValidationError("El asunto es requerido", "subject");
    }
    if (!params.message?.trim()) {
      throw new QvaPayValidationError("El mensaje es requerido", "message");
    }

    const { data } = await this.http.post<SupportTicket>("/user/support", params);
    return data;
  }

  /**
   * Agrega una respuesta a un ticket de soporte abierto (POST /user/support/:id/reply).
   */
  async reply(id: string, message: string): Promise<SupportTicketReply> {
    if (!id?.trim()) {
      throw new QvaPayValidationError("El ID del ticket es requerido", "id");
    }
    if (!message?.trim()) {
      throw new QvaPayValidationError("El mensaje de respuesta es requerido", "message");
    }

    const { data } = await this.http.post<SupportTicketReply>(
      `/user/support/${id}/reply`,
      { message },
    );
    return data;
  }
}
