import type { AxiosInstance } from "axios";
import { QvaPayValidationError } from "../errors";
import type {
  UserProfile,
  UpdateUserParams,
  UserSearchResult,
  KycResult,
  PaymentMethod,
  CreatePaymentMethodParams,
  PaymentAuth,
  NotificationSettings,
  UpdateNotificationParams,
  Contact,
  ContactsResult,
  CreateContactParams,
  ToggleFavoriteResult,
  TopUpParams,
  TopUpResult,
  UserExtendedProfile,
  RawUserExtendedProfile,
  AvatarUploadResult,
  GoldStatus,
  RawGoldStatus,
  BuyGoldParams,
  BuyGoldResult,
  ReferralsResult,
  RawReferralsResult,
} from "../types";

function mapExtendedProfile(raw: RawUserExtendedProfile): UserExtendedProfile {
  return {
    uuid: raw.uuid,
    username: raw.username,
    name: raw.name,
    lastname: raw.lastname,
    email: raw.email,
    bio: raw.bio,
    balance: raw.balance,
    phone: raw.phone,
    phoneVerified: raw.phone_verified,
    kyc: raw.kyc,
    goldenCheck: raw.golden_check,
    goldenExpire: raw.golden_expire,
    p2pEnabled: raw.p2p_enabled,
    twoFactorSecret: raw.two_factor_secret,
    p2pCompletedCount: raw.p2p_completed_count,
    p2pAverageRating: raw.p2p_average_rating,
    p2pRatersCount: raw.p2p_raters_count,
    withdraws: raw.withdraws.map((w) => ({
      amount: w.amount,
      status: w.status,
      paymentMethod: w.payment_method,
      txId: w.tx_id,
      createdAt: w.created_at,
      updatedAt: w.updated_at,
    })),
  };
}

function mapGoldStatus(raw: RawGoldStatus): GoldStatus {
  return {
    goldenCheck: raw.user.golden_check,
    goldenExpire: raw.user.golden_expire,
  };
}

function mapReferralsResult(raw: RawReferralsResult): ReferralsResult {
  return {
    referrals: raw.referrals.map((r) => ({
      uuid: r.uuid,
      username: r.username,
      name: r.name,
      lastname: r.lastname,
      kyc: r.kyc,
      goldenCheck: r.golden_check,
      image: r.image,
    })),
    totalReferrals: raw.totalReferrals,
  };
}

export class UserService {
  constructor(private readonly userHttp: AxiosInstance) {}

  async getProfile(): Promise<UserProfile> {
    const { data } = await this.userHttp.get<UserProfile>("/user");
    return data;
  }

  async getExtendedProfile(): Promise<UserExtendedProfile> {
    const { data } = await this.userHttp.get<RawUserExtendedProfile>(
      "/user/extended",
    );
    return mapExtendedProfile(data);
  }

  async updateProfile(params: UpdateUserParams): Promise<string> {
    const { data } = await this.userHttp.put<{ result: string }>(
      "/user/update",
      params,
    );
    return data.result;
  }

