import React, { useRef, useState } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    View,
    type ViewStyle,
    type StyleProp,
    LayoutChangeEvent,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Radii } from '../common/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = {
    useNativeDriver: true,
    friction: 7,
    tension: 100,
};

interface BackgroundLiquidGlassProps {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    disabled?: boolean;
    borderRadius?: number;
    onPress?: () => void;
}

/**
 * BackgroundLiquidGlass
 * 
 * Component siêu cấp VIP Pro Max. Đóng gói hoàn hảo nền Liquid Glass với Golden Ratio Optics.
 * Dùng làm nền (wrapper) cho bất kỳ Component nào trong dự án, tự động co giãn và xử lý clipping.
 * Tích hợp sẵn Animation scale êm ái khi được truyền prop `onPress`.
 */
const BackgroundLiquidGlass: React.FC<BackgroundLiquidGlassProps> = ({
    children,
    style,
    contentContainerStyle,
    disabled = false,
    borderRadius = Radii.xl,
    onPress,
}) => {
    const scale = useRef(new Animated.Value(1)).current;
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const handlePressIn = () => {
        if (!onPress) return;
        Animated.spring(scale, { ...SPRING_CONFIG, toValue: 0.94 }).start();
    };

    const handlePressOut = () => {
        if (!onPress) return;
        Animated.spring(scale, { ...SPRING_CONFIG, toValue: 1 }).start();
    };

    const onLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setDimensions({ width, height });
    };

    const hasDimensions = dimensions.width > 0 && dimensions.height > 0;
    
    // Tính toán border radius thực tế cho SVG (chặn việc rx quá lớn gây lỗi ellipse)
    const effectiveRadius = hasDimensions ? Math.min(borderRadius, dimensions.width / 2, dimensions.height / 2) : borderRadius;

    // Golden Ratio Optics (tỉ lệ thuận theo chiều cao để tính toán độ bung sáng)
    const bloomThickness = hasDimensions ? Math.max(3, dimensions.height * 0.08) : 3;
    const coreThickness = hasDimensions ? Math.max(1, dimensions.height * 0.02) : 1;

    const innerContent = (
        <View style={[
            styles.glassWrapper, 
            { borderRadius },
            disabled && styles.disabledGlass
        ]}>
                {/* @ts-ignore */}
                <BlurView
                    blurType="light"
                    blurAmount={12}
                    overlayColor="transparent"
                    reducedTransparencyFallbackColor="transparent"
                >
                    {hasDimensions && (
                        <Svg width={dimensions.width} height={dimensions.height} style={StyleSheet.absoluteFill}>
                            <Defs>
                                {/* Inner ambient glass body */}
                                <RadialGradient id="glassBodyTL" cx="0%" cy="0%" rx="100%" ry="100%">
                                    <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.25" />
                                    <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.05" />
                                </RadialGradient>
                                <RadialGradient id="glassBodyBR" cx="100%" cy="100%" rx="100%" ry="100%">
                                    <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.15" />
                                    <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.02" />
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
                            <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="url(#glassBodyTL)" rx={effectiveRadius} />
                            <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="url(#glassBodyBR)" rx={effectiveRadius} />

                            {/* --- TOP LEFT HIGHLIGHT --- */}
                            <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#tlGlow)" strokeWidth={bloomThickness} opacity="0.35" rx={Math.max(0, effectiveRadius - 0.5)} />
                            <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#tlGlow)" strokeWidth={coreThickness} opacity="1.0" rx={Math.max(0, effectiveRadius - 0.5)} />

                            {/* --- BOTTOM RIGHT HIGHLIGHT --- */}
                            <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#brGlow)" strokeWidth={bloomThickness} opacity="0.35" rx={Math.max(0, effectiveRadius - 0.5)} />
                            <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#brGlow)" strokeWidth={coreThickness} opacity="1.0" rx={Math.max(0, effectiveRadius - 0.5)} />
                        </Svg>
                    )}

                    <View style={[styles.content, contentContainerStyle]} collapsable={false}>
                        {children}
                    </View>
                </BlurView>
        </View>
    );

    if (onPress) {
        return (
            <AnimatedPressable
                disabled={disabled}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onLayout={onLayout}
                style={[
                    styles.container,
                    { borderRadius },
                    disabled && styles.disabled,
                    { transform: [{ scale }] },
                    style,
                ]}
            >
                {innerContent}
            </AnimatedPressable>
        );
    }

    return (
        <View 
            style={[
                styles.container, 
                { borderRadius }, 
                disabled && styles.disabled,
                style
            ]} 
            onLayout={onLayout}
        >
            {innerContent}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        justifyContent: 'center',
    },
    disabled: {
        opacity: 0.5,
    },
    disabledGlass: {
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    glassWrapper: {
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    content: {
        minHeight: 48,
        width: '100%',
        justifyContent: 'center',
    },
});

export default React.memo(BackgroundLiquidGlass);
