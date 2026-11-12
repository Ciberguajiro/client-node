/**
 * Clase base para todos los errores del SDK.
 */
export class QvaPayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QvaPayError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Fallo a nivel de red (no se recibió respuesta del servidor).
 */
export class QvaPayNetworkError extends QvaPayError {
  constructor(message: string) {
    super(message);
    this.name = "QvaPayNetworkError";
  }
}

/**
 * Error de autenticación (401 / 403) — credenciales inválidas o faltantes.
 */
export class QvaPayAuthError extends QvaPayError {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "QvaPayAuthError";
    this.statusCode = statusCode;
  }
}

/**
 * Cualquier respuesta HTTP no exitosa (fuera del rango 2xx) de la API (excepto errores de auth).
 */
export class QvaPayApiError extends QvaPayError {
  readonly statusCode: number;
  readonly statusMessage: string | undefined;
  readonly code: string | undefined;

  constructor(message: string, statusCode: number, statusMessage?: string, code?: string) {
    super(message);
    this.name = "QvaPayApiError";
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
    this.code = code;
  }
}

/**
 * Argumentos inválidos pasados a un método del SDK antes de realizar la petición.
 */
export class QvaPayValidationError extends QvaPayError {
  /** El campo que falló la validación, si aplica. */
  readonly field: string | undefined;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "QvaPayValidationError";
    this.field = field;
  }
}
