import React from 'react';
import { StyleSheet, Text, View, type ViewStyle, type StyleProp, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import AppleGlassBackground from '../ui/AppleGlassBackground';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = {
    damping: 7,
    stiffness: 100,
};

interface LiquidButton2Props {
    onPress: () => void;
    title: string;
    icon?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
    disableBlur?: boolean;
}

const LiquidButton2: React.FC<LiquidButton2Props> = ({
    onPress,
    title,
    icon,
    style,
    disabled = false,
    disableBlur = false,
}) => {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.94, SPRING_CONFIG);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, SPRING_CONFIG);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const innerContent = (
        <View style={styles.contentContainer} collapsable={false}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text key="text-clean" style={[styles.text, disabled && styles.disabledText]}>
                {title}
            </Text>
        </View>
    );

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={[
                animatedStyle,
                style,
                disabled && { opacity: 0.5 }
            ]}
        >
            {disableBlur ? (
                <View style={[styles.solidBackground, { borderRadius: 9999 }]}>
                    {innerContent}
                </View>
            ) : (
                <AppleGlassBackground
                    variant="chromeMaterial"
                    borderRadius={9999}
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
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 28,
    },
    iconContainer: {
        marginRight: 8,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
        backgroundColor: 'transparent',
    },
    disabledText: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
});

export default LiquidButton2;
