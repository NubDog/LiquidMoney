/**
 * WalletDetailSkeleton.tsx
 * Shimmer effect perfectly matching AppleTransactionRow and WalletDetailScreen layout
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Spacing, Radii } from '../../common/theme';
import AppleGlassBackground from '../ui/AppleGlassBackground';

export const WalletDetailSkeleton = () => {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.7,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.3,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, [pulseAnim]);

    return (
        <View style={styles.container}>
            {/* Wallet Info Skel perfectly matching the summaryCard layout */}
            <AppleGlassBackground variant="chromeMaterial" style={styles.headerCard} borderRadius={Radii.xxl}>
                <View style={styles.headerCardInner}>
                    <Animated.View style={[styles.shimmerBox, { width: 100, height: 20, opacity: pulseAnim }]} />
                    <Animated.View style={[styles.shimmerBox, { width: '60%', height: 38, marginTop: 12, opacity: pulseAnim }]} />
                    
                    <View style={styles.headerRow}>
                        <View style={{flex: 1}}>
                            <Animated.View style={[styles.shimmerBox, { width: 50, height: 14, marginBottom: 6, opacity: pulseAnim }]} />
                            <Animated.View style={[styles.shimmerBox, { width: 90, height: 18, opacity: pulseAnim }]} />
                        </View>
                        <View style={{flex: 1}}>
                            <Animated.View style={[styles.shimmerBox, { width: 70, height: 14, marginBottom: 6, opacity: pulseAnim }]} />
                            <Animated.View style={[styles.shimmerBox, { width: 110, height: 18, opacity: pulseAnim }]} />
                        </View>
                    </View>
                </View>
            </AppleGlassBackground>

            {/* Filter Skel */}
            <View style={styles.filterWrapper}>
                <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.08)', opacity: pulseAnim }]} />
            </View>

            {/* Title Skel */}
            <View style={styles.sectionTitleWrap}>
                <Animated.View style={[styles.shimmerBox, { width: 130, height: 20, opacity: pulseAnim }]} />
            </View>

            {/* List Skel perfectly matching AppleTransactionRow */}
            <View style={styles.list}>
                {[1, 2, 3, 4, 5, 6].map((key) => (
                    <AppleGlassBackground variant="chromeMaterial" key={key} style={styles.rowCard} borderRadius={Radii.xl}>
                        <View style={styles.rowContent}>
                            <Animated.View style={[styles.avatarSkel, { opacity: pulseAnim }]} />
                            <View style={styles.textWrap}>
                                <Animated.View style={[styles.shimmerBox, { width: '70%', height: 16, marginBottom: 6, opacity: pulseAnim }]} />
                                <Animated.View style={[styles.shimmerBox, { width: '40%', height: 14, opacity: pulseAnim }]} />
                            </View>
                            <Animated.View style={[styles.shimmerBox, { width: 75, height: 20, opacity: pulseAnim }]} />
                        </View>
                    </AppleGlassBackground>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Spacing.xl,
        paddingHorizontal: Spacing.md, // Match listContent paddingHorizontal
    },
    
    // Header
    headerCard: {
        marginBottom: Spacing.xl,
    },
    headerCardInner: {
        paddingTop: Spacing.md,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.lg,
    },
    headerRow: {
        flexDirection: 'row',
        marginTop: 24,
    },
    
    // Filter
    filterWrapper: {
        marginBottom: Spacing.xl,
        height: 44, // Approximate height of LiquidSegmentedControl2
        borderRadius: Radii.xl,
        backgroundColor: 'rgba(255,255,255,0.03)',
        overflow: 'hidden',
    },
    
    // Title
    sectionTitleWrap: {
        marginBottom: 12,
    },
    
    // List Rows
    list: {
        // No extra margin needed, matches FlatList
    },
    rowCard: {
        marginBottom: Spacing.sm,
        width: '100%',
    },
    rowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: 14,
    },
    
    // Elements
    shimmerBox: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: Radii.sm,
    },
    avatarSkel: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.12)',
        marginRight: Spacing.md,
    },
    textWrap: {
        flex: 1,
        marginRight: Spacing.md,
    },
});
