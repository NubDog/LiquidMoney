/**
 * formatters.ts — Shared formatting helpers for LiquidMoney
 * Consolidates duplicate formatVND (4 files) and formatDate (3 files)
 */

/**
 * Format a number as Vietnamese Dong with dot separators.
 * Example: 1234567 → "1.234.567 ₫"
 */
export function formatVND(n: number): string {
    return Math.abs(n)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VND';
}

/**
 * Format a number as abbreviated Vietnamese Dong.
 * Examples: 1500000 → "1.5Tr", 50000 → "50K", 999 → "999 ₫"
 */
export function formatVNDShort(n: number): string {
    const abs = Math.abs(n);
    if (abs >= 1_000_000_000) { return (abs / 1_000_000_000).toFixed(1) + 'T'; }
    if (abs >= 1_000_000) { return (abs / 1_000_000).toFixed(1) + 'Tr'; }
    if (abs >= 1_000) { return Math.round(abs / 1_000).toString() + 'K'; }
    return abs.toString() + ' VND';
}

/**
 * Format ISO date string as short date+time.
 * Example: "2026-03-01T15:30:00Z" → "01/03 15:30"
 */
export function formatDate(iso: string): string {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month} ${hours}:${mins}`;
}

/**
 * Format ISO date string as full date+time with seconds.
 * Example: "2026-03-01T15:30:45Z" → "01/03/2026 — 15:30:45"
 */
export function formatFullDate(iso: string): string {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    const secs = String(d.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} — ${hours}:${mins}:${secs}`;
}

/**
 * Format a signed VND amount with prefix.
 * Example: formatVNDSigned(1234567) → "+1.234.567 VND"
 *          formatVNDSigned(-500000) → "-500.000 VND"
 */
export function formatVNDSigned(n: number): string {
    const prefix = n >= 0 ? '+' : '-';
    return `${prefix}${formatVND(n)}`;
}