  async uploadAvatar(
    file: File | Blob,
    type: "avatar" | "cover",
  ): Promise<AvatarUploadResult> {
    if (!file) {
      throw new QvaPayValidationError("El archivo es requerido", "file");
    }
    if (type !== "avatar" && type !== "cover") {
      throw new QvaPayValidationError(
        "El tipo debe ser avatar o cover",
        "type",
      );
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const { data } = await this.userHttp.post<AvatarUploadResult>(
      "/user/avatar",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  }

  async searchUsers(query: string): Promise<UserSearchResult[]> {
    if (!query?.trim()) {
      throw new QvaPayValidationError("La búsqueda es requerida", "query");
    }
    const { data } = await this.userHttp.post<UserSearchResult[]>(
      "/user/search",
      { query },
    );
    return data;
  }

  async getKycStatus(): Promise<KycResult> {
    const { data } = await this.userHttp.get<KycResult>("/user/kyc");
    return data;
  }

  async requestKyc(): Promise<KycResult> {
    const { data } = await this.userHttp.post<KycResult>("/user/kyc");
    return data;
  }

  async getPaymentMethods(coin?: string): Promise<PaymentMethod[]> {
    const { data } = await this.userHttp.get<PaymentMethod[]>(
      "/user/payment-methods",
      { params: coin ? { coin } : undefined },
    );
    return data;
  }

  async createPaymentMethod(
    params: CreatePaymentMethodParams,
  ): Promise<PaymentMethod> {
    if (!params.coin?.trim()) {
      throw new QvaPayValidationError("La moneda es requerida", "coin");
    }
    if (!params.name?.trim()) {
      throw new QvaPayValidationError("El nombre es requerido", "name");
    }
    if (!params.details) {
      throw new QvaPayValidationError("Los detalles son requeridos", "details");
    }
    const { data } = await this.userHttp.post<PaymentMethod>(
      "/user/payment-methods",
      params,
    );
    return data;
  }

  async updatePaymentMethod(
    params: { id: string; name?: string; details?: Record<string, any> | string },
  ): Promise<PaymentMethod> {
    if (!params.id?.trim()) {
      throw new QvaPayValidationError("El ID es requerido", "id");
    }
    const { data } = await this.userHttp.patch<PaymentMethod>(
      "/user/payment-methods",
      params,
    );
    return data;
  }

  async getReferralLinks(program = "enterprise"): Promise<any> {
    const { data } = await this.userHttp.get<any>("/user/referral-links", {
      params: { program },
    });
    return data;
  }

  async createReferralLink(program = "enterprise"): Promise<any> {
    const { data } = await this.userHttp.post<any>("/user/referral-links", {
      program,
    });
    return data;
  }

  async getLightningAddress(page?: number): Promise<any> {
    const { data } = await this.userHttp.get<any>("/user/lightning-address", {
      params: page ? { page } : undefined,
    });
    return data;
  }

  async updateLightningAddress(params: {
    action: string;
    name?: string;
    receive_as?: string;
  }): Promise<any> {
    if (!params.action?.trim()) {
      throw new QvaPayValidationError("La acción es requerida", "action");
    }
    const { data } = await this.userHttp.post<any>(
      "/user/lightning-address",
      params,
    );
    return data;
  }

  async decodeLightning(invoice: string): Promise<any> {
    if (!invoice?.trim()) {
      throw new QvaPayValidationError("La factura es requerida", "invoice");
    }
    const { data } = await this.userHttp.post<any>("/lightning/decode", {
      invoice,
    });
    return data;
  }

  async getEmailChangeStatus(): Promise<any> {
    const { data } = await this.userHttp.get<any>("/user/update/email");
    return data;
  }

  async updateEmail(params: Record<string, any>): Promise<any> {
    const { data } = await this.userHttp.post<any>("/user/update/email", params);
    return data;
  }

  async verifyTelegram(): Promise<{ verificationLink: string }> {
    const { data } = await this.userHttp.get<{ verificationLink: string }>(
      "/user/verify/telegram",
    );
    return data;
  }

  async requestTelegramLink(code: string): Promise<{ verificationLink: string }> {
    if (!code?.trim()) {
      throw new QvaPayValidationError("El código es requerido", "code");
    }
    const { data } = await this.userHttp.post<{ verificationLink: string }>(
      "/user/verify/telegram",
      { code },
    );
    return data;
  }

  async unlinkTelegram(code?: string): Promise<any> {
    const { data } = await this.userHttp.put<any>(
      "/user/verify/telegram",
      code ? { code } : {},
    );
    return data;
  }

  async getCip(): Promise<any> {
    const { data } = await this.userHttp.get<any>("/user/cip");
    return data;
  }

  async verifyCpf(cpf: string): Promise<any> {
    if (!cpf?.trim()) {
      throw new QvaPayValidationError("El CPF es requerido", "cpf");
    }
    const { data } = await this.userHttp.post<any>("/user/cip/verify-cpf", {
      cpf,
    });
    return data;
  }

  async verifySsn(): Promise<any> {
    const { data } = await this.userHttp.post<any>("/user/cip/verify-ssn");
    return data;
  }

  async getDepositEligibility(channel?: string): Promise<any> {
    const { data } = await this.userHttp.get<any>("/user/deposit-eligibility", {
      headers: channel ? { "x-qvapay-client-platform": channel } : undefined,
    });
    return data;
  }

  async getCompanyApplications(): Promise<any> {
    const { data } = await this.userHttp.get<any>("/api/user/company");
    return data;
  }

  async applyCompany(formData: FormData | Record<string, any>): Promise<any> {
    const headers =
      typeof FormData !== "undefined" && formData instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : undefined;
    const { data } = await this.userHttp.post<any>(
      "/api/user/company",
      formData,
      { headers },
    );
    return data;
  }

  async deletePaymentMethod(id: string): Promise<string> {
    if (!id?.trim()) {
      throw new QvaPayValidationError("El ID es requerido", "id");
    }
    const { data } = await this.userHttp.delete<{ message: string }>(
      "/user/payment-methods",
      { data: { id } },
    );
    return data.message;
  }

  async getPaymentAuths(): Promise<PaymentAuth[]> {
    const { data } = await this.userHttp.get<PaymentAuth[]>(
      "/user/payment-auths",
    );
    return data;
  }

  async revokePaymentAuth(id: string): Promise<string> {
    if (!id?.trim()) {
      throw new QvaPayValidationError("El ID es requerido", "id");
    }
    const { data } = await this.userHttp.delete<{ message: string }>(
      "/user/payment-auths",
      { data: { id } },
    );
    return data.message;
  }

  async getNotifications(): Promise<NotificationSettings> {
    const { data } = await this.userHttp.get<NotificationSettings>(
      "/user/notifications",
    );
    return data;
  }

  async updateNotifications(
    params: UpdateNotificationParams,
  ): Promise<NotificationSettings> {
    const { data } = await this.userHttp.post<{
      message: string;
      settings: NotificationSettings;
    }>("/user/notifications", params);
    return data.settings;
  }

  async getContacts(favorite?: boolean): Promise<ContactsResult> {
    const { data } = await this.userHttp.get<ContactsResult>("/user/contact", {
      params: favorite ? { favorite: "true" } : undefined,
    });
    return data;
  }

  async createContact(params: CreateContactParams): Promise<string> {
    if (!params.contact_uuid?.trim()) {
      throw new QvaPayValidationError(
        "El contact_uuid es requerido",
        "contact_uuid",
      );
    }
    const { data } = await this.userHttp.post<{ message: string }>(
      "/user/contact",
      params,
    );
    return data.message;
  }

  async deleteContact(contactId: string): Promise<string> {
    if (!contactId?.trim()) {
      throw new QvaPayValidationError("El contact_id es requerido", "contactId");
    }
    const { data } = await this.userHttp.delete<{ message: string }>(
      "/user/contact",
      { data: { contact_id: contactId } },
    );
    return data.message;
  }

  async toggleFavorite(contactId: string): Promise<ToggleFavoriteResult> {
    if (!contactId?.trim()) {
      throw new QvaPayValidationError("El contact_id es requerido", "contactId");
    }
    const { data } = await this.userHttp.patch<ToggleFavoriteResult>(
      "/user/contact",
      { contact_id: contactId },
    );
    return data;
  }

  async getGoldStatus(): Promise<GoldStatus> {
    const { data } = await this.userHttp.get<RawGoldStatus>("/user/gold");
    return mapGoldStatus(data);
  }

  async buyGold(params: BuyGoldParams): Promise<BuyGoldResult> {
    if (!params.uuid?.trim()) {
      throw new QvaPayValidationError(
        "El UUID o username es requerido",
        "uuid",
      );
    }
    if (!params.duration || params.duration <= 0) {
      throw new QvaPayValidationError(
        "La duración debe ser mayor a 0",
        "duration",
      );
    }
    const { data } = await this.userHttp.post<BuyGoldResult>("/user/gold", {
      uuid: params.uuid,
      duration: params.duration,
    });
    return data;
  }

  async getReferrals(): Promise<ReferralsResult> {
    const { data } = await this.userHttp.get<RawReferralsResult>(
      "/user/referrals",
    );
    return mapReferralsResult(data);
  }

  async topUp(params: TopUpParams): Promise<TopUpResult> {
    if (params.amount <= 0) {
      throw new QvaPayValidationError("El monto debe ser mayor a 0", "amount");
    }
    if (params.amount > 100_000) {
      throw new QvaPayValidationError(
        "El monto no puede exceder 100,000",
        "amount",
      );
    }
    if (!params.pay_method?.trim()) {
      throw new QvaPayValidationError(
        "El método de pago es requerido",
        "pay_method",
      );
    }
    const { data } = await this.userHttp.post<TopUpResult>(
      "/api/topup",
      params,
    );
    return data;
  }
}
