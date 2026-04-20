import React from 'react';
import { StyleSheet, Text, View, type ViewStyle, type StyleProp } from 'react-native';
import BackgroundLiquidGlass from './BackgroundLiquidGlass';

interface LiquidButton2Props {
    onPress: () => void;
    title: string;
    icon?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
    disableBlur?: boolean;
}

const LiquidButton2: React.FC<LiquidButton2Props> = ({
    onPress,
    title,
    icon,
    style,
    disabled = false,
    disableBlur = false,
}) => {
    return (
        <BackgroundLiquidGlass
            onPress={onPress}
            disabled={disabled}
            disableBlur={disableBlur}
            style={style}
            borderRadius={9999}
            contentContainerStyle={styles.contentContainer}
        >
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text key="text-clean" style={[styles.text, disabled && styles.disabledText]}>
                {title}
            </Text>
        </BackgroundLiquidGlass>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 28,
    },
    iconContainer: {
        marginRight: 8,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
        backgroundColor: 'transparent',
    },
    disabledText: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
});

export default LiquidButton2;
