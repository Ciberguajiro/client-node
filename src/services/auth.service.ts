import type { AxiosInstance } from "axios";
import { QvaPayValidationError } from "../errors";
import type {
  AuthResponse,
  LoginParams,
  LoginResult,
  RawAuthResponse,
  RawUser,
  RegisterConfirmationParams,
  RegisterParams,
  RegisterResult,
  AuthSessionResponse,
  User,
  Create2faResult,
  Check2faParams,
  Reset2faParams,
  ConfirmReset2faParams,
  RequestResetPasswordParams,
  ConfirmResetPasswordParams,
} from "../types";

export class AuthService {
  constructor(
    private readonly plainHttp: AxiosInstance,
    private readonly userHttp: AxiosInstance,
    private readonly onLogin: (token: string) => void,
  ) {}

  /**
   * Inicia sesión en QvaPay.
   * Si las credenciales son válidas pero se requiere 2FA, retorna un 202 con `twoFactorRequired: true`.
   * Si el login es exitoso (200), guarda el token Bearer en el SDK y retorna los datos del usuario.
   */
  async login(params: LoginParams): Promise<LoginResult> {
    if (!params.email?.trim()) {
      throw new QvaPayValidationError("El correo es requerido", "email");
    }
    if (!params.password) {
      throw new QvaPayValidationError("La contraseña es requerida", "password");
    }
    const payload: Record<string, unknown> = {
      email: params.email,
      password: params.password,
    };
    if (params.remember !== undefined) payload.remember = params.remember;
    if (params.twoFactorCode !== undefined) {
      payload.two_factor_code = params.twoFactorCode;
    }

    const response = await this.plainHttp.post<any>("/auth/login", payload);

    if (response.status === 202 || (response.data && response.data.has_otp !== undefined)) {
      return {
        twoFactorRequired: true,
        info: response.data.info ?? "Código 2FA requerido",
        notified: !!response.data.notified,
        hasOtp: !!response.data.has_otp,
      };
    }

    const data = response.data;
    const token = data.accessToken ?? data.token;
    const rawMe = data.me ?? data.user;
    const result = {
      twoFactorRequired: false as const,
      token,
      tokenType: data.token_type ?? "Bearer",
      user: mapUser(rawMe),
      securityWarning: data.security_warning ?? null,
    };

    if (result.token) {
      this.onLogin(result.token);
    }
    return result;
  }

  /**
   * Registra un nuevo usuario en QvaPay.
   */
  async register(params: RegisterParams): Promise<RegisterResult> {
    if (!params.name?.trim()) {
      throw new QvaPayValidationError("El nombre es requerido", "name");
    }
    if (!params.email?.trim()) {
      throw new QvaPayValidationError("El correo es requerido", "email");
    }
    if (!params.password) {
      throw new QvaPayValidationError("La contraseña es requerida", "password");
    }

    const payload: Record<string, unknown> = {
      name: params.name,
      email: params.email,
      password: params.password,
    };

    if (params.lastname !== undefined) payload.lastname = params.lastname;
    if (params.invite !== undefined) payload.invite = params.invite;
    if (params.terms !== undefined) payload.terms = params.terms;
    if (params.passwordConfirmation !== undefined) {
      payload.password_confirmation = params.passwordConfirmation;
    }
    if (params.username !== undefined) payload.username = params.username;
    if (params.phone !== undefined) payload.phone = params.phone;

    const { data } = await this.plainHttp.post<{
      message: string;
      user: {
        uuid: string;
        email: string;
        name: string;
        username: string;
      };
    }>("/auth/register", payload);

    return data;
  }

  /**
   * Cierra la sesión actual del usuario.
   */
  async logout(): Promise<void> {
    await this.userHttp.post("/auth/logout");
  }

  /**
   * Cierra todas las sesiones del usuario en todos los dispositivos.
   */
  async logoutAll(): Promise<string> {
    const { data } = await this.userHttp.delete<{ message: string }>("/auth/logout");
    return data.message;
  }

