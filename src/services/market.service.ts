import type { AxiosInstance } from "axios";
import { QvaPayValidationError } from "../errors";

export interface MarketShop {
  uuid: string;
  slug: string;
  name: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  country: string | null;
  status: "pending" | "active" | "suspended" | string;
  sales_count: number;
  rating_avg: number | null;
  created_at: string;
}

export interface CreateMarketShopParams {
  name: string;
  description?: string;
  country?: string;
  category?: string;
  logo?: string;
  banner?: string;
}

export interface UpdateMarketShopParams {
  name?: string;
  description?: string;
  country?: string;
  category?: string | null;
  logo?: string | null;
  banner?: string | null;
  shipping?: Record<string, any> | null;
}

export interface MarketProduct {
  uuid: string;
  slug: string;
  title: string;
  description?: string;
  kind: "physical" | "digital" | "service" | string;
  price: number;
  currency: string;
  stock: number | null;
  track_inventory: boolean;
  active: boolean;
  featured: boolean;
  sales_count: number;
  created_at: string;
  [key: string]: any;
}

export interface CreateMarketProductParams {
  shop_uuid: string;
  title: string;
  description?: string;
  kind?: "physical" | "digital" | "service";
  price: number;
  currency?: string;
  stock?: number | null;
  track_inventory?: boolean;
  digital_payload?: string;
  main_image?: string;
  images?: string[];
  category?: string;
  shop_category?: string | null;
  tags?: string[];
  sku?: string;
  ship_to?: Record<string, any> | null;
  active?: boolean;
}

export interface UpdateMarketProductParams {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  stock?: number | null;
  track_inventory?: boolean;
  digital_payload?: string;
  main_image?: string;
  images?: string[];
  category?: string;
  shop_category?: string | null;
  tags?: string[];
  sku?: string;
  ship_to?: Record<string, any> | null;
  active?: boolean;
}

export interface BulkMarketProductsParams {
  shop_uuid: string;
  products: Array<Record<string, any>>;
}

export interface MarketOrder {
  uuid: string;
  status: "paid" | "fulfilled" | "cancelled" | "refunded" | string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  gift_card_amount: number;
  total: number;
  tracking_code: string | null;
  note: string | null;
  delivered_at: string | null;
  created_at: string;
  product?: any;
  variant?: any;
  shop?: any;
}

export interface CreateMarketOrderParams {
  product_uuid: string;
  variant_uuid?: string;
  quantity?: number;
  shipping_address_id?: string;
  shipping_zone_id?: string;
  new_address?: Record<string, any>;
  note?: string;
  idempotency_key?: string;
  cart_key?: string;
  compliance?: Record<string, any>;
}

export interface UploadImageResult {
  url: string;
  key: string;
}

/**
 * Servicio para el Marketplace de vendedores de QvaPay.
 */
export class MarketService {
  constructor(private readonly http: AxiosInstance) {}

  // ─── Tiendas (Shops) ────────────────────────────────────────────────────────

  async listShops(params: { page?: number; take?: number } = {}): Promise<{ shops: MarketShop[]; total: number; page: number; take: number }> {
    const { data } = await this.http.get<{ shops: MarketShop[]; total: number; page: number; take: number }>("/market/shops", {
      params,
    });
    return data;
  }

