import type { AxiosInstance } from "axios";
import { QvaPayValidationError } from "../errors";

export interface SavingAccountData {
  hasAccount: boolean;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalEarned: number;
  currentRate: number;
  lastEarningDate: string | null;
  kycVerified: boolean;
  usRestricted: boolean;
  usDebtRepaymentMax: number;
  savings_roundup: boolean;
}

export interface SavingAccountResult {
  success: boolean;
  data: SavingAccountData;
}

export interface SavingTransaction {
  id: string;
  type: "deposit" | "withdraw" | "earning" | "admin_debit" | "roundup" | string;
  amount: number;
  balance_after?: number;
  created_at: string;
}

export interface SavingRoundupResult {
  success: boolean;
  savings_roundup: boolean;
}

/**
 * Servicio para gestión de la cuenta de ahorro de QvaPay.
 */
export class SavingService {
  constructor(private readonly http: AxiosInstance) {}

  /**
   * Consulta el estado y balance de la cuenta de ahorro (GET /saving).
   */
  async getAccount(): Promise<SavingAccountResult> {
    const { data } = await this.http.get<SavingAccountResult>("/saving");
    return data;
  }

  /**
   * Obtiene el historial de movimientos de la cuenta de ahorro (GET /saving/transactions).
   */
  async getTransactions(params: { page?: number; take?: number } = {}): Promise<any> {
    const { data } = await this.http.get<any>("/saving/transactions", {
      params,
    });
    return data;
  }

  /**
   * Deposita saldo en la cuenta de ahorro (POST /saving/deposit).
   */
  async deposit(amount: number): Promise<any> {
    if (amount <= 0) {
      throw new QvaPayValidationError("El monto debe ser mayor a 0", "amount");
    }
    const { data } = await this.http.post<any>("/saving/deposit", {
      amount,
    });
    return data;
  }

  /**
   * Retira saldo de la cuenta de ahorro (POST /saving/withdraw).
   */
  async withdraw(amount: number): Promise<any> {
    if (amount <= 0) {
      throw new QvaPayValidationError("El monto debe ser mayor a 0", "amount");
    }
    const { data } = await this.http.post<any>("/saving/withdraw", {
      amount,
    });
    return data;
  }

  /**
   * Activa o desactiva el redondeo automático a la cuenta de ahorro (POST /saving/roundup).
   */
  async setRoundup(enabled: boolean): Promise<SavingRoundupResult> {
    const { data } = await this.http.post<SavingRoundupResult>("/saving/roundup", {
      enabled,
    });
    return data;
  }
}
