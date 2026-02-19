/**
 * LiquidFAB.tsx — Floating Action Button (FAB)
 * Redesigned: multi-layer glow, animated pulse, premium glass look
 */

import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    View,
    type ViewStyle,
} from 'react-native';
import { Plus } from 'lucide-react-native';

// ─── Props ────────────────────────────────────────────────────────────────────

interface LiquidFABProps {
    onPress: () => void;
    style?: ViewStyle;
}

// ─── Component ────────────────────────────────────────────────────────────────

const LiquidFAB: React.FC<LiquidFABProps> = ({ onPress, style }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Subtle breathing pulse animation
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.15,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ]),
        );
        pulse.start();
        return () => pulse.stop();
    }, [pulseAnim]);

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.88,
            useNativeDriver: true,
            friction: 5,
            tension: 200,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 4,
            tension: 150,
        }).start();
    };

    return (
        <View style={[styles.wrapper, style]}>
            {/* Outer glow ring — breathing animation */}
            <Animated.View
                style={[
                    styles.outerGlow,
                    { transform: [{ scale: pulseAnim }] },
                ]}
            />

            {/* Middle glow layer */}
            <View style={styles.middleGlow} />

            {/* Main button */}
            <Animated.View style={[styles.buttonWrapper, { transform: [{ scale }] }]}>
                <Pressable
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={({ pressed }) => [
                        styles.container,
                        pressed && styles.pressed,
                    ]}>
                    {/* Inner gradient layers */}
                    <View style={styles.innerGradient1} />
                    <View style={styles.innerGradient2} />

                    {/* Glass highlight — top edge */}
                    <View style={styles.glassHighlight} />

                    {/* Icon */}
                    <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
                </Pressable>
            </Animated.View>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const FAB_SIZE = 60;
const OUTER_SIZE = FAB_SIZE + 20;

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        width: OUTER_SIZE,
        height: OUTER_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
    outerGlow: {
        position: 'absolute',
        width: OUTER_SIZE,
        height: OUTER_SIZE,
        borderRadius: OUTER_SIZE / 2,
        backgroundColor: 'rgba(34, 211, 238, 0.08)',
    },
    middleGlow: {
        position: 'absolute',
        width: FAB_SIZE + 10,
        height: FAB_SIZE + 10,
        borderRadius: (FAB_SIZE + 10) / 2,
        backgroundColor: 'rgba(34, 211, 238, 0.12)',
    },
    buttonWrapper: {
        width: FAB_SIZE,
        height: FAB_SIZE,
    },
    container: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(34, 211, 238, 0.25)',
        borderWidth: 1.5,
        borderColor: 'rgba(34, 211, 238, 0.45)',
        overflow: 'hidden',

        // Shadow
        shadowColor: '#22d3ee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    pressed: {
        backgroundColor: 'rgba(34, 211, 238, 0.35)',
    },
    innerGradient1: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: FAB_SIZE / 2,
        backgroundColor: 'rgba(34, 211, 238, 0.15)',
        top: -FAB_SIZE * 0.3,
        height: FAB_SIZE * 0.6,
    },
    innerGradient2: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: FAB_SIZE / 2,
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
    },
    glassHighlight: {
        position: 'absolute',
        top: 2,
        left: FAB_SIZE * 0.15,
        right: FAB_SIZE * 0.15,
        height: FAB_SIZE * 0.25,
        borderRadius: FAB_SIZE * 0.2,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
});

export default LiquidFAB;
