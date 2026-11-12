// ─── Configuración ──────────────────────────────────────────────────────────

/**
 * Configuración para inicializar el SDK de QvaPay.
 */
export interface QvaPayConfig {
  /** ID de la aplicación. */
  appId?: string;
  /** Secreto de la aplicación. */
  appSecret?: string;
  /** Token Bearer preestablecido (opcional). */
  token?: string;
  /** URL base de la API. @default "https://api.qvapay.com" */
  baseUrl?: string;
  /** Tiempo de espera de la petición en ms. @default 10000 */
  timeout?: number;
  /** Adaptador de axios. Usa 'fetch' en Cloudflare Workers / edge runtimes. */
  adapter?: import("axios").AxiosRequestConfig["adapter"];
}

// ─── Modelos de Dominio ─────────────────────────────────────────────────────

/**
 * Información de una aplicación en QvaPay.
 */
export interface AppInfo {
  uuid: string;
  name: string;
  url: string;
  desc: string;
  logo: string;
  active: boolean;
  userId: number;
}

/**
 * Datos de un usuario de QvaPay.
 */
export interface User {
  uuid: string;
  name: string;
  username: string;
  email: string;
  photo: string | null;
  balance: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Estados posibles de una transacción.
 */
export type TransactionStatus = "pending" | "paid" | "cancelled" | "refunded";

/**
 * Representa una transacción en QvaPay.
 */
export interface Transaction {
  uuid: string;
  amount: string;
  currency: string;
  status: TransactionStatus;
  description: string;
  remoteId: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  app: AppInfo;
}

/**
 * Representa una factura generada.
 */
export interface Invoice {
  uuid: string;
  amount: string;
  description: string;
  remoteId: string | null;
  signedUrl: string | null;
  url: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Respuesta genérica paginada.
 */
export interface PaginatedResponse<T> {
  currentPage: number;
  data: T[];
  lastPage: number;
  perPage: number;
  total: number;
}

// ─── Parámetros de Petición ─────────────────────────────────────────────────

export interface LoginParams {
  email: string;
  password: string;
  remember?: boolean;
  twoFactorCode?: string;
}

export interface TwoFactorRequiredResult {
  twoFactorRequired: true;
  info: string;
  notified: boolean;
  hasOtp: boolean;
}

export interface LoginSuccessResult {
  twoFactorRequired?: false;
  token: string;
  tokenType: string;
  user: User;
  securityWarning?: Record<string, unknown> | null;
}

export type LoginResult = LoginSuccessResult | TwoFactorRequiredResult;

/**
 * @deprecated Use LoginResult or LoginSuccessResult instead.
 */
export type AuthResponse = LoginSuccessResult;

export interface RegisterParams {
  name: string;
  lastname?: string;
  email: string;
  password: string;
  passwordConfirmation?: string;
  invite?: string;
  terms?: boolean;
  username?: string;
  phone?: string;
}

export interface RegisterResult {
  message: string;
  user: {
    uuid: string;
    email: string;
    name: string;
    username: string;
  };
}

export interface CreateInvoiceParams {
  /** Monto en USD, dos decimales. Debe ser > 0. */
  amount: number;
  /** Máximo 300 caracteres. */
  description: string;
  /** ID de referencia opcional de su propio sistema. */
  remoteId?: string;
  /** Las URLs firmadas expiran después de 30 minutos. */
  signed?: boolean;
}

// ─── Formas de la API (Internas) ─────────────────────────────────────────────

export interface RawAppInfo {
  uuid: string;
  name: string;
  url: string;
  desc: string;
  logo: string;
  active: boolean;
  user_id: number;
}

export interface RawUser {
  uuid: string;
  name: string;
  username: string;
  email: string;
  photo: string | null;
  balance: string;
  created_at: string;
  updated_at: string;
}

export interface RawAuthResponse {
  token: string;
  user: RawUser;
}

export interface RawTransaction {
  uuid: string;
  amount: string;
  currency: string;
  status: TransactionStatus;
  description: string;
  remote_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  app: RawAppInfo;
}

export interface RawInvoice {
  uuid: string;
  amount: string;
  description: string;
  remote_id: string | null;
  signed_url: string | null;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface RawPaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

// ─── Extras de Autenticación ───────────────────────────────────────────────

export interface RegisterConfirmationParams {
  uuid: string;
  email: string;
  pin: string;
}

// ─── Criptomonedas ──────────────────────────────────────────────────────────

export interface Coin {
  id: string;
  name: string;
  tick: string;
  logo: string;
  price: string;
  change24h: string;
}

export interface RawCoin {
  id: string;
  name: string;
  tick: string;
  logo: string;
  price: string;
  change_24h: string;
}

// ─── P2P ─────────────────────────────────────────────────────────────────────

export interface P2PUser {
  uuid: string;
  username: string;
  name: string;
  image: string;
  kyc: boolean;
  vip: boolean;
  goldenCheck: boolean;
}

export interface RawP2PUser {
  uuid: string;
  username: string;
  name: string;
  image: string;
  kyc: boolean;
  vip: boolean;
  golden_check: boolean;
}

export interface P2PCoin {
  tick: string;
  name: string;
  logo: string;
}

export interface RawP2PCoin {
  tick: string;
  name: string;
  logo: string;
}

export interface P2POffer {
  uuid: string;
  type: string;
  coin: string;
  amount: number;
  receive: number;
  status: string;
  onlyKyc: number;
  onlyVip: number;
  isPrivate: number;
  message: string;
  createdAt: string;
  updatedAt: string;
  user: P2PUser;
  coinInfo: P2PCoin;
}

export interface RawP2POffer {
  uuid: string;
  type_1: string;
  coin: string;
  amount: number;
  receive: number;
  status: string;
  only_kyc: number;
  only_vip: number;
  private: number;
  message: string;
  created_at: string;
  updated_at: string;
  User: RawP2PUser;
  Coin: RawP2PCoin;
}

export interface CreateP2PParams {
  /** "buy" o "sell" */
  type: "buy" | "sell";
  /** Siglas de la moneda (ej. "BANK_CUP") */
  coin: string;
  /** Monto en QUSD (0.1–100,000) */
  amount: number;
  /** Monto a recibir en la moneda seleccionada (0.1–1,000,000) */
  receive: number;
  /** Detalles del pago según los campos de la moneda */
  details: Array<{ name: string; value: string }>;
  onlyKyc?: boolean;
  onlyVip?: boolean;
  isPrivate?: boolean;
  /** Mensaje público (máx. 79 caracteres) */
  message?: string;
  webhook?: string;
  tags?: string[];
}

// ─── Acciones / Stocks ──────────────────────────────────────────────────────

export interface Stock {
  symbol: string;
  name: string;
  icon: string;
  iconStyle: string;
  image: string;
  price: string;
  change: string;
  changeDollar: string;
  volume: string;
  timestamp: string;
}

export interface RawStock {
  symbol: string;
  name: string;
  icon: string;
  icon_style: string;
  image: string;
  price: string;
  change: string;
  change_dollar: string;
  volume: string;
  timestamp: string;
}

export interface StockTrade {
  tradeUuid: string;
  transactionUuid: string;
  symbol: string;
  quantity: string;
  effectivePrice: string;
  marketPrice: string;
  spreadPercent: string;
  fee: string;
  extra: string;
}

export interface RawStockTrade {
  trade_uuid: string;
  transaction_uuid: string;
  symbol: string;
  quantity: string;
  effective_price: string;
  market_price: string;
  spread_percent: string;
  fee: string;
  extra: string;
}

// ─── Tienda ──────────────────────────────────────────────────────────────────

export interface GiftCard {
  id: number;
  uuid: string;
  slug: string;
  name: string;
  lead: string;
  color: string;
  tax: number;
  taxGold: number;
  logo: string;
  sublogo: string;
  desc: string;
  meta: string;
  featured: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface RawGiftCard {
  id: number;
  uuid: string;
  slug: string;
  name: string;
  lead: string;
  color: string;
  tax: number;
  tax_gold: number;
  logo: string;
  sublogo: string;
  desc: string;
  meta: string;
  featured: boolean;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface BuyGiftCardParams {
  code: string;
  amount: number;
}

export interface PhonePackage {
  id: number;
  name: string;
  logo: string;
  details: PhonePackageDetail[];
  price: number;
  goldPrice: number;
  external: boolean;
  externalAmount: number;
  period: string;
}

export interface RawPhonePackage {
  id: number;
  name: string;
  logo: string;
  details: Array<{ label: string; value: string }>;
  price: number;
  gold_price: number;
  external: boolean;
  external_amount: number;
  period: string;
}

export interface BuyPhonePackageParams {
  phonePackageId: number;
  phoneNumber: string;
}

export interface BuyPhonePackageResult {
  message: string;
  transactionUuid: string;
  buyedService: string;
}

export interface RawBuyPhonePackageResult {
  message: string;
  transaction_uuid: string;
  buyedService: string;
}

// ─── Transferencia ─────────────────────────────────────────────────────────

export interface TransferParams {
  /** Monto en USD, dos decimales. Debe ser > 0. */
  amount: number;
  /** Nombre de usuario o UUID del destinatario */
  to: string;
  /** PIN del usuario */
  pin: string;
  description?: string;
}

export interface TransferResult {
  success: boolean;
  message: string;
  transaction: string;
}

// ─── V2 Invoices ─────────────────────────────────────────────────────────────

export interface InvoiceParamsV2 {
  amount: number;
  description: string;
  remote_id: string;
  webhook?: string;
  products?: ProductInvoiceV2[];
  expire_at?: string;
}

export interface ProductInvoiceV2 {
  name: string;
  price: number;
  quantity: number;
}

export interface InvoiceResultV2 {
  app_id: string;
  amount: number;
  description: string;
  remote_id: string;
  transaction_uuid: string;
  expire_at: string;
  url: string;
}

export interface AuthSessionResponse {
  sessions: {
    id: string;
    name: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    expires_at: string;
  }[];
}

// ─── Merchant V2 ─────────────────────────────────────────────────────────────

export interface ModifyInvoiceParams {
  transaction_uuid: string;
  amount?: number;
  description?: string;
  remote_id?: string;
  webhook?: string;
  products?: ProductInvoiceV2[];
  expire_at?: string | null;
}

export interface ChargeParams {
  amount: number;
  user_uuid: string;
  description: string;
  remote_id: string;
}

export interface ChargeTransaction {
  uuid: string;
  amount: number;
  description: string;
  remote_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ChargeResult {
  success: boolean;
  message: string;
  transaction: ChargeTransaction;
}

export interface AuthorizePaymentsParams {
  remote_id: string;
  callback: string;
}

export interface AuthorizePaymentsResult {
  message: string;
  url: string;
}

export interface V2Transaction {
  uuid: string;
  amount: number;
  description: string;
  products?: Array<{ name: string; price: number; quantity: number }>;
  remote_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  paidBy?: V2PaidBy;
}

export interface V2PaidBy {
  uuid: string;
  name: string;
  username: string;
  lastname: string;
  image: string;
  vip: boolean;
  kyc: string;
  golden_check: boolean;
}

export interface V2TransactionsListParams {
  page?: number;
  take?: number;
}

export interface V2TransactionsListResult {
  message: string;
  transactions: V2Transaction[];
}

export interface V2TransactionDetailResult {
  message: string;
  transaction: V2Transaction;
}

// ─── App Management ──────────────────────────────────────────────────────────

export interface AppDetail {
  uuid: string;
  name: string;
  url: string;
  logo: string;
  description: string;
  callback: string;
  success_url: string;
  cancel_url: string;
  active: boolean;
  enabled: boolean;
  allowed_payment_auth: boolean;
  card: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface RawAppDetail {
  uuid: string;
  name: string;
  url: string;
  logo: string;
  description: string;
  callback: string;
  success_url: string;
  cancel_url: string;
  active: boolean;
  enabled: boolean;
  allowed_payment_auth: boolean;
  card: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAppParams {
  name: string;
  url: string;
  logo: File | Blob;
  desc: string;
  callback: string;
  success_url: string;
  cancel_url: string;
}

export interface CreateAppResult {
  uuid: string;
  secret: string;
  name: string;
  url: string;
  desc: string;
  logo: string;
}

export interface UpdateAppParams {
  name?: string;
  url?: string;
  desc?: string;
  callback?: string;
  success_url?: string;
  cancel_url?: string;
  active?: boolean;
  enabled?: boolean;
}

export interface AppLog {
  id: number;
  type: string;
  method: string;
  path: string;
  status: number;
  created_at: string;
}

export interface AppLogsParams {
  page?: number;
  limit?: number;
  type?: "request" | "webhook";
}

export interface AppLogsResult {
  logs: AppLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PayButton {
  uuid: string;
  name: string;
  description: string;
  amount: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PayButtonsResult {
  data: PayButton[];
  limit: number;
}

export interface CreatePayButtonParams {
  name: string;
  description?: string;
  amount: number;
}

export interface UpdatePayButtonParams {
  name?: string;
  description?: string;
  amount?: number;
  active?: boolean;
}

export interface MiniAppConversationResult {
  [key: string]: any;
}

// ─── P2P Extended ────────────────────────────────────────────────────────────

export interface P2PListParams {
  page?: number;
  take?: number;
  type?: "buy" | "sell";
  coin?: string;
  orderBy?: string;
  orderType?: "asc" | "desc";
  my?: boolean;
  peer?: string;
  sortByStatus?: boolean;
  min?: number;
  max?: number;
  search?: string;
  status?: string;
}

export interface P2PDetailResult {
  message: string;
  p2p: RawP2POffer & {
    details?: Record<string, string>;
    tx_id?: string | null;
    Peer?: RawP2PUser | null;
    Ratings?: Array<{
      id: number;
      rating: number;
      comment: string;
      tags: string[];
      created_at: string;
      User: RawP2PUser;
    }>;
    currentUserId?: string;
  };
}

export interface EditP2PParams {
  amount?: number;
  receive?: number;
  only_vip?: boolean | number;
  message?: string;
  webhook?: string;
  tags?: string[];
  private?: boolean;
}

export interface ApplyP2PResult {
  message: string;
  p2p: string;
  transaction: string | null;
}

export interface CancelP2PResult {
  message: string;
  p2p: string;
}

export interface PaidP2PParams {
  tx_id: string;
}

export interface ReceivedP2PResult {
  message: string;
  p2p: string;
  amount: number;
  fee: number;
  gross_amount: number;
}

export interface RateP2PParams {
  rating: number;
  comment?: string;
  tags?: string[];
}

export interface RateP2PResult {
  message: string;
  ratingId: string;
  rating: number;
}

export interface P2PChatMessage {
  id: string;
  p2p_id: string;
  peer_id: string;
  message: string;
  image: string | null;
  created_at: string;
  updated_at: string;
  is_moderator: boolean;
  moderator_name: string | null;
}

export interface P2PChatResult {
  message: string;
  chat: P2PChatMessage[];
}

export interface P2PAverage {
  name: string;
  average: number;
  average_buy: number;
  average_sell: number;
  count: number;
  count_buy: number;
  count_sell: number;
  median?: number;
  median_buy?: number;
  median_sell?: number;
  window_hours?: number;
  updated_at: string;
}

export interface RawP2PAverage {
  [key: string]: {
    name: string;
    average: number;
    average_buy: number;
    average_sell: number;
    count: number;
    count_buy: number;
    count_sell: number;
    median?: number;
    median_buy?: number;
    median_sell?: number;
    window_hours?: number;
    updated_at: string;
  };
}

export interface P2PCompletedPairsAverage {
  average: number;
  average_buy: number;
  average_sell: number;
  median_buy: number;
  median_sell: number;
  count: number;
  window_hours: number;
  offers: number[];
}

export interface P2PAttachment {
  uuid: string;
  kind: string;
  mime: string;
  size: number;
  mine: boolean;
  created_at: string;
}

export interface P2PAttachmentLimits {
  max_bytes: number;
  max_per_party: number;
  remaining: number;
  can_upload: boolean;
  proof_replaces_tx_id: boolean;
}

export interface P2PAttachmentsResult {
  attachments: P2PAttachment[];
  limits: P2PAttachmentLimits;
}

export interface P2PPromoSlot {
  coin: string;
  offer_type: "buy" | "sell" | string;
  state: "free" | "held" | "rotating" | string;
  holder: { uuid: string; username: string } | null;
  starts_at: string | null;
  ends_at: string | null;
  leading_amount: number | null;
  min_bid: number;
  start_price: number;
  period_days: number;
}

export interface P2PPromoResult {
  data: {
    coin: string;
    enabled: boolean;
    slots: P2PPromoSlot[];
    rules: {
      requirements: { min_completed: number; min_rating: number };
      max_rate_gap_pct: number;
      market_window_hours: number;
      min_market_sample: number;
    };
    eligibility: { ok: boolean; missing?: Array<{ key: string; required: number; actual: number; label: string }> } | null;
  };
}

export interface P2PPromoCreateParams {
  coin: string;
  offer_type: "buy" | "sell";
  amount: number;
  idempotency_key: string;
}

export interface P2PFeedSubscriptionResult {
  data: {
    active: boolean;
    status: string;
    expires_at: string;
    auto_renew: boolean;
    webhook_url: string;
    webhook_events: string[];
    stream_events: string[];
    events: string[];
  };
  meta: {
    price_usd: number;
    period_days: number;
    all_events: string[];
    default_events: string[];
    range_events: string[];
  };
}

// ─── User Profile ────────────────────────────────────────────────────────────

export interface UserProfile {
  uuid: string;
  username: string;
  name: string;
  lastname: string;
  email: string;
  bio: string;
  balance: number;
  satoshis: number;
  phone: string;
  phone_verified: boolean;
  kyc: boolean;
  golden_check: boolean;
  golden_expire: string | null;
  p2p_enabled: boolean;
  cover: string;
  image: string;
  twitter: string;
  telegram: string;
  two_factor_secret: string | null;
  average_rating: number;
  latest_transactions: Array<{
    uuid: string;
    amount: number;
    description: string;
    remote_id: string;
    status: string;
    created_at: string;
    updated_at: string;
    logo: string;
    App: { uuid: string; logo: string; url: string; name: string };
    User: { uuid: string; username: string; name: string; lastname: string; bio: string; kyc: boolean; golden_check: boolean; image: string };
    PaidBy: { uuid: string; username: string; name: string; lastname: string; bio: string; kyc: boolean; golden_check: boolean; image: string };
  }>;
}

export interface UpdateUserParams {
  name?: string;
  lastname?: string;
  bio?: string;
  address?: string;
  twitter?: string;
  telegram?: string;
}

export interface UserSearchResult {
  uuid: string;
  name: string;
  lastname: string;
  username: string;
  kyc: boolean;
  golden_check: boolean;
  image: string;
  cover: string | null;
  vip: boolean;
  isContact: boolean;
  isSyncedContact?: boolean;
}

export interface KycStatus {
  uuid: string;
  kyc: boolean;
  kyc_status: string;
}

export interface KycResult {
  result: string;
  data: KycStatus | string;
}

// ─── Payment Methods ─────────────────────────────────────────────────────────

export interface PaymentMethod {
  id: string;
  name: string;
  details: string;
  created_at: string;
  updated_at: string;
  coin: { name: string; tick: string; logo: string };
}

export interface CreatePaymentMethodParams {
  coin: string;
  name: string;
  details: Record<string, any> | string;
}

export interface UpdatePaymentMethodParams {
  id: string;
  name?: string;
  details?: Record<string, any> | string;
}

export interface ReferralLink {
  uuid: string;
  code: string;
  program: string;
  max_uses: number;
  uses: number;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
  state: "active" | "exhausted" | "expired" | "revoked" | string;
  url: string;
}

export interface ReferralLinksResult {
  data: ReferralLink;
  bonus: { amount: number; threshold: number };
}

export interface LightningAddressLimits {
  min_usd: number;
  max_usd: number;
  daily_usd: number;
  used_24h_usd: number;
  remaining_usd: number;
}

export interface LightningAddressPayment {
  uuid: string;
  address: string;
  sats: number;
  credit_usd: string;
  credit_unit: string;
  comment: string | null;
  paid_at: string;
  transaction_uuid: string;
}

export interface LightningAddressData {
  visible: boolean;
  available: boolean;
  receiving: boolean;
  reason_code: string | null;
  message: string | null;
  address: {
    uuid: string;
    name: string;
    address: string;
    lnurl: string;
    qr: string;
    status: string;
    receive_as: string;
    created_at: string;
  } | null;
  domain: string;
  suggested_name: string | null;
  renames_left: number;
  limits: LightningAddressLimits;
  receive: { as: string; effective: string; sats_available: boolean };
  fees: { usd_pct: number; sats_pct: number };
  satoshis: number;
  payments: LightningAddressPayment[];
}

export interface LightningAddressResult {
  data: LightningAddressData;
}

export interface LightningAddressUpdateParams {
  action: "activate" | "rename" | "pause" | "resume" | "receive" | string;
  name?: string;
  receive_as?: "usd" | "sats" | string;
}

export interface LightningDecodeResult {
  [key: string]: any;
}

export interface EmailChangeStatusResult {
  enabled: boolean;
  can_start: boolean;
  problem: { code: string; message: string; until: string | null } | null;
  methods: string[];
  hold_hours: number;
  pending: {
    uuid: string;
    new_email: string;
    execute_after: string;
    requested_at: string;
    cancel_methods?: string[];
  } | null;
}

export interface CipStatusResult {
  us_person?: boolean;
  ssn_itin_last4?: string | null;
  addr_line1?: string;
  addr_line2?: string;
  addr_city?: string;
  addr_state?: string;
  addr_postal?: string;
  addr_country?: string;
  cip_status?: string;
  has_document_hash?: boolean;
  cpf_verification?: {
    status: string;
    verified_at: string | null;
    cpf_last2: string | null;
    attempts_left: number;
    attempts_max: number;
    can_start: boolean;
    block_reason: string | null;
    message: string | null;
  };
  ssn_verification?: {
    status: string;
    verified_at: string | null;
    attempts_left: number;
    attempts_max: number;
    can_start: boolean;
    block_reason: string | null;
    message: string | null;
  };
}

export interface DepositEligibilityResult {
  result: string;
  data: {
    channel: string;
    card: { eligible: boolean; tier: string | null; reason: string | null };
    paypal: { eligible: boolean; tier: string | null; reason: string | null };
    bank: { eligible: boolean; tier: string | null; reason: string | null };
    ssn_tier?: {
      enabled: boolean;
      verified: boolean;
      cap: number;
      used_30d: number;
      remaining: number;
      window_days: number;
      resets_at: string | null;
    };
  };
}

export interface CompanyApplication {
  uuid: string;
  company_name: string;
  director_name: string;
  email: string;
  activity: string;
  employee_count: string;
  country: string;
  entity_type: string | null;
  status: string;
  statutes_sent?: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Payment Auths ───────────────────────────────────────────────────────────

export interface PaymentAuth {
  id: string;
  app: { id: string; name: string; url: string; logo: string; description: string };
  created_at: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface NotificationSettings {
  email_enabled: boolean;
  telegram_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
}

export interface UpdateNotificationParams {
  email_enabled?: boolean;
  telegram_enabled?: boolean;
  push_enabled?: boolean;
  sms_enabled?: boolean;
}

// ─── Contacts ────────────────────────────────────────────────────────────────

export interface Contact {
  id: string;
  name: string;
  favorite: boolean;
  Contact: {
    uuid: string;
    name: string;
    image: string;
    username: string;
    kyc: boolean;
    vip: boolean;
    golden_check: boolean;
    phone_verified: boolean;
    telegram_verified: boolean;
  };
  created_at: string;
}

export interface ContactsResult {
  message: string;
  contacts: Contact[];
}

export interface CreateContactParams {
  contact_uuid: string;
  name?: string;
}

export interface ToggleFavoriteResult {
  message: string;
  favorite: boolean;
}

// ─── TopUp ───────────────────────────────────────────────────────────────────

export interface TopUpParams {
  amount: number;
  pay_method: string;
  webhook_url?: string;
}

export interface TopUpResult {
  result: string;
  data: {
    wallet: string;
    memo: string | null;
    coin: string;
    value: number;
    price: number;
    transaction_id: string;
    transaction_uuid: string;
    transaction_url: string;
    payment_id: string;
    redirect_url: string | null;
  };
}

// ─── Payment Links ───────────────────────────────────────────────────────────

export interface PaymentLink {
  id: string;
  name: string;
  product_id: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentLinkParams {
  name: string;
  product_id: string;
  amount: number;
}

// ─── Store Vouchers ──────────────────────────────────────────────────────────

export interface VoucherFeatured {
  brand: string;
  slug: string;
  country: string;
  logo_url: string;
  offer_count: number;
  country_meta: { name: string; flag: string };
}

export interface VoucherCountry {
  code: string;
  offer_count: number;
  name: string;
  flag: string;
}

export interface VoucherBrand {
  brand: string;
  slug: string;
  country: string;
  logo_url: string;
  bg_color: string;
  offer_count: number;
  sample_price: number;
}

export interface VoucherOffer {
  source: string;
  offer_id: string;
  name: string;
  notes: string | null;
  sent_benefits: string | null;
  send?: { currency: string; value: number };
  sub_type: string;
  price_type: string;
  price?: number;
  price_min?: number;
  price_max?: number;
  service_fee_pct?: number;
}

export interface VoucherCatalogFeatured {
  featured: VoucherFeatured[];
}

export interface VoucherCatalogCountries {
  countries: VoucherCountry[];
}

export interface VoucherCatalogBrands {
  country: { name: string; flag: string };
  brands: VoucherBrand[];
}

export interface VoucherCatalogOffers {
  country: { name: string; flag: string };
  brand: string;
  brand_logo_url: string;
  offers: VoucherOffer[];
}

export interface PurchaseVoucherParams {
  offer_id: string;
  country: string;
  brand: string;
  amount?: number;
}

export interface PurchaseVoucherResult {
  message: string;
  transaction_uuid: string;
  buyedService_id: string;
}

export interface EsimCountry {
  code: string;
  offer_count: number;
  price_from: number | null;
  name: string;
  flag: string;
}

export interface EsimOffer {
  offer_id: string;
  name: string;
  sent_benefits: string;
  region: string | null;
  sub_type: string;
  price_type: string;
  price: number;
}

export interface EsimCatalogCountriesResult {
  countries: EsimCountry[];
}

export interface EsimCatalogOffersResult {
  country: { code: string; name: string; flag: string };
  offers: EsimOffer[];
}

export interface EsimPurchaseParams {
  offer_id: string;
  country: string;
}

export interface EsimPurchaseResult {
  message: string;
  transaction_uuid: string;
  buyedService_id: string;
}

export interface StorePurchaseItem {
  id: string;
  service_name: string;
  service_logo: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StorePurchaseDetail {
  id: string;
  status: string;
  amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  service: { name: string; logo: string | null } | null;
  transaction: { uuid: string } | null;
  service_data: Record<string, any>;
}

export interface PixEligibilityResult {
  data: {
    eligible: boolean;
    reason: string | null;
    gold_required: boolean;
    surfaces: string[];
    quote: { usd_per_brl: number; surcharge_pct: number; provider_pct: number };
    cap: { cap: number; used: number; remaining: number; resets_at: string; window_days: number };
    hold_hours: number;
    instant_max_usd: number;
  };
}

export interface PixCheckoutParams {
  source: "cuba" | "topup" | "esim" | "voucher" | "market" | string;
  [key: string]: any;
}

export interface PixCheckoutResult {
  data: {
    uuid: string;
    surface: string;
    stage: string;
    description: string;
    total_usd: number;
    total_brl: number;
    refunded_brl: number;
    expires_at: string;
    paid_at: string | null;
    clearing_until: string | null;
    qr: {
      data: string;
      image_url_png: string;
      hosted_instructions_url: string;
      expires_at: number;
    };
  };
}

// ─── Store Topups LATAM (legacy) ─────────────────────────────────────────────

// ─── 2FA ─────────────────────────────────────────────────────────────────────

export interface Create2faResult {
  message: string;
  secret: string;
  qrcode: string;
}

export interface Check2faParams {
  two_factor_code: string;
}

export interface Reset2faParams {
  email: string;
}

export interface ConfirmReset2faParams {
  email: string;
  code: string;
}

// ─── Reset Password ──────────────────────────────────────────────────────────

export interface RequestResetPasswordParams {
  email: string;
}

export interface ConfirmResetPasswordParams {
  email: string;
  token: string;
  password: string;
}

// ─── Coins Categorized ───────────────────────────────────────────────────────

export interface CoinCategory {
  id: number;
  name: string;
  icon: string;
  coins: Array<{
    id: string;
    name: string;
    tick: string;
    logo: string;
    price: string;
    change_24h: string;
  }>;
}

export interface CoinPriceHistoryPoint {
  time: number;
  value: number;
}

export interface CoinDetail {
  id: string;
  name: string;
  tick: string;
  logo: string;
  price: string;
  change24h: string;
}

export interface RawCoinDetail {
  id: string;
  name: string;
  tick: string;
  logo: string;
  price: string;
  change_24h: string;
}

// ─── Stocks Extended ─────────────────────────────────────────────────────────

export interface StockDetail {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changeDollar: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  exchange: string;
  type: string;
  description: string;
  sector: string;
  industry: string;
  ceo: string;
}

export interface StockPricePoint {
  time: number;
  value: number;
}

export interface StockPortfolioPosition {
  id: string;
  symbol: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  costBasis: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
}

export interface RawStockPortfolioPosition {
  id: string;
  symbol: string;
  quantity: number;
  avg_cost: number;
  current_price: number;
  market_value: number;
  cost_basis: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
}

export interface StockPortfolioSummary {
  totalMarketValue: number;
  totalCostBasis: number;
  totalUnrealizedPnl: number;
  totalUnrealizedPnlPercent: number;
  marketOpen: boolean;
}

export interface RawStockPortfolioSummary {
  total_market_value: number;
  total_cost_basis: number;
  total_unrealized_pnl: number;
  total_unrealized_pnl_percent: number;
  market_open: boolean;
}

export interface StockPortfolioTrade {
  id: string;
  uuid: string;
  symbol: string;
  type: "buy" | "sell";
  quantity: number;
  marketPrice: number;
  effectivePrice: number;
  spreadPercent: number;
  feeAmount: number;
  totalAmount: number;
  realizedPnl: number | null;
  afterHours: boolean;
  createdAt: string;
}

export interface RawStockPortfolioTrade {
  id: string;
  uuid: string;
  symbol: string;
  type: "buy" | "sell";
  quantity: number;
  market_price: number;
  effective_price: number;
  spread_percent: number;
  fee_amount: number;
  total_amount: number;
  realized_pnl: number | null;
  after_hours: boolean;
  created_at: string;
}

export interface StockPortfolioResult {
  positions: StockPortfolioPosition[];
  summary: StockPortfolioSummary;
  trades: StockPortfolioTrade[];
  pagination: { page: number; take: number };
}

export interface RawStockPortfolioResult {
  positions: RawStockPortfolioPosition[];
  summary: RawStockPortfolioSummary;
  trades: RawStockPortfolioTrade[];
  pagination: { page: number; take: number };
}

export interface StockPortfolioParams {
  page?: number;
  take?: number;
}

export interface StockDetailParams {
  type?: "quote";
  timeframe?: "1H" | "24H" | "1W" | "1M" | "1Y";
}

// ─── User Extended ───────────────────────────────────────────────────────────

export interface UserExtendedProfile {
  uuid: string;
  username: string;
  name: string;
  lastname: string;
  email: string;
  bio: string;
  balance: number;
  phone: string;
  phoneVerified: boolean;
  kyc: boolean;
  goldenCheck: boolean;
  goldenExpire: string | null;
  p2pEnabled: boolean;
  twoFactorSecret: string | null;
  p2pCompletedCount: number;
  p2pAverageRating: number;
  p2pRatersCount: number;
  withdraws: Array<{
    amount: number;
    status: string;
    paymentMethod: string;
    txId: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface RawUserExtendedProfile {
  uuid: string;
  username: string;
  name: string;
  lastname: string;
  email: string;
  bio: string;
  balance: number;
  phone: string;
  phone_verified: boolean;
  kyc: boolean;
  golden_check: boolean;
  golden_expire: string | null;
  p2p_enabled: boolean;
  two_factor_secret: string | null;
  p2p_completed_count: number;
  p2p_average_rating: number;
  p2p_raters_count: number;
  withdraws: Array<{
    amount: number;
    status: string;
    payment_method: string;
    tx_id: string;
    created_at: string;
    updated_at: string;
  }>;
}

export interface AvatarUploadResult {
  result: string;
  message: string;
  data: { url: string; path: string };
}

export interface GoldStatus {
  goldenCheck: boolean;
  goldenExpire: string | null;
}

export interface RawGoldStatus {
  user: {
    golden_check: boolean;
    golden_expire: string | null;
  };
}

export interface BuyGoldParams {
  uuid: string;
  duration: number;
}

export interface BuyGoldResult {
  success: boolean;
  user: string;
  isSelfPurchase: boolean;
  duration: number;
}

export interface ReferralUser {
  uuid: string;
  username: string;
  name: string;
  lastname: string;
  kyc: boolean;
  goldenCheck: boolean;
  image: string;
}

export interface RawReferralUser {
  uuid: string;
  username: string;
  name: string;
  lastname: string;
  kyc: boolean;
  golden_check: boolean;
  image: string;
}

export interface ReferralsResult {
  referrals: ReferralUser[];
  totalReferrals: number;
}

export interface RawReferralsResult {
  referrals: RawReferralUser[];
  totalReferrals: number;
}

// ─── Withdraw ────────────────────────────────────────────────────────────────

export interface Withdraw {
  withdrawId: number;
  transactionId: string;
  receiveAmount: number;
  receiveAmountCoin: number;
  feeToApply: number;
  amount: number;
  coin: string;
  status?: string;
  paymentMethod?: string;
  txId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RawWithdraw {
  withdraw_id: number;
  transaction_id: string;
  receive_amount: number;
  receive_amount_coin: number;
  fee_to_apply: number;
  amount: number;
  coin: string;
  status?: string;
  payment_method?: string;
  tx_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WithdrawListResult {
  result: string;
  data: Withdraw[];
}

export interface RawWithdrawListResult {
  result: string;
  data: RawWithdraw[];
}

export interface WithdrawComplianceAttestations {
  notProhibitedOfficial: boolean;
  notProhibitedPartyMember: boolean;
  notRestrictedList: boolean;
  lawfulPurpose: boolean;
}

export interface WithdrawCompliance {
  purposeCode: string;
  attestations: WithdrawComplianceAttestations;
  purposeNote?: string;
  language?: string;
  specificLicense?: string;
  generalLicense?: string;
}

export interface CreateWithdrawParams {
  amount: number;
  payMethod: string;
  details: Record<string, any>;
  pin?: string;
  note?: string;
  webhook?: string;
  idempotencyKey?: string;
  destLabel?: "OWN_ACCOUNT" | "THIRD_PARTY" | string;
  compliance?: WithdrawCompliance;
}

export interface WithdrawListParams {
  page?: number;
  take?: number;
  status?: "pending" | "processing" | "paid" | "cancelled" | string;
  paymentMethod?: string;
  includeTotal?: boolean;
}

export interface BankLookupBrand {
  institution_id: string;
  name: string;
  url: string;
  primary_color: string | null;
  logo_url: string | null;
}

export interface BankLookupBank {
  name: string;
  city: string | null;
  state: string | null;
  url: string | null;
  primary_color: string | null;
  logo_url: string | null;
  institution_id: string;
  source: string;
  brands?: BankLookupBrand[];
}

export interface BankLookupResult {
  data: {
    routing: string;
    valid: boolean;
    reason?: string;
    bank: BankLookupBank | null;
    degraded: boolean;
    checked_at: string;
  };
}

export interface CashZone {
  id: string;
  coin_tick: string;
  province_code: string;
  province_name: string;
  municipality: string;
  is_capital: boolean;
  provider_pct: number;
  margin_pct: number | null;
  total_pct: number;
  min_usd: number;
  small_flat_usd: number | null;
  eta_min_hours: number;
  eta_max_hours: number;
  home_delivery: boolean;
  route: string;
  enabled: boolean;
}

export interface CashZonesResult {
  coin: string;
  margin_pct: number;
  zones: CashZone[];
}

export interface CreateWithdrawResult {
  withdrawId: number;
  transactionId: string;
  receiveAmount: number;
  receiveAmountCoin: number;
  feeToApply: number;
  amount: number;
  coin: string;
}

export interface RawCreateWithdrawResult {
  withdraw_id: number;
  transaction_id: string;
  receive_amount: number;
  receive_amount_coin: number;
  fee_to_apply: number;
  amount: number;
  coin: string;
}

export interface WithdrawDetail {
  withdraw: Withdraw;
}

export interface RawWithdrawDetail {
  withdraw: RawWithdraw;
}

// ─── Store Vouchers (updated types for new catalog API) ──────────────────────

export interface VoucherFeatured {
  brand: string;
  slug: string;
  country: string;
  logo_url: string;
  offer_count: number;
  country_meta: { name: string; flag: string };
}

export interface VoucherCountry {
  code: string;
  offer_count: number;
  name: string;
  flag: string;
}

export interface VoucherBrand {
  brand: string;
  slug: string;
  country: string;
  logo_url: string;
  bg_color: string;
  offer_count: number;
  sample_price: number;
}

export interface VoucherOffer {
  source: string;
  offer_id: string;
  name: string;
  notes: string | null;
  sent_benefits: string | null;
  send?: { currency: string; value: number };
  sub_type: string;
  price_type: string;
  price?: number;
  price_min?: number;
  price_max?: number;
  service_fee_pct?: number;
}

export interface VoucherCatalogFeatured {
  featured: VoucherFeatured[];
}

export interface VoucherCatalogCountries {
  countries: VoucherCountry[];
}

export interface VoucherCatalogBrands {
  country: { name: string; flag: string };
  brands: VoucherBrand[];
}

export interface VoucherCatalogOffers {
  country: { name: string; flag: string };
  brand: string;
  brand_logo_url: string;
  offers: VoucherOffer[];
}

export interface PurchaseVoucherParams {
  offer_id: string;
  country: string;
  brand: string;
  amount?: number;
}

export interface PurchaseVoucherResult {
  message: string;
  transaction_uuid: string;
  buyedService_id: string;
}

// ─── Store LATAM Topup (updated types for new catalog API) ───────────────────

export interface LatamTopupCountry {
  code: string;
  offer_count: number;
  name: string;
  flag: string;
  dial: string;
  pattern: string;
}

export interface LatamTopupOperator {
  brand: string;
  slug: string;
  source: string;
  logo_url: string;
  bg_color: string;
  offer_count: number;
  price_min: number;
  price_max: number;
}

export interface LatamTopupOffer {
  source: string;
  offer_id: string;
  name: string;
  notes: string | null;
  sent_benefits: string | null;
  sub_type: string;
  price_type: "FIXED" | "RANGE";
  price?: number;
  price_min?: number;
  price_max?: number;
  service_fee_pct?: number;
}

export interface LatamTopupCatalogCountries {
  countries: LatamTopupCountry[];
}

export interface LatamTopupCatalogOperators {
  country: { name: string; flag: string; dial: string; pattern: string };
  brands: LatamTopupOperator[];
}

export interface LatamTopupCatalogOffers {
  country: { name: string; flag: string; dial: string; pattern: string };
  brand: string;
  brand_logo_url: string;
  offers: LatamTopupOffer[];
}

export interface LatamTopupPurchaseParams {
  offer_id: string;
  phone_number: string;
  country: string;
  amount?: number;
}

export interface LatamTopupPurchaseResult {
  message: string;
  transaction_uuid: string;
  buyedService_id: string;
}

export interface LatamTopupParams {
  country: string;
  brand?: string;
}

export interface LatamTopupOfferLegacy {
  offerId: string;
  brand: string;
  country: string;
  priceType: "FIXED" | "RANGE";
  price: number | { min: number; max: number };
  notes: string | null;
  subType: string | null;
}

export interface LatamTopupResult {
  offers: LatamTopupOfferLegacy[];
  country: string;
}

// ─── Phone Package (updated details type) ────────────────────────────────────

export interface PhonePackageDetail {
  label: string;
  value: string;
}

export interface PhonePackage {
  id: number;
  name: string;
  logo: string;
  details: PhonePackageDetail[];
  price: number;
  goldPrice: number;
  external: boolean;
  externalAmount: number;
  period: string;
}

export interface RawPhonePackage {
  id: number;
  name: string;
  logo: string;
  details: Array<{ label: string; value: string }>;
  price: number;
  gold_price: number;
  external: boolean;
  external_amount: number;
  period: string;
}

// ─── Transaction Detail (User transactions) ──────────────────────────────────

export interface TransactionDetailUser {
  uuid: string;
  name: string;
  lastname: string;
  username: string;
  image: string;
  vip: boolean;
  kyc: boolean;
  goldenCheck: boolean;
}

export interface RawTransactionDetailUser {
  uuid: string;
  name: string;
  lastname: string;
  username: string;
  image: string;
  vip: boolean;
  kyc: boolean;
  golden_check: boolean;
}

export interface TransactionDetailApp {
  uuid: string;
  name: string;
  url: string;
  logo: string;
  desc: string;
}

export interface RawTransactionDetailApp {
  uuid: string;
  name: string;
  url: string;
  logo: string;
  desc: string;
}

export interface TransactionDetailCoin {
  tick: string;
  name: string;
  logo: string;
}

export interface TransactionDetailWallet {
  walletType: string;
  wallet: string;
  value: number;
  received: number;
  txid: string;
  status: string;
  createdAt: string;
  coin: TransactionDetailCoin;
}

export interface RawTransactionDetailWallet {
  wallet_type: string;
  wallet: string;
  value: number;
  received: number;
  txid: string;
  status: string;
  created_at: string;
  coin: TransactionDetailCoin;
}

export interface TransactionDetailP2P {
  uuid: string;
  type: string;
  amount: number;
  receive: number;
  status: string;
  createdAt: string;
  coin: TransactionDetailCoin;
  user: TransactionDetailUser;
  peer: TransactionDetailUser;
}

export interface RawTransactionDetailP2P {
  uuid: string;
  type: string;
  amount: number;
  receive: number;
  status: string;
  created_at: string;
  coin: TransactionDetailCoin;
  user: RawTransactionDetailUser;
  peer: RawTransactionDetailUser;
}

export interface TransactionDetailWithdraw {
  amount: number;
  receive: number;
  paymentMethod: string;
  status: string;
  txId: string;
  evidenceUrl: string;
  createdAt: string;
  coin: TransactionDetailCoin;
}

export interface RawTransactionDetailWithdraw {
  amount: number;
  receive: number;
  payment_method: string;
  status: string;
  tx_id: string;
  evidence_url: string;
  created_at: string;
  coin: TransactionDetailCoin;
}

export interface TransactionDetailService {
  amount: number;
  status: string;
  createdAt: string;
  service: { uuid: string; name: string; logo: string; sublogo: string };
}

export interface RawTransactionDetailService {
  amount: number;
  status: string;
  created_at: string;
  service: { uuid: string; name: string; logo: string; sublogo: string };
}

export interface TransactionDetail {
  uuid: string;
  amount: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  description: string;
  remoteId: string;
  user: TransactionDetailUser | null;
  paidBy: TransactionDetailUser | null;
  app: TransactionDetailApp | null;
  wallet: TransactionDetailWallet | null;
  p2p: TransactionDetailP2P | null;
  withdraw: TransactionDetailWithdraw | null;
  service: TransactionDetailService | null;
}

export interface RawTransactionDetail {
  uuid: string;
  amount: string;
  created_at: string;
  updated_at: string;
  status: string;
  description: string;
  remote_id: string;
  user: RawTransactionDetailUser | null;
  paid_by: RawTransactionDetailUser | null;
  app: RawTransactionDetailApp | null;
  wallet: RawTransactionDetailWallet | null;
  p2p: RawTransactionDetailP2P | null;
  withdraw: RawTransactionDetailWithdraw | null;
  service: RawTransactionDetailService | null;
}

export interface TransactionDetailResult {
  message: string;
  data: TransactionDetail;
}

export interface RawTransactionDetailResult {
  message: string;
  data: RawTransactionDetail;
}

export interface TransactionCommentAuthor {
  uuid: string;
  username: string;
  name: string;
  lastname: string;
  image: string;
  vip: boolean;
  golden_check: boolean;
}

export interface TransactionComment {
  uuid: string;
  body: string;
  source: string;
  created_at: string;
  mine: boolean;
  author: TransactionCommentAuthor;
}

export interface TransactionCommentsResult {
  data: TransactionComment[];
  max: number;
  max_length: number;
}

export interface TransactionStatusResult {
  uuid: string;
  updated_at: string;
  status: string;
  withdraw_status: string | null;
  service_status: string | null;
  live: boolean;
  fingerprint: string;
}

export interface TransactionListParams {
  take?: number;
  page?: number;
  status?: "paid" | "pending" | "cancelled" | string;
  search?: string;
  query?: string;
  uuid?: string;
  userUuid?: string;
  order?: "asc" | "desc";
  orderBy?: string;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: string;
  dateTo?: string;
  includeTotal?: boolean;
}

export interface TransactionListWithTotal {
  transactions: Transaction[];
  total: number;
}

export interface RawTransactionListWithTotal {
  transactions: RawTransaction[];
  total: number;
}
