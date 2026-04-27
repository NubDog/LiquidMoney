import React from 'react';
import { StyleSheet, Text, Pressable, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';

interface AppleButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle | ViewStyle[];
    textStyle?: TextStyle | TextStyle[];
}

const AppleButton: React.FC<AppleButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    style,
    textStyle,
}) => {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                styles[variant],
                (disabled || loading) && styles.disabled,
                pressed && !disabled && !loading && styles.pressed,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'secondary' ? '#0A84FF' : '#FFFFFF'} />
            ) : (
                <Text style={[
                    styles.text, 
                    variant === 'secondary' && styles.secondaryText,
                    textStyle
                ]}>
                    {title}
                </Text>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 50,
        borderRadius: 100, // Pill shaped for softer look
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        paddingHorizontal: 20,
    },
    primary: {
        backgroundColor: '#0A84FF', // iOS default Blue
    },
    secondary: {
        backgroundColor: '#FFFFFF', // White background
        borderWidth: 1,
        borderColor: '#0A84FF', // Blue border
    },
    danger: {
        backgroundColor: '#FF453A', // iOS default Red
    },
    disabled: {
        opacity: 0.5,
    },
    pressed: {
        opacity: 0.8,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    secondaryText: {
        color: '#0A84FF',
    }
});

export default AppleButton;
