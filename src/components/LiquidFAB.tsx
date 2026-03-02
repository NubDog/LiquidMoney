/**
 * LiquidFAB.tsx — Apple Liquid Glass Floating Action Button
 * Translucent glass effect with subtle white border and soft glow
 * Press-to-scale spring animation
 */

import React, { useRef } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    View,
    type ViewStyle,
} from 'react-native';
import { Plus } from 'lucide-react-native';

interface LiquidFABProps {
    onPress: () => void;
    style?: ViewStyle;
}

const FAB_SIZE = 58;

const LiquidFAB: React.FC<LiquidFABProps> = ({ onPress, style }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.85,
            damping: 12,
            stiffness: 300,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            damping: 10,
            stiffness: 200,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={[styles.wrapper, style, { transform: [{ scale }] }]}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.button}>
                {/* Glass background layers */}
                <View style={styles.glassBg} />

                {/* Top highlight — simulates light refraction */}
                <View style={styles.topHighlight} />

                {/* Bottom subtle gradient */}
                <View style={styles.bottomGlow} />

                {/* Plus icon */}
                <Plus size={26} color="#FFFFFF" strokeWidth={2.5} style={styles.icon} />
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        width: FAB_SIZE,
        height: FAB_SIZE,
        zIndex: 9999,
        // Liquid Glass glow
        shadowColor: 'rgba(255, 255, 255, 0.25)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 16,
        elevation: 12,
    },
    button: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        // Glass border
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    glassBg: {
        ...StyleSheet.absoluteFillObject,
        // Semi-transparent dark glass
        backgroundColor: 'rgba(30, 30, 35, 0.65)',
    },
    topHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '45%',
        borderTopLeftRadius: FAB_SIZE / 2,
        borderTopRightRadius: FAB_SIZE / 2,
        // Subtle top-half white glow (simulates glass reflection)
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    bottomGlow: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30%',
        borderBottomLeftRadius: FAB_SIZE / 2,
        borderBottomRightRadius: FAB_SIZE / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    icon: {
        zIndex: 10,
    },
});

export default LiquidFAB;
