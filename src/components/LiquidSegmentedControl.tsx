import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { FontSizes, Radii } from '../common/theme';

interface Option {
    key: string;
    label: string;
}

interface LiquidSegmentedControlProps {
    options: Option[];
    selected: string;
    onChange: (key: string) => void;
    style?: ViewStyle;
}

const LiquidSegmentedControl: React.FC<LiquidSegmentedControlProps> = React.memo(({
    options,
    selected,
    onChange,
    style,
}) => {
    const [containerWidth, setContainerWidth] = useState(0);
    const leftAnim = useRef(new Animated.Value(0)).current;
    const rightAnim = useRef(new Animated.Value(0)).current;
    const prevIdx = useRef(options.findIndex(o => o.key === selected));

    const gap = 10;
    const padding = 4;
    const optionCount = options.length;
    const tabWidth = containerWidth > 0 ? (containerWidth - (padding * 2) - gap * (optionCount - 1)) / optionCount : 0;

    useEffect(() => {
        if (containerWidth <= 0 || tabWidth <= 0) { return; }
        const idx = options.findIndex(o => o.key === selected);
        
        const targetLeft = padding + idx * (tabWidth + gap);
        const targetRight = containerWidth - (targetLeft + tabWidth);

        if (idx === prevIdx.current) {
            // Initial snap
            leftAnim.setValue(targetLeft);
            rightAnim.setValue(targetRight);
            return;
        }

        const isMovingRight = idx > prevIdx.current;
        prevIdx.current = idx;

        // "Slime / Water Drop" Physics
        // The leading edge (head) springs tight and fast
        // The trailing edge (tail) lags behind and bounces smoothly
        const headStiff = 280;
        const headDamp = 18;
        const tailStiff = 120;
        const tailDamp = 14;

        Animated.parallel([
            Animated.spring(leftAnim, {
                toValue: targetLeft,
                damping: isMovingRight ? tailDamp : headDamp,
                stiffness: isMovingRight ? tailStiff : headStiff,
                mass: 1,
                useNativeDriver: false, // Animating layout properties
            }),
            Animated.spring(rightAnim, {
                toValue: targetRight,
                damping: isMovingRight ? headDamp : tailDamp,
                stiffness: isMovingRight ? headStiff : tailStiff,
                mass: 1,
                useNativeDriver: false,
            })
        ]).start();
    }, [selected, containerWidth, options, tabWidth, gap, leftAnim, rightAnim]);

    return (
        <View style={[styles.wrapper, style]}>
            <View style={[StyleSheet.absoluteFill, styles.trackBackground]} />
            <View
                style={styles.container}
                onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}>
                {containerWidth > 0 && (
                    <Animated.View
                        style={[
                            styles.indicatorWrapper,
                            {
                                left: leftAnim,
                                right: rightAnim,
                            },
                        ]}>
                        <BlurView 
                            style={[StyleSheet.absoluteFill, { top: -10, bottom: -10, left: -10, right: -10 }]} 
                            blurType="light" 
                            blurAmount={8} 
                            // @ts-ignore
                            overlayColor="transparent" 
                            reducedTransparencyFallbackColor="transparent"
                        />
                        <View style={[StyleSheet.absoluteFill, styles.indicatorOverlay]} />
                        <View style={[StyleSheet.absoluteFill, styles.indicatorBorder]} />
                    </Animated.View>
                )}
                {options.map(option => (
                    <Pressable
                        key={option.key}
                        style={[styles.tab, { width: tabWidth }]}
                        onPress={() => onChange(option.key)}>
                        <Text style={[
                            styles.text,
                            selected === option.key && styles.textActive,
                        ]}>
                            {option.label}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: Radii.lg,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)', // Track background
    },
    trackBackground: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    container: {
        flexDirection: 'row',
        gap: 10,
        padding: 4,
        position: 'relative',
    },
    tab: {
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: Radii.md,
        zIndex: 2,
    },
    text: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
    },
    textActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    indicatorWrapper: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        left: 4,
        borderRadius: Radii.md - 2,
        overflow: 'hidden',
        zIndex: 1,
    },
    indicatorOverlay: {
        backgroundColor: 'rgba(255, 255, 255, 0.02)', // Extremely thin, clear crystal overlay
    },
    indicatorBorder: {
        borderRadius: Radii.md - 2,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.3)', // Edge lighting
        borderBottomWidth: 0, // Rule: Anti-glowing band
        borderRightWidth: 0,
    },
});

export default LiquidSegmentedControl;
