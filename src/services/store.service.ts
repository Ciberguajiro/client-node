import type { AxiosInstance } from "axios";
import { QvaPayValidationError } from "../errors";
import type {
  BuyPhonePackageParams,
  BuyPhonePackageResult,
  LatamTopupCatalogCountries,
  LatamTopupCatalogOffers,
  LatamTopupCatalogOperators,
  LatamTopupParams,
  LatamTopupPurchaseParams,
  LatamTopupPurchaseResult,
  LatamTopupResult,
  PhonePackage,
  PhonePackageDetail,
  PurchaseVoucherParams,
  PurchaseVoucherResult,
  RawBuyPhonePackageResult,
  RawPhonePackage,
  VoucherCatalogBrands,
  VoucherCatalogCountries,
  VoucherCatalogFeatured,
  VoucherCatalogOffers,
} from "../types";

function mapPhonePackage(raw: RawPhonePackage): PhonePackage {
  return {
    id: raw.id,
    name: raw.name,
    logo: raw.logo,
    details: raw.details.map(
      (d): PhonePackageDetail => ({ label: d.label, value: d.value }),
    ),
    price: raw.price,
    goldPrice: raw.gold_price,
    external: raw.external,
    externalAmount: raw.external_amount,
    period: raw.period,
  };
}

function mapBuyPhonePackageResult(
  raw: RawBuyPhonePackageResult,
): BuyPhonePackageResult {
  return {
    message: raw.message,
    transactionUuid: raw.transaction_uuid,
    buyedService: raw.buyedService,
  };
}

function mapLatamTopupPurchaseResult(raw: {
  message: string;
  transaction_uuid: string;
  buyedService_id: string;
}): LatamTopupPurchaseResult {
  return {
    message: raw.message,
    transaction_uuid: raw.transaction_uuid,
    buyedService_id: raw.buyedService_id,
  };
}

export class StoreService {
  constructor(private readonly http: AxiosInstance) {}

  /**
   * Obtiene la lista general de productos de la tienda (GET /store).
   */
  async list(): Promise<{ message: string; data: any[] }> {
    const { data } = await this.http.get<{ message: string; data: any[] }>("/store");
    return data;
  }

  /**
   * Obtiene las compras del usuario autenticado (GET /store/my).
   */
  async getMyPurchases(): Promise<{ message: string; data: any[] }> {
    const { data } = await this.http.get<{ message: string; data: any[] }>("/store/my");
    return data;
  }

  /**
   * Obtiene el detalle de una compra por su buyedService_id (GET /store/my/:id).
   */
  async getMyPurchase(id: number | string): Promise<{ message: string; data: any }> {
    if (!id) {
      throw new QvaPayValidationError("El ID de la compra es requerido", "id");
    }
    const { data } = await this.http.get<{ message: string; data: any }>(`/store/my/${id}`);
    return data;
  }

  /**
   * Consulta el catálogo de planes eSIM (GET /store/esim-catalog).
   */
  async getEsimCatalog(params?: { countries?: boolean; country?: string }): Promise<any> {
    const queryParams: Record<string, any> = {};
    if (params?.countries) queryParams.countries = "";
    if (params?.country) queryParams.country = params.country;
    const { data } = await this.http.get<any>("/store/esim-catalog", {
      params: queryParams,
    });
    return data;
  }

  /**
   * Compra un plan de datos eSIM (POST /store/esim/purchase).
   */
  async purchaseEsim(params: { offer_id: string; country: string }): Promise<any> {
    if (!params.offer_id?.trim()) {
      throw new QvaPayValidationError("El offer_id es requerido", "offer_id");
    }
    if (!params.country?.trim()) {
      throw new QvaPayValidationError("El país es requerido", "country");
    }
    const { data } = await this.http.post<any>("/store/esim/purchase", params);
    return data;
  }

  /**
   * Consulta la elegibilidad para pagos con PIX (GET /pix/eligibility).
   */
  async getPixEligibility(): Promise<any> {
    const { data } = await this.http.get<any>("/pix/eligibility");
    return data;
  }

  /**
   * Crea un checkout con código PIX (POST /pix/checkout).
   */
  async createPixCheckout(params: Record<string, any>): Promise<any> {
    if (!params.source?.trim()) {
      throw new QvaPayValidationError("El parámetro source es requerido", "source");
    }
    const { data } = await this.http.post<any>("/pix/checkout", params);
    return data;
  }

