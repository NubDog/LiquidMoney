import React from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle, Platform, View } from 'react-native';
import { X } from 'lucide-react-native';

interface AppleCloseButtonProps {
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
    size?: number;
    iconSize?: number;
}

const AppleCloseButton: React.FC<AppleCloseButtonProps> = ({
    onPress,
    style,
    size = 32,
    iconSize = 18,
}) => {
    return (
        <Pressable
            onPress={onPress}
            hitSlop={12} // Generous hit slop for easy tapping
            style={({ pressed }) => [
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                },
                pressed && styles.pressed,
                style,
            ]}
        >
            <X size={iconSize} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2C2C2E', // Solid elevated dark mode color
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    pressed: {
        opacity: 0.6,
    },
});

export default AppleCloseButton;
