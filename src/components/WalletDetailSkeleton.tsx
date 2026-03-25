/**
 * WalletDetailSkeleton.tsx
 * Shimmer effect utilizing the LiquidCard wrapper and Animated APIs
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Spacing, Radii } from '../common/theme';
import LiquidCard from './LiquidCard';

export const WalletDetailSkeleton = () => {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, [pulseAnim]);

    return (
        <View style={styles.container}>
            {/* Wallet Info Skel */}
            <LiquidCard style={styles.headerCard} intensity="light" borderRadius={Radii.xl}>
                <Animated.View style={[styles.shimmerBox, { width: 120, height: 20, opacity: pulseAnim }]} />
                <Animated.View style={[styles.shimmerBox, { width: 200, height: 40, marginTop: 12, opacity: pulseAnim }]} />
            </LiquidCard>

            {/* Title Skel */}
            <View style={{ paddingHorizontal: Spacing.xl, marginTop: Spacing.xxl }}>
                <Animated.View style={[styles.shimmerBox, { width: 140, height: 24, opacity: pulseAnim }]} />
            </View>

            {/* List Skel */}
            <View style={styles.list}>
                {[1, 2, 3, 4, 5].map((key) => (
                    <LiquidCard key={key} style={styles.rowCard} intensity="light" borderRadius={Radii.lg}>
                        <View style={styles.rowContent}>
                            <Animated.View style={[styles.avatarSkel, { opacity: pulseAnim }]} />
                            <View style={styles.textWrap}>
                                <Animated.View style={[styles.shimmerBox, { width: '80%', height: 16, marginBottom: 6, opacity: pulseAnim }]} />
                                <Animated.View style={[styles.shimmerBox, { width: '40%', height: 12, opacity: pulseAnim }]} />
                            </View>
                            <Animated.View style={[styles.shimmerBox, { width: 60, height: 20, opacity: pulseAnim }]} />
                        </View>
                    </LiquidCard>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Spacing.xl,
    },
    headerCard: {
        marginHorizontal: Spacing.xl,
        padding: Spacing.xl,
        alignItems: 'center',
    },
    shimmerBox: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: Radii.sm,
    },
    list: {
        marginTop: Spacing.md,
    },
    rowCard: {
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.sm,
        padding: Spacing.md,
    },
    rowContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarSkel: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginRight: Spacing.md,
    },
    textWrap: {
        flex: 1,
        marginRight: Spacing.md,
    },
});
