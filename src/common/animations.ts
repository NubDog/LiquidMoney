/**
 * animations.ts — Reusable animation presets for LiquidMoney
 * Consolidates repeated overlay/sheet/scale animation patterns
 * used across 6+ modal/dialog components.
 */

import { Animated, Easing } from 'react-native';

// ─── Spring Configs ───────────────────────────────────────────────────────────

export const SpringConfigs = {
    /** Gentle spring for sheet slide-in */
    gentle: { damping: 15, stiffness: 90 },
    /** Snappy spring for quick interactions */
    snappy: { damping: 22, stiffness: 180, mass: 0.8 },
    /** Bouncy spring for dialog scale-in */
    bouncy: { friction: 8, tension: 100 },
    /** Smooth spring for tab/indicator slides */
    smooth: { friction: 10, tension: 65 },
    /** Popup spring for menu appearance */
    popup: { damping: 12, stiffness: 120 },
} as const;

// ─── Overlay Animations ───────────────────────────────────────────────────────

/** Fade overlay in (opacity 0 → 1) */
export function animateOverlayIn(
    opacity: Animated.Value,
    duration: number = 300,
): Animated.CompositeAnimation {
    return Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
    });
}

/** Fade overlay out (opacity → 0) */
export function animateOverlayOut(
    opacity: Animated.Value,
    duration: number = 200,
): Animated.CompositeAnimation {
    return Animated.timing(opacity, {
        toValue: 0,
        duration,
        useNativeDriver: true,
    });
}

// ─── Sheet Animations ─────────────────────────────────────────────────────────

export function animateSheetIn(
    translateY: Animated.Value,
    config: { duration?: number } = { duration: 350 },
): Animated.CompositeAnimation {
    // Sử dụng timing thay vì spring để sửa lỗi chạm (touch) trên Android khi animation dùng useNativeDriver
    // Thời gian sẽ kết thúc chính xác, cho phép nút bấm hoạt động ngay lập tức
    return Animated.timing(translateY, {
        toValue: 0,
        duration: config.duration || 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
    });
}

/** Slide sheet out to bottom */
export function animateSheetOut(
    translateY: Animated.Value,
    toValue: number = 400,
    duration: number = 250,
): Animated.CompositeAnimation {
    return Animated.timing(translateY, {
        toValue,
        duration,
        useNativeDriver: true,
    });
}

// ─── Scale Animations ─────────────────────────────────────────────────────────

export function animateScaleIn(
    scale: Animated.Value,
    config: { duration?: number } = { duration: 250 },
): Animated.CompositeAnimation {
    return Animated.timing(scale, {
        toValue: 1,
        duration: config.duration || 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
    });
}

/** Scale dialog out (→ 0.85) with timing */
export function animateScaleOut(
    scale: Animated.Value,
    toValue: number = 0.85,
    duration: number = 150,
): Animated.CompositeAnimation {
    return Animated.timing(scale, {
        toValue,
        duration,
        useNativeDriver: true,
    });
}

// ─── Composite Patterns ───────────────────────────────────────────────────────

/**
 * Standard overlay + sheet open animation
 * Used by: WalletModal, TransactionModal, EditWalletModal
 */
export function animateModalOpen(
    overlayOpacity: Animated.Value,
    sheetTranslateY: Animated.Value,
    config?: { damping?: number; stiffness?: number; friction?: number; tension?: number },
): void {
    Animated.parallel([
        animateOverlayIn(overlayOpacity),
        animateSheetIn(sheetTranslateY, config),
    ]).start();
}

/**
 * Standard overlay + sheet close animation
 * Calls onComplete when finished
 */
export function animateModalClose(
    overlayOpacity: Animated.Value,
    sheetTranslateY: Animated.Value,
    onComplete?: () => void,
    sheetToValue?: number,
): void {
    Animated.parallel([
        animateOverlayOut(overlayOpacity),
        animateSheetOut(sheetTranslateY, sheetToValue),
    ]).start(({ finished }) => {
        if (finished) { onComplete?.(); }
    });
}

/**
 * Standard overlay + scale dialog open animation
 * Used by: ConfirmDialog, InfoDialog, ConfirmImportDialog
 */
export function animateDialogOpen(
    overlayOpacity: Animated.Value,
    scale: Animated.Value,
): void {
    overlayOpacity.setValue(0);
    scale.setValue(0.85);
    Animated.parallel([
        animateOverlayIn(overlayOpacity, 200),
        animateScaleIn(scale),
    ]).start();
}

/**
 * Standard overlay + scale dialog close animation
 * Calls onComplete when finished
 */
export function animateDialogClose(
    overlayOpacity: Animated.Value,
    scale: Animated.Value,
    onComplete?: () => void,
): void {
    Animated.parallel([
        animateOverlayOut(overlayOpacity, 150),
        animateScaleOut(scale),
    ]).start(({ finished }) => {
        if (finished) { onComplete?.(); }
    });
}
