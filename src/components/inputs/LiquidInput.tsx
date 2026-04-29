import React, { useState } from 'react';
import { Colors } from '../../common/theme';
import { StyleSheet, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import BackgroundLiquidGlass from '../layout/BackgroundLiquidGlass';

interface LiquidInputProps extends TextInputProps {
    containerStyle?: ViewStyle;
    leftIcon?: React.ReactNode;
    disableBlur?: boolean;
}

const LiquidInput: React.FC<LiquidInputProps> = ({ containerStyle, leftIcon, disableBlur, onFocus, onBlur, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <BackgroundLiquidGlass
            style={[styles.container, containerStyle]}
            contentContainerStyle={styles.contentContainer}
            borderRadius={24}
            disableBlur={disableBlur}
        >
            <View 
                style={[
                    StyleSheet.absoluteFill, 
                    { backgroundColor: isFocused ? 'rgba(255, 255, 255, 0.08)' : 'transparent' }
                ]} 
                pointerEvents="none" 
            />

            {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
            
            <TextInput
                placeholderTextColor={Colors.textMuted}
                cursorColor="#FFFFFF"
                selectionColor="rgba(255, 255, 255, 0.3)"
                onFocus={(e) => {
                    setIsFocused(true);
                    onFocus?.(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    onBlur?.(e);
                }}
                onChangeText={(text) => {
                    // Only allow letters and spaces
                    const filteredText = text.replace(/[^a-zA-ZÀ-Ỹà-ỹ\s]/g, '');
                    props.onChangeText?.(filteredText);
                }}
                {...props}
                style={[styles.input, leftIcon ? { paddingLeft: 44 } : undefined, props.style]}
            />
        </BackgroundLiquidGlass>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 54,
    },
    contentContainer: {
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        position: 'absolute',
        left: 14,
        height: '100%',
        justifyContent: 'center',
        zIndex: 2,
    },
    input: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 16,
        color: '#FFFFFF',
        fontSize: 16,
        zIndex: 1,
    },
});

export default LiquidInput;
