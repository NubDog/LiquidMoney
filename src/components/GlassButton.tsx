/**
 * GlassButton.tsx — Nút bấm Glassmorphism có hiệu ứng nhấn
 * Sử dụng React Native Animated API cho animation spring khi press
 */

import React, { useRef } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    type ViewStyle,
} from 'react-native';

// ─── Props ────────────────────────────────────────────────────────────────────

interface GlassButtonProps {
    /** Callback khi nhấn */
    onPress: () => void;
    /** Nhãn hiển thị trên nút */
    title?: string;
    /** Nội dung tùy chỉnh (ưu tiên hơn title) */
    children?: React.ReactNode;
    /** Style bổ sung */
    style?: ViewStyle;
    /** Vô hiệu hóa nút */
    disabled?: boolean;
    /** Biến thể giao diện */
    variant?: 'filled' | 'outline';
}

// ─── Animated Pressable ───────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Cấu hình spring cho press animation ─────────────────────────────────────

const SPRING_CONFIG = {
    useNativeDriver: true,
    friction: 6,
    tension: 120,
};

// ─── Component ────────────────────────────────────────────────────────────────

const GlassButton: React.FC<GlassButtonProps> = ({
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
            Animated.spring(scale, { ...SPRING_CONFIG, toValue: 0.95 }),
            Animated.spring(opacityAnim, { ...SPRING_CONFIG, toValue: 0.8 }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scale, { ...SPRING_CONFIG, toValue: 1 }),
            Animated.spring(opacityAnim, { ...SPRING_CONFIG, toValue: 1 }),
        ]).start();
    };

    const isFilled = variant === 'filled';

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={[
                styles.base,
                isFilled ? styles.filled : styles.outline,
                disabled && styles.disabled,
                { transform: [{ scale }], opacity: opacityAnim },
                style,
            ]}>
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    base: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    filled: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    outline: {
        backgroundColor: 'transparent',
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    disabled: {
        opacity: 0.4,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    textFilled: {
        color: '#FFFFFF',
    },
    textOutline: {
        color: 'rgba(255, 255, 255, 0.85)',
    },
});

export default GlassButton;
