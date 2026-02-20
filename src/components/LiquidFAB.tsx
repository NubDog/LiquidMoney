/**
 * LiquidFAB.tsx — Premium Floating Action Button
 * Aurora glow ring + breathing pulse + satisfying spring press
 * No external gradient lib — uses layered Views for aurora effect
 */

import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Platform,
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

// ─── Constants ────────────────────────────────────────────────────────────────

const FAB_SIZE = 56;
const RING_SIZE = FAB_SIZE + 12;
const AURA_SIZE = FAB_SIZE + 32;

// ─── Component ────────────────────────────────────────────────────────────────

const LiquidFAB: React.FC<LiquidFABProps> = ({ onPress, style }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const auraScale = useRef(new Animated.Value(0.95)).current;
    const auraOpacity = useRef(new Animated.Value(0.5)).current;
    const ringPulse = useRef(new Animated.Value(1)).current;

    // Breathing aura — soft expanding/contracting glow
    useEffect(() => {
        const breathe = Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(auraScale, {
                        toValue: 1.15,
                        duration: 2200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(auraOpacity, {
                        toValue: 0.2,
                        duration: 2200,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(auraScale, {
                        toValue: 0.95,
                        duration: 2200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(auraOpacity, {
                        toValue: 0.5,
                        duration: 2200,
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        );
        breathe.start();
        return () => breathe.stop();
    }, [auraScale, auraOpacity]);

    // Ring subtle pulse — offset phase from aura
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(ringPulse, {
                    toValue: 1.06,
                    duration: 1800,
                    useNativeDriver: true,
                }),
                Animated.timing(ringPulse, {
                    toValue: 1,
                    duration: 1800,
                    useNativeDriver: true,
                }),
            ]),
        );
        pulse.start();
        return () => pulse.stop();
    }, [ringPulse]);

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.82,
            useNativeDriver: true,
            friction: 5,
            tension: 300,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 3,
            tension: 180,
        }).start();
    };

    return (
        <View style={[styles.wrapper, style]}>
            {/* Layer 1: Outer diffused aura — breathing */}
            <Animated.View
                style={[
                    styles.aura,
                    {
                        opacity: auraOpacity,
                        transform: [{ scale: auraScale }],
                    },
                ]}
            />

            {/* Layer 2: Aurora ring — pulsing colored layers */}
            <Animated.View
                style={[
                    styles.ringOuter,
                    { transform: [{ scale: ringPulse }] },
                ]}>
                {/* Cyan half */}
                <View style={styles.ringCyan} />
                {/* Violet half */}
                <View style={styles.ringViolet} />
                {/* Inner mask — creates ring effect */}
                <View style={styles.ringMask} />
            </Animated.View>

            {/* Layer 3: Main button */}
            <Animated.View
                style={[styles.buttonOuter, { transform: [{ scale }] }]}>
                <Pressable
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.pressed,
                    ]}>
                    {/* Subtle glass shine at top */}
                    <View style={styles.glassShine} />
                    <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
                </Pressable>
            </Animated.View>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        width: AURA_SIZE,
        height: AURA_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
    aura: {
        position: 'absolute',
        width: AURA_SIZE,
        height: AURA_SIZE,
        borderRadius: AURA_SIZE / 2,
        backgroundColor: 'rgba(6, 182, 212, 0.08)',
    },

    // ── Aurora ring ──
    ringOuter: {
        position: 'absolute',
        width: RING_SIZE,
        height: RING_SIZE,
        borderRadius: RING_SIZE / 2,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringCyan: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: RING_SIZE,
        height: RING_SIZE / 2,
        backgroundColor: 'rgba(6, 182, 212, 0.55)',
    },
    ringViolet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: RING_SIZE,
        height: RING_SIZE / 2,
        backgroundColor: 'rgba(139, 92, 246, 0.45)',
    },
    ringMask: {
        width: RING_SIZE - 3,
        height: RING_SIZE - 3,
        borderRadius: (RING_SIZE - 3) / 2,
        backgroundColor: '#0d0d10',
    },

    // ── Button ──
    buttonOuter: {
        width: FAB_SIZE,
        height: FAB_SIZE,
    },
    button: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(6, 182, 212, 0.14)',
        borderWidth: 1,
        borderColor: 'rgba(6, 182, 212, 0.30)',
        overflow: 'hidden',
        ...(Platform.OS === 'ios'
            ? {
                shadowColor: '#06b6d4',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.45,
                shadowRadius: 14,
            }
            : {
                elevation: 10,
            }),
    },
    pressed: {
        backgroundColor: 'rgba(6, 182, 212, 0.28)',
        borderColor: 'rgba(6, 182, 212, 0.50)',
    },
    glassShine: {
        position: 'absolute',
        top: 1,
        left: FAB_SIZE * 0.2,
        right: FAB_SIZE * 0.2,
        height: FAB_SIZE * 0.22,
        borderRadius: FAB_SIZE * 0.15,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
});

export default LiquidFAB;
