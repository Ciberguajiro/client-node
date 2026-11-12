import type { AxiosInstance } from "axios";
import { QvaPayValidationError } from "../errors";
import type {
  CreatePaymentLinkParams,
  PaymentLink,
} from "../types";

export class PaymentLinksService {
  constructor(private readonly http: AxiosInstance) {}

  async list(productId?: string): Promise<PaymentLink[]> {
    const { data } = await this.http.get<PaymentLink[]>("/user/payment-links", {
      params: productId ? { product_id: productId } : undefined,
    });
    return data;
  }

  async create(params: CreatePaymentLinkParams): Promise<PaymentLink> {
    if (!params.name?.trim()) {
      throw new QvaPayValidationError("El nombre es requerido", "name");
    }
    if (!params.product_id?.trim()) {
      throw new QvaPayValidationError("El product_id es requerido", "product_id");
    }
    if (params.amount <= 0) {
      throw new QvaPayValidationError("El monto debe ser mayor a 0", "amount");
    }
    const { data } = await this.http.post<PaymentLink>(
      "/user/payment-links",
      params,
    );
    return data;
  }

  async delete(id: string): Promise<string> {
    if (!id?.trim()) {
      throw new QvaPayValidationError("El ID es requerido", "id");
    }
    const { data } = await this.http.delete<{ message: string }>(
      "/user/payment-links",
      { data: { id } },
    );
    return data.message;
  }
}
