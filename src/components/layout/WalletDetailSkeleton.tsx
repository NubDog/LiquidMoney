/**
 * WalletDetailSkeleton.tsx
 * Shimmer effect perfectly matching AppleTransactionRow and WalletDetailScreen layout
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Spacing, Radii } from '../../common/theme';

export const WalletDetailSkeleton = () => {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.7,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.3,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, [pulseAnim]);

    return (
        <View style={styles.container}>
            {/* Wallet Info Skel perfectly matching AppleSummaryCard */}
            <View style={styles.headerCard}>
                <View style={styles.headerCardInner}>
                    {/* Wallet Name */}
                    <Animated.View style={[styles.shimmerBox, { width: 100, height: 20, opacity: pulseAnim, marginBottom: Spacing.sm }]} />
                    
                    {/* Balance Label */}
                    <Animated.View style={[styles.shimmerBox, { width: 90, height: 16, marginTop: Spacing.xs, opacity: pulseAnim }]} />
                    
                    {/* Balance Amount */}
                    <Animated.View style={[styles.shimmerBox, { width: '60%', height: 44, marginTop: 4, opacity: pulseAnim }]} />
                    
                    {/* Balance Row */}
                    <View style={styles.headerRow}>
                        <View style={{flex: 1}}>
                            <Animated.View style={[styles.shimmerBox, { width: 50, height: 14, marginBottom: 4, opacity: pulseAnim }]} />
                            <Animated.View style={[styles.shimmerBox, { width: 100, height: 20, opacity: pulseAnim }]} />
                        </View>
                        <View style={{flex: 1}}>
                            <Animated.View style={[styles.shimmerBox, { width: 70, height: 14, marginBottom: 4, opacity: pulseAnim }]} />
                            <Animated.View style={[styles.shimmerBox, { width: 120, height: 20, opacity: pulseAnim }]} />
                        </View>
                    </View>
                </View>
            </View>

            {/* Filter Skel perfectly matching AppleSegmentedControl */}
            <View style={styles.filterWrapper}>
                <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.03)', opacity: pulseAnim }]} />
            </View>

            {/* Title Skel */}
            <View style={styles.sectionTitleWrap}>
                <Animated.View style={[styles.shimmerBox, { width: 130, height: 20, opacity: pulseAnim }]} />
            </View>

            {/* List Skel perfectly matching AppleTransactionRow */}
            <View style={styles.list}>
                {[1, 2, 3, 4, 5, 6].map((key) => (
                    <View key={key} style={styles.rowCard}>
                        <View style={styles.rowContent}>
                            <Animated.View style={[styles.avatarSkel, { opacity: pulseAnim }]} />
                            <View style={styles.textWrap}>
                                <Animated.View style={[styles.shimmerBox, { width: '70%', height: 20, marginBottom: 2, opacity: pulseAnim }]} />
                                <Animated.View style={[styles.shimmerBox, { width: '40%', height: 16, opacity: pulseAnim }]} />
                            </View>
                            <Animated.View style={[styles.shimmerBox, { width: 80, height: 20, opacity: pulseAnim }]} />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Spacing.xl,
        paddingHorizontal: Spacing.md,
    },
    
    // Header
    headerCard: {
        marginBottom: Spacing.xl,
        backgroundColor: '#1C1C1E', // Apple Dark Mode Elevated Card
        borderRadius: Radii.xxl,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    headerCardInner: {
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.xl,
        paddingHorizontal: Spacing.xl,
    },
    headerRow: {
        flexDirection: 'row',
        marginTop: Spacing.xl,
        gap: Spacing.md,
    },
    
    // Filter
    filterWrapper: {
        marginBottom: Spacing.xl,
        height: 44, // Exact height of AppleSegmentedControl
        borderRadius: Radii.xl,
        backgroundColor: '#1C1C1E', // Match AppleSegmentedControl background
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.1)',
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
        backgroundColor: '#1C1C1E', // Match AppleTransactionRow background
        borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
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
        borderRadius: Radii.pill,
        backgroundColor: 'rgba(255,255,255,0.12)',
        marginRight: Spacing.md,
    },
    textWrap: {
        flex: 1,
        justifyContent: 'center',
        marginRight: Spacing.xs,
    },
});
