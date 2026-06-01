import React, { useRef } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle, Keyboard, Pressable } from 'react-native';

interface AppleAmountInputProps extends TextInputProps {
    label?: string;
    containerStyle?: ViewStyle | ViewStyle[];
}

const AppleAmountInput: React.FC<AppleAmountInputProps> = ({
    label,
    containerStyle,
    style,
    onChangeText,
    ...props
}) => {
    const inputRef = useRef<TextInput>(null);

    const handleChangeText = (text: string) => {
        if (!onChangeText) return;
        
        // Lấy riêng các ký tự số
        const numericValue = text.replace(/[^0-9]/g, '');
        
        if (!numericValue) {
            onChangeText('');
            return;
        }

        // Định dạng có dấu chấm cách mỗi 3 số
        const formatted = parseInt(numericValue, 10).toLocaleString('vi-VN').replace(/,/g, '.');
        onChangeText(formatted);
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <Pressable 
                style={styles.inputBackground}
                onPress={() => inputRef.current?.focus()}
            >
                <TextInput
                    ref={inputRef}
                    style={[styles.input, style]}
                    placeholderTextColor="rgba(235, 235, 245, 0.3)"
                    keyboardType="numeric"
                    textAlign="left"
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                    onChangeText={handleChangeText}
                    {...props}
                />
            </Pressable>
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
        color: '#FFFFFF',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputBackground: {
        backgroundColor: '#2C2C2E', // iOS Dark Mode Elevated
        borderRadius: 100, // Pill-shape
        paddingHorizontal: 20,
        paddingVertical: 14,
        width: '100%',
        justifyContent: 'center',
    },
    input: {
        width: '100%',
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        padding: 0,
        margin: 0,
    },
});

export default AppleAmountInput;
