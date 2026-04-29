import React, { useRef } from 'react';
import { StyleSheet, View, type ViewStyle, type StyleProp, Animated, Pressable } from 'react-native';
import AppleGlassBackground from '../ui/AppleGlassBackground';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = {
    useNativeDriver: true,
    friction: 7,
    tension: 100,
};

interface IconButtonProps {
    icon: React.ReactNode;
    size?: number;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
    disableBlur?: boolean;
    disabled?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({ 
    icon, 
    size = 64, 
    onPress, 
    style, 
    disableBlur = false, 
    disabled = false 
}) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, { ...SPRING_CONFIG, toValue: 0.94 }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, { ...SPRING_CONFIG, toValue: 1 }).start();
    };

    const innerContent = (
        <View style={[styles.content, { height: size, minHeight: size }]} collapsable={false}>
            <View style={styles.iconWrapper}>{icon}</View>
        </View>
    );

    const containerStyle = [
        { width: size, height: size },
        { transform: [{ scale }] },
        disabled && { opacity: 0.5 },
        style
    ];

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={containerStyle}
        >
            {disableBlur ? (
                <View style={[styles.solidBackground, { borderRadius: size / 2 }]}>
                    {innerContent}
                </View>
            ) : (
                <AppleGlassBackground
                    variant="chromeMaterial"
                    borderRadius={size / 2}
                    fillContainer
                >
                    {innerContent}
                </AppleGlassBackground>
            )}
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    solidBackground: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
        flex: 1,
    },
    content: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    iconWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default IconButton;
