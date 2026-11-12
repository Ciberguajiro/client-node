// ─── SDK v2 (api.qvapay.com) ────────────────────────────────────────────────
export { QvaPaySDK } from './lib';

export * from './types';
export * from './errors';
export * from './utils';

export * from './services/app.service';
export * from './services/apps.service';
export * from './services/auth.service';
export * from './services/coins.service';
export * from './services/invoices.service';
export * from './services/me.service';
export * from './services/p2p.service';
export * from './services/payment-links.service';
export * from './services/stocks.service';
export * from './services/store.service';
export * from './services/transactions.service';
export * from './services/user.service';
export * from './services/withdraw.service';
export * from './services/support.service';
export * from './services/push.service';
export * from './services/saving.service';
export * from './services/energy.service';
export * from './services/market.service';
export * from './services/miniapps.service';

// ─── API funcional legacy (qvapay.com/api) ──────────────────────────────────
/** @deprecated Usa `QvaPaySDK`. Se mantiene por compatibilidad hacia atrás. */
export * from './api';
