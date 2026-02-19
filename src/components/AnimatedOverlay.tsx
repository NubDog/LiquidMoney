/**
 * AnimatedOverlay.tsx — Lớp phủ mờ dần (fade in/out) tái sử dụng
 * Thay thế overlays cứng trong các modal, hỗ trợ cả mở và đóng
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

interface AnimatedOverlayProps {
    visible: boolean;
    onPress?: () => void;
    children?: React.ReactNode;
    /** Thời gian animation (ms) */
    duration?: number;
    /** Màu overlay */
    color?: string;
}

const AnimatedOverlay: React.FC<AnimatedOverlayProps> = ({
    visible,
    onPress,
    children,
    duration = 250,
    color = 'rgba(0, 0, 0, 0.55)',
}) => {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(opacity, {
            toValue: visible ? 1 : 0,
            duration,
            useNativeDriver: true,
        }).start();
    }, [visible, duration, opacity]);

    if (!visible) { return null; }

    return (
        <Animated.View
            style={[
                StyleSheet.absoluteFill,
                { backgroundColor: color, opacity },
            ]}
            pointerEvents={visible ? 'auto' : 'none'}>
            {onPress ? (
                <Pressable style={StyleSheet.absoluteFill} onPress={onPress}>
                    {children}
                </Pressable>
            ) : (
                children
            )}
        </Animated.View>
    );
};

export default AnimatedOverlay;
