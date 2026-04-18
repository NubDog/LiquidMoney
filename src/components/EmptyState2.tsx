/**
 * EmptyState2.tsx — Reusable empty state component with Lottie animation
 * Features high-fidelity Liquid Glass background from LiquidButton2
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { FontSizes, Radii } from '../common/theme';

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
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const hasDimensions = dimensions.width > 0 && dimensions.height > 0;
    const cardRadius = Radii.xl;

    const onLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setDimensions({ width, height });
    };

    // Golden Ratio Optics
    const bloomThickness = hasDimensions ? Math.max(3, dimensions.height * 0.04) : 3;
    const coreThickness = hasDimensions ? Math.max(1, dimensions.height * 0.01) : 1;

    return (
        <View style={[styles.container, style]} onLayout={onLayout}>
            <View style={styles.glassWrapper}>
                {/* @ts-ignore */}
                <BlurView
                    blurType="light"
                    blurAmount={12}
                    overlayColor="transparent"
                    reducedTransparencyFallbackColor="transparent"
                >
                    {hasDimensions && (
                        <Svg width={dimensions.width} height={dimensions.height} style={StyleSheet.absoluteFill}>
                            <Defs>
                                {/* Inner ambient glass body */}
                                <RadialGradient id="glassBodyTL" cx="0%" cy="0%" rx="100%" ry="100%">
                                    <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.25" />
                                    <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.05" />
                                </RadialGradient>
                                <RadialGradient id="glassBodyBR" cx="100%" cy="100%" rx="100%" ry="100%">
                                    <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.15" />
                                    <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.02" />
                                </RadialGradient>

                                {/* --- TL BORDER GLOW (Golden Ratio 61.8%) --- */}
                                <RadialGradient id="tlGlow" cx="0%" cy="0%" rx="61.8%" ry="38.2%">
                                    <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1.0" />
                                    <Stop offset="0.08" stopColor="#FFFFFF" stopOpacity="0.8" />
                                    <Stop offset="0.25" stopColor="#FFFFFF" stopOpacity="0.35" />
                                    <Stop offset="0.618" stopColor="#FFFFFF" stopOpacity="0.1" />
                                    <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                                </RadialGradient>

                                {/* --- BR BORDER GLOW (Golden Ratio 61.8%) --- */}
                                <RadialGradient id="brGlow" cx="100%" cy="100%" rx="61.8%" ry="38.2%">
                                    <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.8" />
                                    <Stop offset="0.1" stopColor="#FFFFFF" stopOpacity="0.6" />
                                    <Stop offset="0.25" stopColor="#FFFFFF" stopOpacity="0.2" />
                                    <Stop offset="0.618" stopColor="#FFFFFF" stopOpacity="0.05" />
                                    <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                                </RadialGradient>
                            </Defs>

                            {/* Ambient body fill */}
                            <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="url(#glassBodyTL)" rx={cardRadius} />
                            <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="url(#glassBodyBR)" rx={cardRadius} />

                            {/* --- TOP LEFT HIGHLIGHT --- */}
                            <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#tlGlow)" strokeWidth={bloomThickness} opacity="0.35" rx={Math.max(0, cardRadius - 0.5)} />
                            <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#tlGlow)" strokeWidth={coreThickness} opacity="1.0" rx={Math.max(0, cardRadius - 0.5)} />

                            {/* --- BOTTOM RIGHT HIGHLIGHT --- */}
                            <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#brGlow)" strokeWidth={bloomThickness} opacity="0.35" rx={Math.max(0, cardRadius - 0.5)} />
                            <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#brGlow)" strokeWidth={coreThickness} opacity="1.0" rx={Math.max(0, cardRadius - 0.5)} />
                        </Svg>
                    )}

                    <View style={styles.content} collapsable={false}>
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
                </BlurView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
    },
    glassWrapper: {
        width: '100%',
        borderRadius: Radii.xl,
        overflow: 'hidden',
        backgroundColor: 'transparent',
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