  /**
   * Confirma el registro del usuario mediante el PIN enviado por correo.
   */
  async registerConfirmation(
    params: RegisterConfirmationParams,
  ): Promise<{ message: string }> {
    if (!params.uuid?.trim()) {
      throw new QvaPayValidationError("El UUID es requerido", "uuid");
    }
    if (!params.email?.trim()) {
      throw new QvaPayValidationError("El correo es requerido", "email");
    }
    if (!params.pin?.trim()) {
      throw new QvaPayValidationError("El PIN es requerido", "pin");
    }
    const { data } = await this.plainHttp.post<{ message: string }>(
      "/auth/confirm-registration",
      {
        uuid: params.uuid,
        email: params.email,
        pin: params.pin,
      },
    );
    return data;
  }

  /**
   * Verifica si la sesión actual es válida.
   * @deprecated Endpoint deprecado con fecha de retiro anunciada para 2026-07-15.
   * Se recomienda consultar directamente `UserService.getProfile()` y capturar errores de autenticación.
   */
  async checkAuth(): Promise<boolean> {
    try {
      await this.userHttp.get("/user");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Solicita un nuevo PIN de acceso por correo electrónico.
   */
  async requestPin(params: { email: string; password?: string }): Promise<string> {
    if (!params.email?.trim()) {
      throw new QvaPayValidationError("El correo es requerido", "email");
    }
    if (!params.password) {
      throw new QvaPayValidationError("La contraseña es requerida", "password");
    }
    const { data } = await this.plainHttp.post<{ message: string }>(
      "/auth/request-pin",
      {
        email: params.email,
        password: params.password,
      },
    );
    return data.message;
  }

  async getSessions(): Promise<AuthSessionResponse> {
    const { data } = await this.userHttp.get("/auth/sessions");
    return data;
  }

  async deleteSession(id: string): Promise<string> {
    const { data } = await this.userHttp.delete<{ message: string }>(
      `/auth/sessions/${id}`,
    );
    return data.message;
  }

  async create2fa(): Promise<Create2faResult> {
    const { data } = await this.userHttp.post<Create2faResult>("/auth/create-2fa");
    return data;
  }

  async check2fa(params: Check2faParams): Promise<string> {
    if (!params.two_factor_code?.trim()) {
      throw new QvaPayValidationError("El código 2FA es requerido", "two_factor_code");
    }
    const { data } = await this.userHttp.post<{ message: string }>(
      "/auth/check-2fa",
      { two_factor_code: params.two_factor_code },
    );
    return data.message;
  }

  async reset2fa(params: Reset2faParams): Promise<string> {
    if (!params.email?.trim()) {
      throw new QvaPayValidationError("El correo es requerido", "email");
    }
    const { data } = await this.plainHttp.post<{ message: string }>(
      "/auth/reset-2fa",
      { email: params.email },
    );
    return data.message;
  }

  async confirmReset2fa(params: ConfirmReset2faParams): Promise<string> {
    if (!params.email?.trim()) {
      throw new QvaPayValidationError("El correo es requerido", "email");
    }
    if (!params.code?.trim()) {
      throw new QvaPayValidationError("El código es requerido", "code");
    }
    const { data } = await this.plainHttp.patch<{ message: string }>(
      "/auth/reset-2fa",
      { email: params.email, code: params.code },
    );
    return data.message;
  }

  async requestResetPassword(params: RequestResetPasswordParams): Promise<string> {
    if (!params.email?.trim()) {
      throw new QvaPayValidationError("El correo es requerido", "email");
    }
    const { data } = await this.plainHttp.post<{ message: string }>(
      "/auth/reset-password",
      { email: params.email },
    );
    return data.message;
  }

  async confirmResetPassword(params: ConfirmResetPasswordParams): Promise<string> {
    if (!params.email?.trim()) {
      throw new QvaPayValidationError("El correo es requerido", "email");
    }
    if (!params.token?.trim()) {
      throw new QvaPayValidationError("El token es requerido", "token");
    }
    if (!params.password) {
      throw new QvaPayValidationError("La contraseña es requerida", "password");
    }
    const { data } = await this.plainHttp.patch<{ message: string }>(
      "/auth/reset-password",
      { email: params.email, token: params.token, password: params.password },
    );
    return data.message;
  }
}

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

function mapAuthResponse(raw: RawAuthResponse): AuthResponse {
  return {
    token: raw.token,
    tokenType: "Bearer",
    user: mapUser(raw.user),
  };
}
