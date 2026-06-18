import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Spacing, Radii } from '../../../common/theme';

interface Props {
    pulseStyle: any;
}

export const AppleSummaryCardSkeleton: React.FC<Props> = ({ pulseStyle }) => {
    return (
        <View style={styles.headerCard}>
            <View style={styles.headerCardInner}>
                {/* Wallet Name */}
                <Animated.View style={[styles.shimmerBox, { width: 100, height: 20, marginBottom: Spacing.sm }, pulseStyle]} />
                
                {/* Balance Label */}
                <Animated.View style={[styles.shimmerBox, { width: 90, height: 16, marginTop: Spacing.xs }, pulseStyle]} />
                
                {/* Balance Amount */}
                <Animated.View style={[styles.shimmerBox, { width: '60%', height: 44, marginTop: 4 }, pulseStyle]} />
                
                {/* Balance Row */}
                <View style={styles.headerRow}>
                    <View style={{flex: 1}}>
                        <Animated.View style={[styles.shimmerBox, { width: 50, height: 14, marginBottom: 4 }, pulseStyle]} />
                        <Animated.View style={[styles.shimmerBox, { width: 100, height: 20 }, pulseStyle]} />
                    </View>
                    <View style={{flex: 1}}>
                        <Animated.View style={[styles.shimmerBox, { width: 70, height: 14, marginBottom: 4 }, pulseStyle]} />
                        <Animated.View style={[styles.shimmerBox, { width: 120, height: 20 }, pulseStyle]} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
    shimmerBox: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: Radii.sm,
    },
});
