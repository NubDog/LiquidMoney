import React, { useState } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    View,
    ViewStyle,
    StyleProp,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

interface IconButtonProps {
    icon: React.ReactNode;
    size?: number;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const IconButton: React.FC<IconButtonProps> = ({ icon, size = 64, onPress, style }) => {
    const [scale] = useState(new Animated.Value(1));

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.92,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
        }).start();
    };

    const coreThickness = 0.5;
    const bloomThickness = 2.0;

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
                styles.container,
                { width: size, height: size, borderRadius: size / 2, transform: [{ scale }] },
                style,
            ]}
        >
            <View style={[styles.glassWrapper, { borderRadius: size / 2 }]}>
                {/* @ts-ignore */}
                <BlurView
                    blurType="light"
                    blurAmount={30}
                    style={StyleSheet.absoluteFill}
                    overlayColor="transparent"
                    reducedTransparencyFallbackColor="transparent"
                >
                    <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
                        <Defs>
                            <RadialGradient id="glassBodyTL" cx="0%" cy="0%" rx="100%" ry="100%">
                                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.15" />
                                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                            </RadialGradient>
                            <RadialGradient id="glassBodyBR" cx="100%" cy="100%" rx="100%" ry="100%">
                                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.08" />
                                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                            </RadialGradient>

                            {/* Border glow */}
                            <RadialGradient id="tlGlow" cx="0%" cy="0%" rx="61.8%" ry="38.2%">
                                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1.0" />
                                <Stop offset="0.08" stopColor="#FFFFFF" stopOpacity="0.8" />
                                <Stop offset="0.25" stopColor="#FFFFFF" stopOpacity="0.35" />
                                <Stop offset="0.618" stopColor="#FFFFFF" stopOpacity="0.1" />
                                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                            </RadialGradient>

                            <RadialGradient id="brGlow" cx="100%" cy="100%" rx="61.8%" ry="38.2%">
                                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.8" />
                                <Stop offset="0.1" stopColor="#FFFFFF" stopOpacity="0.6" />
                                <Stop offset="0.25" stopColor="#FFFFFF" stopOpacity="0.2" />
                                <Stop offset="0.618" stopColor="#FFFFFF" stopOpacity="0.05" />
                                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                            </RadialGradient>
                        </Defs>

                        <Rect x="0" y="0" width={size} height={size} fill="url(#glassBodyTL)" rx={size / 2} />
                        <Rect x="0" y="0" width={size} height={size} fill="url(#glassBodyBR)" rx={size / 2} />

                        <Rect x="0.5" y="0.5" width={size - 1} height={size - 1} fill="none" stroke="url(#tlGlow)" strokeWidth={bloomThickness} opacity="0.35" rx={(size - 1) / 2} />
                        <Rect x="0.5" y="0.5" width={size - 1} height={size - 1} fill="none" stroke="url(#tlGlow)" strokeWidth={coreThickness} opacity="1.0" rx={(size - 1) / 2} />

                        <Rect x="0.5" y="0.5" width={size - 1} height={size - 1} fill="none" stroke="url(#brGlow)" strokeWidth={bloomThickness} opacity="0.35" rx={(size - 1) / 2} />
                        <Rect x="0.5" y="0.5" width={size - 1} height={size - 1} fill="none" stroke="url(#brGlow)" strokeWidth={coreThickness} opacity="1.0" rx={(size - 1) / 2} />
                    </Svg>

                    <View style={styles.content} collapsable={false}>
                        {icon}
                    </View>
                </BlurView>
            </View>
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    glassWrapper: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    content: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
});

export default IconButton;
