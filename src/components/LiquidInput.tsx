import React, { useState } from 'react';
import { Colors } from '../common/theme';
import { StyleSheet, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useLiquidContext } from './LiquidContext';

interface LiquidInputProps extends TextInputProps {
    containerStyle?: ViewStyle;
    leftIcon?: React.ReactNode;
}

const LiquidInput: React.FC<LiquidInputProps> = ({ containerStyle, leftIcon, onFocus, onBlur, ...props }) => {
    const { isInsideGlass } = useLiquidContext();
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            <View style={[StyleSheet.absoluteFill, { borderRadius: 24, overflow: 'hidden' }]}>
                {!isInsideGlass ? (
                    <BlurView 
                        style={StyleSheet.absoluteFill} 
                        blurType="light"
                        blurAmount={15}
                        overlayColor={isFocused ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)'}
                        reducedTransparencyFallbackColor="transparent"
                    />
                ) : (
                    <View style={[
                        StyleSheet.absoluteFill, 
                        { backgroundColor: isFocused ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.08)' }
                    ]} />
                )}
            </View>
            
            <View style={[
                StyleSheet.absoluteFill,
                styles.borderHighlight,
            ]} pointerEvents="none" />

            {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
            
            <TextInput
                style={[styles.input, leftIcon ? { paddingLeft: 44 } : undefined]}
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
                {...props}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 54,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    borderHighlight: {
        borderRadius: 24,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderRightWidth: 0,
        borderColor: 'rgba(255, 255, 255, 0.15)',
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
