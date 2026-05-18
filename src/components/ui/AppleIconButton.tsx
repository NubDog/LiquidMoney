import React from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';

interface AppleIconButtonProps {
    icon: React.ReactNode;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
    size?: number;
    backgroundColor?: string;
    disabled?: boolean;
}

const AppleIconButton: React.FC<AppleIconButtonProps> = ({
    icon,
    onPress,
    style,
    size = 44, // Minimum hit target recommended by Apple
    backgroundColor = 'rgba(255, 255, 255, 0.12)', // Default Apple flat translucent dark style
    disabled = false,
}) => {
    return (
        <Pressable
            onPress={disabled ? undefined : onPress}
            hitSlop={12}
            style={({ pressed }) => [
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor,
                },
                pressed && !disabled && styles.pressed,
                disabled && styles.disabled,
                style,
            ]}
        >
            {icon}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    pressed: {
        opacity: 0.6,
        transform: [{ scale: 0.94 }], // Apple-style subtle interactive press effect
    },
    disabled: {
        opacity: 0.3,
    },
});

export default AppleIconButton;
