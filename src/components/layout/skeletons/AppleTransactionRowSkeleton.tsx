import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Spacing, Radii } from '../../../common/theme';

interface Props {
    pulseAnim: Animated.Value;
}

export const AppleTransactionRowSkeleton: React.FC<Props> = ({ pulseAnim }) => {
    return (
        <View style={styles.rowCard}>
            <View style={styles.rowContent}>
                <Animated.View style={[styles.avatarSkel, { opacity: pulseAnim }]} />
                <View style={styles.textWrap}>
                    <Animated.View style={[styles.shimmerBox, { width: '70%', height: 20, marginBottom: 2, opacity: pulseAnim }]} />
                    <Animated.View style={[styles.shimmerBox, { width: '40%', height: 16, opacity: pulseAnim }]} />
                </View>
                <Animated.View style={[styles.shimmerBox, { width: 80, height: 20, opacity: pulseAnim }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
