import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

interface AppleAmountInputProps extends TextInputProps {
    label?: string;
    containerStyle?: ViewStyle | ViewStyle[];
}

const AppleAmountInput: React.FC<AppleAmountInputProps> = ({
    label,
    containerStyle,
    style,
    ...props
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[styles.input, style]}
                placeholderTextColor="rgba(235, 235, 245, 0.3)"
                keyboardType="numeric"
                textAlign="center"
                {...props}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        color: 'rgba(235, 235, 245, 0.6)',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#2C2C2E', // iOS Dark Mode Elevated
        borderRadius: 100, // Pill-shape
        paddingHorizontal: 20,
        paddingVertical: 14,
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default AppleAmountInput;
