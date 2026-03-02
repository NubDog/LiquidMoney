/**
 * theme.ts — Centralized design tokens for LiquidMoney
 * All color values, spacing, radii, and font sizes in one place.
 */

// ─── Colors ───────────────────────────────────────────────────────────────────

export const Colors = {
    // Base
    bg: '#000000',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.50)',
    textMuted: 'rgba(255, 255, 255, 0.30)',

    // Glass surfaces
    card: 'rgba(255, 255, 255, 0.06)',
    cardBorder: 'rgba(255, 255, 255, 0.10)',
    cardHeavy: 'rgba(255, 255, 255, 0.08)',
    cardHeavyBorder: 'rgba(255, 255, 255, 0.12)',

    // Semantic
    income: '#4ade80',
    incomeBg: 'rgba(74, 222, 128, 0.15)',
    incomeBorder: 'rgba(74, 222, 128, 0.25)',
    expense: '#f87171',
    expenseBg: 'rgba(248, 113, 113, 0.15)',
    expenseBorder: 'rgba(248, 113, 113, 0.25)',

    // Accents
    accent: '#a855f7',
    accentLight: '#C084FC',
    cyan: '#22d3ee',
    warning: '#f59e0b',
    danger: '#ef4444',

    // UI elements
    divider: 'rgba(255, 255, 255, 0.06)',
    overlay: 'rgba(0, 0, 0, 0.55)',
    overlayHeavy: 'rgba(0, 0, 0, 0.6)',

    // Buttons / Inputs
    inputBg: 'rgba(255, 255, 255, 0.05)',
    inputBorder: 'rgba(255, 255, 255, 0.08)',
    disabledOpacity: 0.3,

    // Sheet / Modal
    sheetBg: 'rgba(28, 28, 30, 0.98)',
    dialogBg: 'rgba(25, 25, 35, 0.97)',
    handleBar: 'rgba(255, 255, 255, 0.15)',
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
} as const;

// ─── Border Radii ─────────────────────────────────────────────────────────────

export const Radii = {
    sm: 10,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    pill: 9999,
} as const;

// ─── Font Sizes ───────────────────────────────────────────────────────────────

export const FontSizes = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    title: 36,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const Shadows = {
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 16,
    },
    menu: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
} as const;
