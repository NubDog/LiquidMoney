import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Spacing, Radii } from '../../../common/theme';
import { usePulseAnimation } from '../../../common/animations';

import { AppleSummaryCardSkeleton } from './AppleSummaryCardSkeleton';
import { FilterSkeleton } from './FilterSkeleton';
import { AppleTransactionRowSkeleton } from './AppleTransactionRowSkeleton';

export const WalletDetailSkeleton = () => {
    // Shared native pulse animation for all skeleton children
    const pulseStyle = usePulseAnimation();

    return (
        <View style={styles.container}>
            <AppleSummaryCardSkeleton pulseStyle={pulseStyle} />

            <FilterSkeleton pulseStyle={pulseStyle} />

            {/* Title Skel */}
            <View style={styles.sectionTitleWrap}>
                <Animated.View style={[styles.shimmerBox, { width: 130, height: 20 }, pulseStyle]} />
            </View>

            {/* List Skel perfectly matching AppleTransactionRow */}
            <View>
                {[1, 2, 3, 4, 5, 6].map((key) => (
                    <AppleTransactionRowSkeleton key={key} pulseStyle={pulseStyle} />
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
