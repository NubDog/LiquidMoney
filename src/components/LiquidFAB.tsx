/**
 * LiquidFAB.tsx — Apple Liquid Glass Floating Action Button
 * Clean glass effect — no layered highlights that create visible edges
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
                {/* Single glass layer — no split highlights */}
                <View style={styles.glassBg} />

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
        // Subtle outer glow
        shadowColor: 'rgba(255, 255, 255, 0.20)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 10,
    },
    button: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        // Glass border — slight top highlight via borderTopColor
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.18)',
        borderTopColor: 'rgba(255, 255, 255, 0.30)',
    },
    glassBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(25, 25, 30, 0.70)',
    },
    icon: {
        zIndex: 10,
    },
});

export default LiquidFAB;
