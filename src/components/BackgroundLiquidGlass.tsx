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
    fillContainer?: boolean;
    onPress?: () => void;
    onLongPress?: () => void;
    disableBlur?: boolean;
    variant?: 'default' | 'dense';
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
    fillContainer = false,
    onPress,
    onLongPress,
    disableBlur = false,
    variant = 'default',
}) => {
    const scale = useRef(new Animated.Value(1)).current;
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const isDense = variant === 'dense';

    const handlePressIn = () => {
        if (!onPress && !onLongPress) return;
        Animated.spring(scale, { ...SPRING_CONFIG, toValue: 0.94 }).start();
    };

    const handlePressOut = () => {
        if (!onPress && !onLongPress) return;
        Animated.spring(scale, { ...SPRING_CONFIG, toValue: 1 }).start();
    };

    const onLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setDimensions({ width, height });
    };

    const hasDimensions = dimensions.width > 0 && dimensions.height > 0;
    
    // Tính toán border radius thực tế cho SVG (chặn việc rx quá lớn gây lỗi ellipse)
    const effectiveRadius = hasDimensions ? Math.min(borderRadius, dimensions.width / 2, dimensions.height / 2) : borderRadius;

    const glowSteps = hasDimensions 
        ? [
            { c: 0.19,  o: "0.02" },
            { c: 0.15,  o: "0.02" },
            { c: 0.12,  o: "0.03" },
            { c: 0.095, o: "0.04" },
            { c: 0.07,  o: "0.06" },
            { c: 0.05,  o: "0.08" },
            { c: 0.038, o: "0.12" },
            { c: 0.024, o: "0.18" },
            { c: 0.014, o: "0.25" },
            { c: 0.005, o: "0.80" },
        ]
        : [];

    const blurContent = (
        <>
            {hasDimensions && (
                <Svg width={dimensions.width} height={dimensions.height} style={StyleSheet.absoluteFill}>
                    <Defs>
                        {/* Inner ambient glass body */}
                        <RadialGradient id="glassBodyTL" cx="0%" cy="0%" rx="100%" ry="100%">
                            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={isDense ? "0.35" : "0.25"} />
                            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={isDense ? "0.15" : "0.05"} />
                        </RadialGradient>
                        <RadialGradient id="glassBodyBR" cx="100%" cy="100%" rx="100%" ry="100%">
                            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={isDense ? "0.25" : "0.15"} />
                            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={isDense ? "0.05" : "0.02"} />
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

                    {/* --- BORDER GLOW (Dynamic 10-step Deep Inward Glow) --- */}
                    {glowSteps.map((step, idx) => {
                        const sw = Math.max(1, dimensions.height * step.c);
                        return (
                            <React.Fragment key={idx}>
                                <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#tlGlow)" strokeWidth={sw} opacity={step.o} rx={Math.max(0, effectiveRadius - 0.5)} />
                                <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#brGlow)" strokeWidth={sw} opacity={step.o} rx={Math.max(0, effectiveRadius - 0.5)} />
                            </React.Fragment>
                        );
                    })}
                </Svg>
            )}

            <View style={[styles.content, fillContainer && styles.fillContainer, contentContainerStyle]} collapsable={false}>
                {children}
            </View>
        </>
    );

    const innerContent = (
        <View style={[
            styles.glassWrapper, 
            fillContainer && styles.fillContainer,
            { borderRadius },
            disabled && styles.disabledGlass,
            disableBlur && { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
            isDense && !disableBlur && { backgroundColor: 'rgba(0, 0, 0, 0.15)' }
        ]}>
            {disableBlur ? blurContent : (
                /* @ts-ignore */
                <BlurView
                    blurType={isDense ? "dark" : "light"}
                    blurAmount={isDense ? 25 : 12}
                    overlayColor="transparent"
                    reducedTransparencyFallbackColor="transparent"
                    style={fillContainer ? styles.fillContainer : undefined}
                >
                    {blurContent}
                </BlurView>
            )}
        </View>
    );

    if (onPress || onLongPress) {
        return (
            <AnimatedPressable
                disabled={disabled}
                onPress={onPress}
                onLongPress={onLongPress}
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
    fillContainer: {
        height: '100%',
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