  /**
   * Consulta el estado de un cobro PIX (GET /pix/checkout/:uuid).
   */
  async getPixCheckout(uuid: string): Promise<any> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    const { data } = await this.http.get<any>(`/pix/checkout/${uuid}`);
    return data;
  }

  /**
   * Cancela un cobro PIX abierto (DELETE /pix/checkout/:uuid).
   */
  async cancelPixCheckout(uuid: string): Promise<any> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    const { data } = await this.http.delete<any>(`/pix/checkout/${uuid}`);
    return data;
  }

  async getPhonePackages(): Promise<PhonePackage[]> {
    const { data } = await this.http.get<{ phone_packages: RawPhonePackage[] }>(
      "/store/phone_package",
    );
    return data.phone_packages.map(mapPhonePackage);
  }

  async buyPhonePackage(
    params: BuyPhonePackageParams,
  ): Promise<BuyPhonePackageResult> {
    if (!params.phoneNumber?.trim()) {
      throw new QvaPayValidationError(
        "El número de teléfono es requerido",
        "phoneNumber",
      );
    }
    if (!params.phonePackageId) {
      throw new QvaPayValidationError(
        "El ID del paquete es requerido",
        "phonePackageId",
      );
    }
    const { data } = await this.http.post<RawBuyPhonePackageResult>(
      "/store/phone_package",
      {
        phone_package_id: params.phonePackageId,
        phone_number: params.phoneNumber,
      },
    );
    return mapBuyPhonePackageResult(data);
  }

  // ─── Voucher Catalog ───────────────────────────────────────────────────

  async getVoucherFeatured(): Promise<VoucherCatalogFeatured> {
    const { data } = await this.http.get<VoucherCatalogFeatured>(
      "/store/voucher-catalog",
      { params: { featured: true } },
    );
    return data;
  }

  async getVoucherCountries(): Promise<VoucherCatalogCountries> {
    const { data } = await this.http.get<VoucherCatalogCountries>(
      "/store/voucher-catalog",
      { params: { countries: true } },
    );
    return data;
  }

  async getVoucherBrands(
    country: string,
    query?: string,
  ): Promise<VoucherCatalogBrands> {
    if (!country?.trim()) {
      throw new QvaPayValidationError("El código de país es requerido", "country");
    }
    const { data } = await this.http.get<VoucherCatalogBrands>(
      "/store/voucher-catalog",
      { params: { country, ...(query && { q: query }) } },
    );
    return data;
  }

  async getVoucherOffers(
    country: string,
    brand: string,
  ): Promise<VoucherCatalogOffers> {
    if (!country?.trim()) {
      throw new QvaPayValidationError("El código de país es requerido", "country");
    }
    if (!brand?.trim()) {
      throw new QvaPayValidationError("El nombre de la marca es requerido", "brand");
    }
    const { data } = await this.http.get<VoucherCatalogOffers>(
      "/store/voucher-catalog",
      { params: { country, brand } },
    );
    return data;
  }

  async purchaseVoucher(
    params: PurchaseVoucherParams,
  ): Promise<PurchaseVoucherResult> {
    if (!params.offer_id?.trim()) {
      throw new QvaPayValidationError("El offer_id es requerido", "offer_id");
    }
    if (!params.country?.trim()) {
      throw new QvaPayValidationError("El país es requerido", "country");
    }
    if (!params.brand?.trim()) {
      throw new QvaPayValidationError("La marca es requerida", "brand");
    }
    const { data } = await this.http.post<PurchaseVoucherResult>(
      "/store/voucher/purchase",
      params,
    );
    return data;
  }

  // ─── LATAM Topup Catalog ───────────────────────────────────────────────

  async getLatamTopupCountries(): Promise<LatamTopupCatalogCountries> {
    const { data } = await this.http.get<LatamTopupCatalogCountries>(
      "/store/topup-catalog",
      { params: { countries: true } },
    );
    return data;
  }

  async getLatamTopupOperators(
    country: string,
  ): Promise<LatamTopupCatalogOperators> {
    if (!country?.trim()) {
      throw new QvaPayValidationError("El código de país es requerido", "country");
    }
    const { data } = await this.http.get<LatamTopupCatalogOperators>(
      "/store/topup-catalog",
      { params: { country } },
    );
    return data;
  }

  async getLatamTopupOffers(
    country: string,
    brand: string,
  ): Promise<LatamTopupCatalogOffers> {
    if (!country?.trim()) {
      throw new QvaPayValidationError("El código de país es requerido", "country");
    }
    if (!brand?.trim()) {
      throw new QvaPayValidationError("El nombre del operador es requerido", "brand");
    }
    const { data } = await this.http.get<LatamTopupCatalogOffers>(
      "/store/topup-catalog",
      { params: { country, brand } },
    );
    return data;
  }

  async getLatamTopup(params: LatamTopupParams): Promise<LatamTopupResult> {
    if (!params.country?.trim()) {
      throw new QvaPayValidationError("El país es requerido", "country");
    }
    const { data } = await this.http.get<LatamTopupResult>("/store/topup", {
      params: {
        country: params.country,
        ...(params.brand && { brand: params.brand }),
      },
    });
    return data;
  }

  async purchaseLatamTopup(
    params: LatamTopupPurchaseParams,
  ): Promise<LatamTopupPurchaseResult> {
    if (!params.offer_id?.trim()) {
      throw new QvaPayValidationError("El offer_id es requerido", "offer_id");
    }
    if (!params.phone_number?.trim()) {
      throw new QvaPayValidationError(
        "El número de teléfono es requerido",
        "phone_number",
      );
    }
    if (!params.country?.trim()) {
      throw new QvaPayValidationError("El país es requerido", "country");
    }
    const { data } = await this.http.post<{
      message: string;
      transaction_uuid: string;
      buyedService_id: string;
    }>("/store/topup", params);
    return mapLatamTopupPurchaseResult(data);
  }
}
