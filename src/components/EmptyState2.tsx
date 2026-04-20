/**
 * EmptyState2.tsx — Reusable empty state component with Lottie animation
 * Features high-fidelity Liquid Glass background from LiquidButton2
 */

import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import { FontSizes } from '../common/theme';

const ANIMATIONS = {
    nodata: require('../assets/Lottie Animation/nodata.json'),
    noresult: require('../assets/Lottie Animation/No Result Green theme.json'),
} as const;

interface EmptyState2Props {
    animation?: keyof typeof ANIMATIONS;
    title: string;
    subtitle?: string;
    animationSize?: number;
    style?: StyleProp<ViewStyle>;
}

const EmptyState2: React.FC<EmptyState2Props> = ({
    animation = 'nodata',
    title,
    subtitle,
    animationSize = 160,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.content}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        paddingTop: 48,
        paddingBottom: 48,
        paddingHorizontal: 24,
    },
    title: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: '#FFFFFF',
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

export default React.memo(EmptyState2);
