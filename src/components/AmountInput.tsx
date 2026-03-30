import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { Colors, FontSizes, Radii, Spacing } from '../common/theme';

interface AmountInputProps extends TextInputProps {
    label?: string;
}

const AmountInput: React.FC<AmountInputProps> = ({ label = 'Số dư ban đầu (₫)', style, value, onChangeText, ...props }) => {
    const displayValue = React.useMemo(() => {
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
        <View>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <TextInput
                style={[styles.input, styles.amountInput, style]}
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="numeric"
                selectionColor={Colors.accent}
                value={displayValue}
                onChangeText={handleChangeText}
                {...props}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: Spacing.sm,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: Radii.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        padding: Spacing.md,
        fontSize: FontSizes.lg,
        color: '#FFFFFF',
        marginBottom: Spacing.lg,
    },
    amountInput: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        paddingVertical: Spacing.lg,
        textAlign: 'center',
    },
});

export default AmountInput;
