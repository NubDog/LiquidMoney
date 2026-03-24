import React, { useRef } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    type ViewStyle,
    View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';

interface LiquidButtonProps {
    onPress: () => void;
    title?: string;
    children?: React.ReactNode;
    style?: ViewStyle;
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
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={[
                styles.base,
                disabled && styles.disabled,
                { transform: [{ scale }], opacity: opacityAnim },
                style,
            ]}>
            {isFilled && (
                <View style={[StyleSheet.absoluteFill, { borderRadius: 16, overflow: 'hidden' }]}>
                    <BlurView 
                        style={StyleSheet.absoluteFill} 
                        blurType="light"
                        blurAmount={20}
                        overlayColor="rgba(255, 255, 255, 0.08)"
                    />
                </View>
            )}
            
            {(isFilled || isOutline) && (
                <View style={[
                    StyleSheet.absoluteFill, 
                    styles.borderHighlight,
                    isFilled ? styles.borderFilled : styles.borderOutline
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
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    borderHighlight: {
        borderRadius: 16,
        borderWidth: 1,
    },
    borderFilled: {
        borderBottomWidth: 0,
        borderRightWidth: 0,
        borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    borderOutline: {
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    disabled: {
        opacity: 0.4,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
        zIndex: 1,
    },
    textFilled: {
        color: '#FFFFFF',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    textOutline: {
        color: 'rgba(255, 255, 255, 0.95)',
    },
});

export default LiquidButton;
