import React, { useRef } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    type ViewStyle,
    type StyleProp,
    View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useLiquidContext } from './LiquidContext';

interface LiquidButtonProps {
    onPress: () => void;
    title?: string;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
    variant?: 'filled' | 'outline' | 'ghost';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = {
    useNativeDriver: true,
    friction: 7,
    tension: 100,
};

const LiquidButton: React.FC<LiquidButtonProps> = ({
    onPress,
    title,
    children,
    style,
    disabled = false,
    variant = 'filled',
}) => {
    const { isInsideGlass } = useLiquidContext();
    const scale = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scale, { ...SPRING_CONFIG, toValue: 0.96 }),
            Animated.spring(opacityAnim, { ...SPRING_CONFIG, toValue: 0.85 }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scale, { ...SPRING_CONFIG, toValue: 1 }),
            Animated.spring(opacityAnim, { ...SPRING_CONFIG, toValue: 1 }),
        ]).start();
    };

    const isFilled = variant === 'filled';
    const isOutline = variant === 'outline';

    return (
        <AnimatedPressable
            onPress={() => {
                if (!disabled && onPress) {
                    onPress();
                }
            }}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
                styles.base,
                disabled && styles.disabled,
                { transform: [{ scale }], opacity: opacityAnim },
                style,
            ]}>
            {isFilled && !isInsideGlass && (
                <View style={[StyleSheet.absoluteFill, { borderRadius: 9999, overflow: 'hidden' }]}>
                    {/* @ts-ignore: overlayColor is valid on Android but missing from the generic TS definition */}
                    <BlurView
                        style={[StyleSheet.absoluteFill, { top: -6, bottom: -6, left: -6, right: -6 }]}
                        blurType="light"
                        blurAmount={4}
                        overlayColor="transparent"
                        reducedTransparencyFallbackColor="transparent"
                    />
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.05)' }]} />
                </View>
            )}

            {isFilled && isInsideGlass && (
                <View style={[
                    StyleSheet.absoluteFill, 
                    { 
                        borderRadius: 9999, 
                        // Simulate frosted thickness without double blurring
                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        borderWidth: StyleSheet.hairlineWidth,
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                    }
                ]} />
            )}

            {(isFilled || isOutline) && (
                <View style={[
                    StyleSheet.absoluteFill,
                    {
                        borderRadius: 9999,
                        borderWidth: StyleSheet.hairlineWidth,
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        ...(isFilled ? { borderBottomWidth: 0, borderRightWidth: 0 } : {}),
                    }
                ]} pointerEvents="none" />
            )}

            {children ?? (
                <Text
                    style={[
                        styles.text,
                        isFilled ? styles.textFilled : styles.textOutline,
                    ]}>
                    {title}
                </Text>
            )}
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    base: {
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabled: {
        opacity: 0.4,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: -0.2,
        zIndex: 1,
    },
    textFilled: {
        color: '#FFFFFF',
    },
    textOutline: {
        color: 'rgba(255, 255, 255, 0.95)',
    },
});

export default LiquidButton;
