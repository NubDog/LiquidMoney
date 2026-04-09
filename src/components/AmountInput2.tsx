import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    TextInput,
    View,
    Text,
    LayoutChangeEvent,
    Platform,
    StyleProp,
    ViewStyle,
    TextInputProps
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Colors, FontSizes, Spacing } from '../common/theme';

interface AmountInput2Props extends Omit<TextInputProps, 'style'> {
    label?: string;
    style?: StyleProp<ViewStyle>;
}

const AmountInput2: React.FC<AmountInput2Props> = ({
    label,
    style,
    value,
    onChangeText,
    ...props
}) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isFocused, setIsFocused] = useState(false);

    const onLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setDimensions({ width, height });
    };

    const hasDimensions = dimensions.width > 0 && dimensions.height > 0;
    const pillRadius = hasDimensions ? dimensions.height / 2 : 100;
    
    // Golden ratio math from LiquidButton2
    const bloomThickness = hasDimensions ? Math.max(3, dimensions.height * 0.08) : 3;
    const coreThickness = hasDimensions ? Math.max(1, dimensions.height * 0.02) : 1;

    // Tự động tính toán font size theo height (Golden Ratio xấp xỉ)
    // Capped to max 36px font for aesthetic balance
    const dynamicFontSize = hasDimensions ? Math.min(dimensions.height * 0.45, 36) : FontSizes.xl;

    // Formatting money (dots separators)
    const displayValue = useMemo(() => {
        if (!value) return '';
        const rawValue = String(value).replace(/[^0-9]/g, '');
        if (!rawValue) return '';
        return parseInt(rawValue, 10).toLocaleString('vi-VN').replace(/,/g, '.');
    }, [value]);

    const handleChangeText = (text: string) => {
        const rawValue = text.replace(/[^0-9]/g, '');
        if (!rawValue) {
            if (onChangeText) onChangeText('');
            return;
        }
        const formatted = parseInt(rawValue, 10).toLocaleString('vi-VN').replace(/,/g, '.');
        if (onChangeText) onChangeText(formatted);
    };

    return (
        <View style={styles.wrapper}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <View 
                style={[styles.container, style]} 
                onLayout={onLayout}
            >
                <View style={styles.glassWrapper}>
                    {/* @ts-ignore */}
                    <BlurView
                        blurType="light"
                        blurAmount={isFocused ? 12 : 8}
                        overlayColor="transparent"
                        reducedTransparencyFallbackColor="transparent"
                        style={StyleSheet.absoluteFill}
                    >
                        {hasDimensions && (
                            <Svg width={dimensions.width} height={dimensions.height} style={StyleSheet.absoluteFill}>
                                <Defs>
                                    <RadialGradient id="glassBodyTL" cx="0%" cy="0%" rx="100%" ry="100%">
                                        <Stop offset="0" stopColor="#FFFFFF" stopOpacity={isFocused ? "0.2" : "0.15"} />
                                        <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                                    </RadialGradient>
                                    <RadialGradient id="glassBodyBR" cx="100%" cy="100%" rx="100%" ry="100%">
                                        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.08" />
                                        <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                                    </RadialGradient>

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

                                <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="url(#glassBodyTL)" rx={pillRadius} />
                                <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="url(#glassBodyBR)" rx={pillRadius} />

                                <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#tlGlow)" strokeWidth={bloomThickness} opacity="0.35" rx={Math.max(0, pillRadius - 0.5)} />
                                <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#tlGlow)" strokeWidth={coreThickness} opacity="1.0" rx={Math.max(0, pillRadius - 0.5)} />

                                <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#brGlow)" strokeWidth={bloomThickness} opacity="0.35" rx={Math.max(0, pillRadius - 0.5)} />
                                <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#brGlow)" strokeWidth={coreThickness} opacity="1.0" rx={Math.max(0, pillRadius - 0.5)} />
                            </Svg>
                        )}
                        <TextInput
                            style={[styles.input, { fontSize: dynamicFontSize }]}
                            placeholder="0"
                            placeholderTextColor="rgba(255,255,255,0.2)"
                            keyboardType="numeric"
                            cursorColor="#FFFFFF"
                            selectionColor="rgba(255, 255, 255, 0.3)"
                            value={displayValue}
                            onChangeText={handleChangeText}
                            onFocus={(e) => {
                                setIsFocused(true);
                                props.onFocus?.(e);
                            }}
                            onBlur={(e) => {
                                setIsFocused(false);
                                props.onBlur?.(e);
                            }}
                            {...props}
                        />
                    </BlurView>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
    },
    label: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: Spacing.sm,
    },
    container: {
        width: '100%',
        minHeight: 48, // Compact minimum height
        maxHeight: 80, // Bounded upper limit
        height: 56, // Clean aesthetic baseline proportion
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    glassWrapper: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 9999,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    input: {
        width: '100%',
        height: '100%',
        color: '#FFFFFF',
        fontWeight: '700',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.md,
    },
});

export default AmountInput2;
