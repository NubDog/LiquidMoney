/**
 * LiquidFAB.tsx — Floating Action Button phong cách Liquid Glass
 * Tròn, mờ, viền phát sáng nhẹ, giống VisionOS
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

interface LiquidFABProps {
    onPress: () => void;
    icon?: string; // Emoji hoặc ký tự
}

const LiquidFAB: React.FC<LiquidFABProps> = ({ onPress, icon = '＋' }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.9,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={({ pressed }) => [
                    styles.container,
                    pressed && styles.pressed,
                ]}>
                {/* Glow layer */}
                <View style={styles.glow} />

                {/* Inner content */}
                <Text style={styles.icon}>{icon}</Text>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        zIndex: 999,
        // Shadow (Glow effect)
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        elevation: 8,
    },
    container: {
        width: 64,
        height: 64,
        borderRadius: 32,
        // Glass effect
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    pressed: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    glow: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(168, 85, 247, 0.1)', // Tím nhẹ
        borderRadius: 32,
    },
    icon: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: '300',
        lineHeight: 36, // Center vertically tweaks
    },
});

export default LiquidFAB;
