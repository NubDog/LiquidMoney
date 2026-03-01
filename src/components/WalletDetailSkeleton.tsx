/**
 * WalletDetailSkeleton.tsx — Premium skeleton loader for WalletDetailScreen
 * Uses Reanimated 4 withRepeat + withTiming for breathing pulse effect
 * Pure UI — zero data dependencies, zero Zustand, zero side effects
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';

// ─── Constants ────────────────────────────────────────────────────────────────

const PULSE_DURATION = 1200;
const OPACITY_MIN = 0.3;
const OPACITY_MAX = 0.7;

const SKELETON_BASE_COLOR = 'rgba(255, 255, 255, 0.06)';
const SKELETON_HIGHLIGHT_COLOR = 'rgba(255, 255, 255, 0.12)';

// ─── Shared Pulse Hook ────────────────────────────────────────────────────────

const usePulseAnimation = () => {
    const pulseAnim = useRef(new Animated.Value(OPACITY_MIN)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: OPACITY_MAX,
                    duration: PULSE_DURATION,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: OPACITY_MIN,
                    duration: PULSE_DURATION,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, [pulseAnim]);

    return pulseAnim;
};

// ─── Skeleton Bar ─────────────────────────────────────────────────────────────

interface SkeletonBarProps {
    width: number | string;
    height: number;
    borderRadius?: number;
    style?: object;
}

const SkeletonBar: React.FC<SkeletonBarProps> = React.memo(({
    width,
    height,
    borderRadius = 8,
    style,
}) => {
    const pulseAnim = usePulseAnimation();

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height,
                    borderRadius,
                    backgroundColor: SKELETON_HIGHLIGHT_COLOR,
                    opacity: pulseAnim,
                },
                style,
            ]}
        />
    );
});

// ─── Skeleton Circle ──────────────────────────────────────────────────────────

interface SkeletonCircleProps {
    size: number;
    style?: object;
}

const SkeletonCircle: React.FC<SkeletonCircleProps> = React.memo(({ size, style }) => {
    const pulseAnim = usePulseAnimation();

    return (
        <Animated.View
            style={[
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: SKELETON_HIGHLIGHT_COLOR,
                    opacity: pulseAnim,
                },
                style,
            ]}
        />
    );
});

// ─── Transaction Item Skeleton ────────────────────────────────────────────────

const TransactionItemSkeleton: React.FC = React.memo(() => (
    <View style={skeletonStyles.txItem}>
        <SkeletonCircle size={44} />
        <View style={skeletonStyles.txTextContainer}>
            <SkeletonBar width="65%" height={14} />
            <SkeletonBar width="40%" height={10} style={{ marginTop: 8 }} />
        </View>
        <SkeletonBar width={72} height={16} borderRadius={6} />
    </View>
));

// ─── Main Skeleton Component ──────────────────────────────────────────────────

const WalletDetailSkeleton: React.FC = () => {
    return (
        <View style={skeletonStyles.container}>
            {/* ── Summary Card Skeleton ── */}
            <View style={skeletonStyles.summaryCard}>
                {/* Wallet name */}
                <SkeletonBar width="45%" height={18} style={{ marginBottom: 16 }} />
                {/* Balance label */}
                <SkeletonBar width="35%" height={11} style={{ marginBottom: 8 }} />
                {/* Balance amount */}
                <SkeletonBar width="70%" height={30} borderRadius={10} style={{ marginBottom: 20 }} />
                {/* Two columns */}
                <View style={skeletonStyles.summaryRow}>
                    <View style={skeletonStyles.summaryCol}>
                        <SkeletonBar width="60%" height={10} style={{ marginBottom: 6 }} />
                        <SkeletonBar width="80%" height={14} />
                    </View>
                    <View style={skeletonStyles.summaryCol}>
                        <SkeletonBar width="60%" height={10} style={{ marginBottom: 6 }} />
                        <SkeletonBar width="80%" height={14} />
                    </View>
                </View>
            </View>

            {/* ── Filter Bar Skeleton ── */}
            <View style={skeletonStyles.filterBar}>
                <SkeletonBar width="100%" height={44} borderRadius={22} />
            </View>

            {/* ── Section Title Skeleton ── */}
            <SkeletonBar width="40%" height={13} style={{ marginBottom: 16 }} />

            {/* ── Transaction Items Skeleton ── */}
            <TransactionItemSkeleton />
            <TransactionItemSkeleton />
            <TransactionItemSkeleton />
            <TransactionItemSkeleton />
            <TransactionItemSkeleton />
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const skeletonStyles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 4,
    },
    summaryCard: {
        backgroundColor: SKELETON_BASE_COLOR,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        padding: 20,
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 16,
    },
    summaryCol: {
        flex: 1,
    },
    filterBar: {
        marginBottom: 16,
    },
    txItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: SKELETON_BASE_COLOR,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.04)',
        padding: 14,
        marginBottom: 10,
    },
    txTextContainer: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },
});

export default WalletDetailSkeleton;
