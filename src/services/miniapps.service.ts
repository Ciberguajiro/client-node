import type { AxiosInstance } from "axios";
import { QvaPayValidationError } from "../errors";

export interface MiniApp {
  uuid: string;
  slug: string;
  name: string;
  tagline: string | null;
  icon: string | null;
  cover: string | null;
  entry_url: string;
  allowed_origins: string[];
  category: "shopping" | "games" | "finance" | "services" | "social" | "tools" | "other" | string;
  featured: boolean;
  scopes: string[];
  app_uuid: string | null;
  merchant: { name: string; logo: string | null };
  granted: boolean;
  granted_scopes: string[];
  preview: boolean;
}

export interface MiniAppGrant {
  slug: string;
  name: string;
  icon: string | null;
  scopes: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Servicio para consultar el catálogo de mini-apps móviles de QvaPay.
 */
export class MiniAppsService {
  constructor(private readonly http: AxiosInstance) {}

  /**
   * Obtiene el catálogo completo de mini-apps publicadas (GET /miniapps).
   * Requiere identificar la plataforma móvil en `clientPlatform` ('ios' o 'android').
   */
  async list(clientPlatform: "ios" | "android" = "android"): Promise<{ data: MiniApp[] }> {
    const { data } = await this.http.get<{ data: MiniApp[] }>("/miniapps", {
      headers: { "x-qvapay-client-platform": clientPlatform },
    });
    return data;
  }

  /**
   * Obtiene los datos de una mini-app específica por su slug (GET /miniapps/:slug).
   */
  async get(slug: string, clientPlatform: "ios" | "android" = "android"): Promise<{ data: MiniApp }> {
    if (!slug?.trim()) {
      throw new QvaPayValidationError("El slug es requerido", "slug");
    }
    const { data } = await this.http.get<{ data: MiniApp }>(`/miniapps/${slug}`, {
      headers: { "x-qvapay-client-platform": clientPlatform },
    });
    return data;
  }

  /**
   * Obtiene los accesos a identidad otorgados a mini-apps por el usuario (GET /miniapps/grants).
   */
  async getGrants(clientPlatform: "ios" | "android" = "android"): Promise<{ data: MiniAppGrant[] }> {
    const { data } = await this.http.get<{ data: MiniAppGrant[] }>("/miniapps/grants", {
      headers: { "x-qvapay-client-platform": clientPlatform },
    });
    return data;
  }

  /**
   * Revoca el acceso otorgado a una mini-app (DELETE /miniapps/grants/:slug).
   */
  async revokeGrant(slug: string, clientPlatform: "ios" | "android" = "android"): Promise<any> {
    if (!slug?.trim()) {
      throw new QvaPayValidationError("El slug es requerido", "slug");
    }
    const { data } = await this.http.delete<any>(`/miniapps/grants/${slug}`, {
      headers: { "x-qvapay-client-platform": clientPlatform },
    });
    return data;
  }
}
