import type { AxiosInstance } from "axios";
import { QvaPayValidationError } from "../errors";
import type { RawUser, TransferParams, TransferResult, User } from "../types";

/**
 * Mapper para convertir el usuario crudo de la API al modelo User.
 */
function mapUser(raw: RawUser): User {
  return {
    uuid: raw.uuid,
    name: raw.name,
    username: raw.username,
    email: raw.email,
    photo: raw.photo,
    balance: raw.balance,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/**
 * Servicio para gestionar la información del usuario autenticado.
 */
/**
 * Servicio para gestionar la información del usuario autenticado.
 * @deprecated GET /me y POST /transfer no existen en la API oficial actual.
 * Utiliza `qvapay.user.getProfile()` y `qvapay.transactions.transfer()` en su lugar.
 */
export class MeService {
  constructor(private readonly http: AxiosInstance) {}

  /**
   * Obtiene el perfil del usuario autenticado.
   * @deprecated Delega en `GET /user`
   */
  async getProfile(): Promise<User> {
    const { data } = await this.http.get<any>("/user");
    return mapUser(data);
  }

  /**
   * Realiza una transferencia de saldo a otro usuario.
   * @deprecated Delega en `POST /transaction/transfer`
   */
  async transfer(params: TransferParams): Promise<TransferResult> {
    if (params.amount <= 0) {
      throw new QvaPayValidationError("El monto debe ser mayor a 0", "amount");
    }
    if (!params.to?.trim()) {
      throw new QvaPayValidationError("El destinatario es requerido", "to");
    }
    if (!params.pin?.trim()) {
      throw new QvaPayValidationError("El PIN es requerido", "pin");
    }
    const { data } = await this.http.post<TransferResult>("/transaction/transfer", {
      amount: params.amount.toFixed(2),
      to: params.to,
      pin: params.pin,
      ...(params.description !== undefined && { description: params.description }),
    });
    return data;
  }
}
