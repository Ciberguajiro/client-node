import type { AxiosInstance } from "axios";
import { QvaPayValidationError } from "../errors";
import type { CreateInvoiceParams, Invoice, RawInvoice } from "../types";

/**
 * Mapper para convertir la factura cruda de la API al modelo Invoice.
 */
function mapInvoice(raw: RawInvoice): Invoice {
  return {
    uuid: raw.uuid,
    amount: raw.amount,
    description: raw.description,
    remoteId: raw.remote_id,
    signedUrl: raw.signed_url,
    url: raw.url,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/**
 * Servicio para gestionar facturas de pago.
 */
/**
 * Servicio para gestionar facturas de pago v1.
 * @deprecated GET /create_invoice ha sido retirado. Usa `qvapay.app.createInvoice()` (POST /v2/create_invoice).
 */
export class InvoicesService {
  constructor(private readonly http: AxiosInstance) {}

  /**
   * Crea una nueva factura de pago.
   * @deprecated Delega en POST /v2/create_invoice. Usa `AppService.createInvoice()`.
   */
  async create(params: CreateInvoiceParams): Promise<Invoice> {
    if (params.amount <= 0) {
      throw new QvaPayValidationError("El monto debe ser mayor a 0", "amount");
    }
    if (!params.description?.trim()) {
      throw new QvaPayValidationError("La descripción es requerida", "description");
    }
    const { data } = await this.http.post<{
      transaction_uuid: string;
      amount: number;
      description: string;
      remote_id: string;
      url: string;
      expire_at: string;
    }>("/v2/create_invoice", {
      amount: params.amount,
      description: params.description,
      remote_id: params.remoteId ?? `inv_${Date.now()}`,
    });

    return {
      uuid: data.transaction_uuid,
      amount: data.amount.toFixed(2),
      description: data.description,
      remoteId: data.remote_id,
      signedUrl: null,
      url: data.url,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
