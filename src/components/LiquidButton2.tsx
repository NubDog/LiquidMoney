import React, { useRef, useState } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
    type ViewStyle,
    type StyleProp,
    Platform,
    LayoutChangeEvent,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

interface LiquidButton2Props {
    onPress: () => void;
    title: string;
    icon?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = {
    useNativeDriver: true,
    friction: 7,
    tension: 100,
};

const LiquidButton2: React.FC<LiquidButton2Props> = ({
    onPress,
    title,
    icon,
    style,
    disabled = false,
}) => {
    const scale = useRef(new Animated.Value(1)).current;
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const handlePressIn = () => {
        Animated.spring(scale, { ...SPRING_CONFIG, toValue: 0.94 }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, { ...SPRING_CONFIG, toValue: 1 }).start();
    };

    const onLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setDimensions({ width, height });
    };

    const isAndroid = Platform.OS === 'android';
    const hasDimensions = dimensions.width > 0 && dimensions.height > 0;
    const pillRadius = hasDimensions ? dimensions.height / 2 : 100;

    // Golden Ratio Optics
    // Tạo độ bung sáng linh hoạt tỉ lệ theo độ dày thực tế của khối kính
    const bloomThickness = hasDimensions ? Math.max(3, dimensions.height * 0.08) : 3;
    const coreThickness = hasDimensions ? Math.max(1, dimensions.height * 0.02) : 1;

    return (
        <AnimatedPressable
            disabled={disabled}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onLayout={onLayout}
            style={[
                styles.container,
                disabled && styles.disabled,
                { transform: [{ scale }] },
                style,
            ]}
        >
            {/* Bao bọc BlurView bằng thẻ View chuẩn để ép Android Cắt (Clip) viền hình chữ nhật thừa */}
            <View style={[styles.glassWrapper, disabled && styles.disabledGlass]}>
                {/* @ts-ignore */}
                <BlurView
                    blurType="light"
                    blurAmount={8}
                    overlayColor="transparent"
                    reducedTransparencyFallbackColor="transparent"
                >
                {hasDimensions && (
                    <Svg width={dimensions.width} height={dimensions.height} style={StyleSheet.absoluteFill}>
                        <Defs>
                            {/* Inner ambient glass body */}
                            <RadialGradient id="glassBodyTL" cx="0%" cy="0%" rx="100%" ry="100%">
                                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.15" />
                                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                            </RadialGradient>
                            <RadialGradient id="glassBodyBR" cx="100%" cy="100%" rx="100%" ry="100%">
                                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.08" />
                                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                            </RadialGradient>

                            {/* --- TL BORDER GLOW (Golden Ratio 61.8%) --- */}
                            <RadialGradient id="tlGlow" cx="0%" cy="0%" rx="61.8%" ry="38.2%">
                                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1.0" />
                                <Stop offset="0.08" stopColor="#FFFFFF" stopOpacity="0.8" />
                                <Stop offset="0.25" stopColor="#FFFFFF" stopOpacity="0.35" />
                                <Stop offset="0.618" stopColor="#FFFFFF" stopOpacity="0.1" />
                                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                            </RadialGradient>

                            {/* --- BR BORDER GLOW (Golden Ratio 61.8%) --- */}
                            <RadialGradient id="brGlow" cx="100%" cy="100%" rx="61.8%" ry="38.2%">
                                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.8" />
                                <Stop offset="0.1" stopColor="#FFFFFF" stopOpacity="0.6" />
                                <Stop offset="0.25" stopColor="#FFFFFF" stopOpacity="0.2" />
                                <Stop offset="0.618" stopColor="#FFFFFF" stopOpacity="0.05" />
                                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                            </RadialGradient>
                        </Defs>
                        
                        {/* Ambient body fill */}
                        <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="url(#glassBodyTL)" rx={pillRadius} />
                        <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="url(#glassBodyBR)" rx={pillRadius} />
                        
                        {/* --- TOP LEFT HIGHLIGHT --- */}
                        {/* Soft outer bloom (auto-scaling bloom based on button height) */}
                        <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#tlGlow)" strokeWidth={bloomThickness} opacity="0.35" rx={Math.max(0, pillRadius - 0.5)} />
                        {/* Sharp intense glass core */}
                        <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#tlGlow)" strokeWidth={coreThickness} opacity="1.0" rx={Math.max(0, pillRadius - 0.5)} />

                        {/* --- BOTTOM RIGHT HIGHLIGHT --- */}
                        <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#brGlow)" strokeWidth={bloomThickness} opacity="0.35" rx={Math.max(0, pillRadius - 0.5)} />
                        <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#brGlow)" strokeWidth={coreThickness} opacity="1.0" rx={Math.max(0, pillRadius - 0.5)} />
                    </Svg>
                )}

                {/* Content bọc trong BlurView để lõi Android BlurView ẩn nó đi trước khi chụp màn hình nền */}
                <View style={styles.content} collapsable={false}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text key="text-clean" style={styles.text}>{title}</Text>
                </View>
            </BlurView>
            </View>
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        justifyContent: 'center',
        borderRadius: 9999,
    },
    disabled: {
        opacity: 0.65,
    },
    disabledGlass: {
        backgroundColor: 'rgba(0, 0, 0, 0.35)', // Làm đậm màu nền
    },
    glassWrapper: {
        width: '100%',
        borderRadius: 9999,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    content: {
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
});

export default LiquidButton2;
