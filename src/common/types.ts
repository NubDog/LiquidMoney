/**
 * types.ts — Shared TypeScript types for LiquidMoney
 * Re-exports database types so screens don't import from database layer directly.
 */

export type { Wallet, Transaction, ExportData } from '../database/queries';
