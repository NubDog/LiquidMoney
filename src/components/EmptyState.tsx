/**
 * EmptyState.tsx — Reusable empty state component with Lottie animation
 * Consolidates 3 duplicate empty state implementations from
 * HomeScreen, StatsScreen, and WalletDetailScreen.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { Colors, FontSizes } from '../common/theme';

// ─── Animation Sources ────────────────────────────────────────────────────────

const ANIMATIONS = {
    nodata: require('../assets/Lottie Animation/nodata.json'),
    noresult: require('../assets/Lottie Animation/No Result Green theme.json'),
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface EmptyStateProps {
    /** Which Lottie animation to show */
    animation?: keyof typeof ANIMATIONS;
    /** Main message */
    title: string;
    /** Secondary helper text */
    subtitle?: string;
    /** Custom size for the Lottie animation */
    animationSize?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

const EmptyState: React.FC<EmptyStateProps> = ({
    animation = 'nodata',
    title,
    subtitle,
    animationSize = 160,
}) => (
    <View style={styles.container}>
        <LottieView
            source={ANIMATIONS[animation]}
            autoPlay
            loop
            style={{ width: animationSize, height: animationSize, marginBottom: 8 }}
        />
        <Text style={styles.title}>{title}</Text>
        {subtitle ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
        ) : null}
    </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingTop: 48,
        paddingBottom: 48,
    },
    title: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.textSecondary,
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: Colors.textMuted,
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default React.memo(EmptyState);
