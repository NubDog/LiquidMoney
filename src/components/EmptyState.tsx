/**
 * EmptyState.tsx — Reusable empty state component with Lottie animation
 * Refactored text colors for better contrast on glass
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { FontSizes } from '../common/theme';

const ANIMATIONS = {
    nodata: require('../assets/Lottie Animation/nodata.json'),
    noresult: require('../assets/Lottie Animation/No Result Green theme.json'),
} as const;

interface EmptyStateProps {
    animation?: keyof typeof ANIMATIONS;
    title: string;
    subtitle?: string;
    animationSize?: number;
}

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

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingTop: 48,
        paddingBottom: 48,
    },
    title: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: '#FFFFFF', // High contrast
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default React.memo(EmptyState);
