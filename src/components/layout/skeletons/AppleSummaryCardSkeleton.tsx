import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Spacing, Radii } from '../../../common/theme';

interface Props {
    pulseAnim: Animated.Value;
}

export const AppleSummaryCardSkeleton: React.FC<Props> = ({ pulseAnim }) => {
    return (
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