  async getShop(uuid: string): Promise<{ shop: MarketShop }> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la tienda es requerido", "uuid");
    }
    const { data } = await this.http.get<{ shop: MarketShop }>(`/market/shops/${uuid}`);
    return data;
  }

  async createShop(params: CreateMarketShopParams): Promise<{ shop: MarketShop }> {
    if (!params.name?.trim()) {
      throw new QvaPayValidationError("El nombre de la tienda es requerido", "name");
    }
    const { data } = await this.http.post<{ shop: MarketShop }>("/market/shops", params);
    return data;
  }

  async updateShop(uuid: string, params: UpdateMarketShopParams): Promise<{ shop: MarketShop }> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la tienda es requerido", "uuid");
    }
    const { data } = await this.http.patch<{ shop: MarketShop }>(`/market/shops/${uuid}`, params);
    return data;
  }

  async deleteShop(uuid: string): Promise<{ success: boolean }> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la tienda es requerido", "uuid");
    }
    const { data } = await this.http.delete<{ success: boolean }>(`/market/shops/${uuid}`);
    return data;
  }

  // ─── Categorías de la Tienda ────────────────────────────────────────────────

  async getShopCategories(shopUuid: string): Promise<{ categories: any[] }> {
    if (!shopUuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la tienda es requerido", "shopUuid");
    }
    const { data } = await this.http.get<{ categories: any[] }>(`/market/shops/${shopUuid}/categories`);
    return data;
  }

  async createShopCategory(shopUuid: string, params: { name: string; parent_uuid?: string | null }): Promise<any> {
    if (!shopUuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la tienda es requerido", "shopUuid");
    }
    if (!params.name?.trim()) {
      throw new QvaPayValidationError("El nombre de la categoría es requerido", "name");
    }
    const { data } = await this.http.post<any>(`/market/shops/${shopUuid}/categories`, params);
    return data;
  }

  async reorderShopCategories(shopUuid: string, params: { parent_uuid?: string | null; order: string[] }): Promise<any> {
    if (!shopUuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la tienda es requerido", "shopUuid");
    }
    const { data } = await this.http.put<any>(`/market/shops/${shopUuid}/categories`, params);
    return data;
  }

  async updateShopCategory(shopUuid: string, categoryUuid: string, params: { name?: string; parent_uuid?: string | null }): Promise<any> {
    if (!shopUuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la tienda es requerido", "shopUuid");
    }
    if (!categoryUuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la categoría es requerido", "categoryUuid");
    }
    const { data } = await this.http.patch<any>(`/market/shops/${shopUuid}/categories/${categoryUuid}`, params);
    return data;
  }

  async deleteShopCategory(shopUuid: string, categoryUuid: string, toCategoryUuid?: string): Promise<any> {
    if (!shopUuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la tienda es requerido", "shopUuid");
    }
    if (!categoryUuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la categoría es requerido", "categoryUuid");
    }
    const { data } = await this.http.delete<any>(`/market/shops/${shopUuid}/categories/${categoryUuid}`, {
      params: toCategoryUuid ? { to: toCategoryUuid } : undefined,
    });
    return data;
  }

  // ─── Productos (Products) ───────────────────────────────────────────────────

  async listProducts(shopUuid: string, params: { page?: number; take?: number } = {}): Promise<{ products: MarketProduct[]; total: number; page: number; take: number }> {
    if (!shopUuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la tienda es requerido", "shopUuid");
    }
    const { data } = await this.http.get<{ products: MarketProduct[]; total: number; page: number; take: number }>("/market/products", {
      params: { shop: shopUuid, ...params },
    });
    return data;
  }

  async createProduct(params: CreateMarketProductParams): Promise<{ product: MarketProduct }> {
    if (!params.shop_uuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la tienda es requerido", "shop_uuid");
    }
    if (!params.title?.trim()) {
      throw new QvaPayValidationError("El título es requerido", "title");
    }
    if (params.price <= 0) {
      throw new QvaPayValidationError("El precio debe ser mayor a 0", "price");
    }
    const { data } = await this.http.post<{ product: MarketProduct }>("/market/products", params);
    return data;
  }

  async updateProduct(uuid: string, params: UpdateMarketProductParams): Promise<{ product: MarketProduct }> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID del producto es requerido", "uuid");
    }
    const { data } = await this.http.patch<{ product: MarketProduct }>(`/market/products/${uuid}`, params);
    return data;
  }

  async deleteProduct(uuid: string): Promise<{ success: boolean }> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID del producto es requerido", "uuid");
    }
    const { data } = await this.http.delete<{ success: boolean }>(`/market/products/${uuid}`);
    return data;
  }

  async createProductsBulk(params: BulkMarketProductsParams): Promise<any> {
    if (!params.shop_uuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la tienda es requerido", "shop_uuid");
    }
    if (!params.products || params.products.length === 0) {
      throw new QvaPayValidationError("Se requiere al menos un producto", "products");
    }
    const { data } = await this.http.post<any>("/market/products/bulk", params);
    return data;
  }

  async getProductVariants(productUuid: string): Promise<any> {
    if (!productUuid?.trim()) {
      throw new QvaPayValidationError("El UUID del producto es requerido", "productUuid");
    }
    const { data } = await this.http.get<any>(`/market/products/${productUuid}/variants`);
    return data;
  }

  async syncProductVariants(productUuid: string, params: { option_axes: string[]; variants: any[] }): Promise<any> {
    if (!productUuid?.trim()) {
      throw new QvaPayValidationError("El UUID del producto es requerido", "productUuid");
    }
    const { data } = await this.http.put<any>(`/market/products/${productUuid}/variants`, params);
    return data;
  }

  // ─── Vitrina Pública ────────────────────────────────────────────────────────

  async listStores(params: { category?: string; page?: number; take?: number } = {}): Promise<any> {
    const { data } = await this.http.get<any>("/market/stores", { params });
    return data;
  }

  async getStoreBySlug(slug: string): Promise<any> {
    if (!slug?.trim()) {
      throw new QvaPayValidationError("El slug de la tienda es requerido", "slug");
    }
    const { data } = await this.http.get<any>(`/market/stores/${slug}`);
    return data;
  }

  async getCatalog(params: Record<string, any> = {}): Promise<any> {
    const { data } = await this.http.get<any>("/market/catalog", { params });
    return data;
  }

  async getPublicProduct(uuid: string): Promise<any> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID del producto es requerido", "uuid");
    }
    const { data } = await this.http.get<any>(`/market/products/${uuid}`);
    return data;
  }

  // ─── Órdenes & Checkout ────────────────────────────────────────────────────

  async listOrders(params: { status?: string; page?: number; take?: number } = {}): Promise<{ orders: MarketOrder[]; total: number; page: number; take: number }> {
    const { data } = await this.http.get<{ orders: MarketOrder[]; total: number; page: number; take: number }>("/market/orders", {
      params,
    });
    return data;
  }

  async createOrder(params: CreateMarketOrderParams): Promise<any> {
    if (!params.product_uuid?.trim()) {
      throw new QvaPayValidationError("El UUID del producto es requerido", "product_uuid");
    }
    const { data } = await this.http.post<any>("/market/order", params);
    return data;
  }

  async updateOrder(uuid: string, params: { fulfill?: boolean; tracking_code?: string | null }): Promise<any> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la orden es requerido", "uuid");
    }
    const { data } = await this.http.patch<any>(`/market/orders/${uuid}`, params);
    return data;
  }

  async refundOrder(uuid: string): Promise<any> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la orden es requerido", "uuid");
    }
    const { data } = await this.http.post<any>(`/market/orders/${uuid}/refund`);
    return data;
  }

  async rateOrder(uuid: string, params: { rating: number; comment?: string; tags?: string[] }): Promise<any> {
    if (!uuid?.trim()) {
      throw new QvaPayValidationError("El UUID de la orden es requerido", "uuid");
    }
    if (params.rating < 1 || params.rating > 5) {
      throw new QvaPayValidationError("La calificación debe estar entre 1 y 5", "rating");
    }
    const { data } = await this.http.post<any>(`/market/orders/${uuid}/rate`, params);
    return data;
  }

  // ─── Subida de Imágenes ────────────────────────────────────────────────────

  async uploadImage(file: File | Blob, type: "logo" | "banner" | "product" = "product"): Promise<UploadImageResult> {
    if (!file) {
      throw new QvaPayValidationError("El archivo es requerido", "file");
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const { data } = await this.http.post<UploadImageResult>("/market/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }
}
