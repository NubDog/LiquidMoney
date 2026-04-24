import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    TextInput,
    View,
    Text,
    LayoutChangeEvent,
    StyleProp,
    ViewStyle,
    TextInputProps
} from 'react-native';
import { FontSizes, Spacing } from '../common/theme';
import BackgroundLiquidGlass from './BackgroundLiquidGlass';

interface AmountInput2Props extends Omit<TextInputProps, 'style'> {
    label?: string;
    style?: StyleProp<ViewStyle>;
    disableBlur?: boolean;
}

const AmountInput2: React.FC<AmountInput2Props> = ({
    label,
    style,
    value,
    onChangeText,
    disableBlur,
    ...props
}) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isFocused, setIsFocused] = useState(false);

    const onLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setDimensions({ width, height });
    };

    const hasDimensions = dimensions.width > 0 && dimensions.height > 0;
    
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
                <BackgroundLiquidGlass
                    borderRadius={9999}
                    style={StyleSheet.absoluteFill}
                    disableBlur={disableBlur}
                    contentContainerStyle={[
                        styles.glassContent,
                        { height: hasDimensions ? dimensions.height : 56, minHeight: hasDimensions ? dimensions.height : 56 }
                    ]}
                >
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
                </BackgroundLiquidGlass>
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
    glassContent: {
        width: '100%',
    },
    input: {
        width: '100%',
        height: '100%',
        color: '#FFFFFF',
        fontWeight: '700',
        textAlign: 'center',
        paddingHorizontal: Spacing.md,
    },
});

export default AmountInput2;
