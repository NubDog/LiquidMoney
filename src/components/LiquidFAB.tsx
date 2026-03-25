import React, { useRef } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    View,
    type ViewStyle,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { BlurView } from '@react-native-community/blur';

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
                
                <View style={[StyleSheet.absoluteFill, { borderRadius: FAB_SIZE / 2, overflow: 'hidden' }]}>
                    <BlurView 
                        style={StyleSheet.absoluteFill} 
                        blurType="light"
                        blurAmount={20}
                        overlayColor="transparent"
                        reducedTransparencyFallbackColor="transparent"
                    />
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]} />
                </View>
                
                {/* Subtle border instead of volumetric cyan */}
                <View style={styles.innerHighlight} pointerEvents="none" />

                <Plus size={26} color="#FFFFFF" strokeWidth={3} style={styles.icon} />
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
        // Theming shadows
        shadowColor: 'rgba(0, 0, 0, 0.6)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 10,
    },
    button: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerHighlight: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: FAB_SIZE / 2,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    icon: {
        zIndex: 10,
    },
});

export default LiquidFAB;
