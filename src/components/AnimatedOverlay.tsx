import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';

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
                { opacity },
            ]}
            pointerEvents={visible ? 'auto' : 'none'}>
            
            <View style={[StyleSheet.absoluteFill, { zIndex: 0 }]}>
                <BlurView 
                    style={StyleSheet.absoluteFill} 
                    blurType="dark"
                    blurAmount={25}
                    overlayColor="rgba(11, 15, 25, 0.65)"
                />
            </View>

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
