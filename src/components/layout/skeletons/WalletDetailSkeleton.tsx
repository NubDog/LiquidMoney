import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Spacing, Radii } from '../../../common/theme';

import { AppleSummaryCardSkeleton } from './AppleSummaryCardSkeleton';
import { FilterSkeleton } from './FilterSkeleton';
import { AppleTransactionRowSkeleton } from './AppleTransactionRowSkeleton';

export const WalletDetailSkeleton = () => {
    // Pulse animation shared among all skeleton children
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
            <AppleSummaryCardSkeleton pulseAnim={pulseAnim} />

            <FilterSkeleton pulseAnim={pulseAnim} />

            {/* Title Skel */}
            <View style={styles.sectionTitleWrap}>
                <Animated.View style={[styles.shimmerBox, { width: 130, height: 20, opacity: pulseAnim }]} />
            </View>

            {/* List Skel perfectly matching AppleTransactionRow */}
            <View>
                {[1, 2, 3, 4, 5, 6].map((key) => (
                    <AppleTransactionRowSkeleton key={key} pulseAnim={pulseAnim} />
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
    sectionTitleWrap: {
        marginBottom: 12,
    },
    shimmerBox: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: Radii.sm,
    },
});
