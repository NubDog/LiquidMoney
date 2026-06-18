import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';

interface AnimatedOverlayProps {
    visible: boolean;
    onPress?: () => void;
    children?: React.ReactNode;
    duration?: number;
    color?: string; // Kept for API compatibility but overridden by Glass
}

const AnimatedOverlay: React.FC<AnimatedOverlayProps> = ({
    visible,
    onPress,
    children,
    duration = 250,
}) => {
    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withTiming(visible ? 1 : 0, { duration });
    }, [visible, duration, opacity]);

    if (!visible) { return null; }

    return (
        <Animated.View
            style={[
                StyleSheet.absoluteFill,
                { opacity },
            ]}
            pointerEvents={visible ? 'auto' : 'none'}>
            
            <View style={[StyleSheet.absoluteFill, { zIndex: 0 }]} />

            {onPress ? (
                <Pressable style={[StyleSheet.absoluteFill, { zIndex: 1 }]} onPress={onPress}>
                    {children}
                </Pressable>
            ) : (
                <View style={{ zIndex: 1, flex: 1 }}>{children}</View>
            )}
        </Animated.View>
    );
};

export default AnimatedOverlay;
