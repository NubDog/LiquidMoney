import React from 'react';
import { StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import BackgroundLiquidGlass from './BackgroundLiquidGlass';

interface IconButtonProps {
    icon: React.ReactNode;
    size?: number;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
    disableBlur?: boolean;
    disabled?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, size = 64, onPress, style, disableBlur = false, disabled = false }) => {
    return (
        <BackgroundLiquidGlass
            onPress={onPress}
            disableBlur={disableBlur}
            disabled={disabled}
            borderRadius={size / 2}
            style={[{ width: size, height: size }, style]}
            // Đảm bảo chiều cao content bên trong khớp tuyệt đối với size (ghi đè minHeight: 48 của BackgroundLiquidGlass)
            contentContainerStyle={[styles.content, { height: size, minHeight: size }]}
        >
            <View style={styles.iconWrapper}>{icon}</View>
        </BackgroundLiquidGlass>
    );
};

const styles = StyleSheet.create({
    content: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default IconButton;
