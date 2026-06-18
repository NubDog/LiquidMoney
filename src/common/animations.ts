/**
 * animations.ts — Reusable animation presets for LiquidMoney
 * Consolidates repeated overlay/sheet/scale animation patterns
 * used across 6+ modal/dialog components.
 */

import { useEffect } from 'react';
import { withTiming, withSpring, Easing, runOnJS, withRepeat, withSequence, useAnimatedStyle, type SharedValue, type WithSpringConfig } from 'react-native-reanimated';

// ─── Spring Configs ───────────────────────────────────────────────────────────

export const SpringConfigs: Record<string, WithSpringConfig> = {
    /** Gentle spring for sheet slide-in */
    gentle: { damping: 15, stiffness: 90 },
    /** Snappy spring for quick interactions */
    snappy: { damping: 22, stiffness: 180, mass: 0.8 },
    /** Bouncy spring for dialog scale-in */
    bouncy: { damping: 8, stiffness: 100 }, // Converted from friction/tension
    /** Smooth spring for tab/indicator slides */
    smooth: { damping: 10, stiffness: 65 },
    /** Popup spring for menu appearance */
    popup: { damping: 12, stiffness: 120 },
};

// ─── Overlay Animations ───────────────────────────────────────────────────────

/** Fade overlay in (opacity 0 → 1) */
export function animateOverlayIn(
    opacity: SharedValue<number>,
    duration: number = 400,
): void {
    opacity.value = withTiming(1, { duration });
}

/** Fade overlay out (opacity → 0) */
export function animateOverlayOut(
    opacity: SharedValue<number>,
    duration: number = 400,
): void {
    opacity.value = withTiming(0, { duration });
}

// ─── Sheet Animations ─────────────────────────────────────────────────────────

export function animateSheetIn(
    translateY: SharedValue<number>,
    config: { duration?: number } = { duration: 400 },
): void {
    translateY.value = withTiming(0, {
        duration: config.duration || 400,
        easing: Easing.out(Easing.cubic),
    });
}

/** Slide sheet out to bottom */
export function animateSheetOut(
    translateY: SharedValue<number>,
    toValue: number = 400,
    duration: number = 400,
): void {
    translateY.value = withTiming(toValue, { duration });
}

// ─── Scale Animations ─────────────────────────────────────────────────────────

export function animateScaleIn(
    scale: SharedValue<number>,
    config: { duration?: number } = { duration: 400 },
): void {
    scale.value = withTiming(1, {
        duration: config.duration || 400,
        easing: Easing.out(Easing.cubic),
    });
}

/** Scale dialog out (→ 0.85) with timing */
export function animateScaleOut(
    scale: SharedValue<number>,
    toValue: number = 0.85,
    duration: number = 400,
): void {
    scale.value = withTiming(toValue, { duration });
}

// ─── Composite Patterns ───────────────────────────────────────────────────────

/**
 * Standard overlay + sheet open animation
 * Used by: WalletModal, TransactionModal, EditWalletModal
 */
export function animateModalOpen(
    overlayOpacity: SharedValue<number>,
    sheetTranslateY: SharedValue<number>,
    config?: { duration?: number },
): void {
    animateOverlayIn(overlayOpacity);
    animateSheetIn(sheetTranslateY, config);
}

/**
 * Standard overlay + sheet close animation
 * Calls onComplete when finished
 */
export function animateModalClose(
    overlayOpacity: SharedValue<number>,
    sheetTranslateY: SharedValue<number>,
    onComplete?: () => void,
    sheetToValue?: number,
): void {
    animateOverlayOut(overlayOpacity);
    
    // We only attach the callback to the sheet animation since they run in parallel
    // and take the same duration (400ms).
    sheetTranslateY.value = withTiming(
        sheetToValue ?? 400,
        { duration: 400 },
        (finished) => {
            if (finished && onComplete) {
                runOnJS(onComplete)();
            }
        }
    );
}

/**
 * Standard overlay + scale dialog open animation
 * Used by: ConfirmDialog, InfoDialog, ConfirmImportDialog
 */
export function animateDialogOpen(
    overlayOpacity: SharedValue<number>,
    scale: SharedValue<number>,
): void {
    overlayOpacity.value = 0;
    scale.value = 0.85;
    
    animateOverlayIn(overlayOpacity, 400);
    animateScaleIn(scale);
}

/**
 * Standard overlay + scale dialog close animation
 * Calls onComplete when finished
 */
export function animateDialogClose(
    overlayOpacity: SharedValue<number>,
    scale: SharedValue<number>,
    onComplete?: () => void,
): void {
    animateOverlayOut(overlayOpacity, 400);
    
    scale.value = withTiming(
        0.85,
        { duration: 400 },
        (finished) => {
            if (finished && onComplete) {
                runOnJS(onComplete)();
            }
        }
    );
}

/**
 * Shared infinite pulse animation for skeletons.
 * Returns a style object that can be applied to an Animated.View from react-native-reanimated.
 */

export function usePulseAnimation() {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.6, { duration: 800 }),
                withTiming(0.3, { duration: 800 })
            ),
            -1, // infinite
            true // reverse
        );
    }, [opacity]);

    return useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));
}
