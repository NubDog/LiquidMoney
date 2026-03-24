import React from 'react';
import { StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import { BlurView } from '@react-native-community/blur';

interface LiquidCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    borderRadius?: number;
    intensity?: 'light' | 'medium' | 'heavy';
}

const INTENSITY_PRESETS = {
    light: { blurAmount: 15, overlayColor: 'rgba(0, 0, 0, 0.2)' },
    medium: { blurAmount: 25, overlayColor: 'rgba(0, 0, 0, 0.4)' },
    heavy: { blurAmount: 40, overlayColor: 'rgba(0, 0, 0, 0.6)' },
};

const LiquidCard: React.FC<LiquidCardProps> = ({
    children,
    style,
    borderRadius = 24,
    intensity = 'medium',
}) => {
    return (
        <View style={[styles.container, { borderRadius }, style]}>
            <View style={[StyleSheet.absoluteFill, { borderRadius, overflow: 'hidden' }]}>
                <BlurView
                    style={StyleSheet.absoluteFill}
                    blurType="dark"
                    {...INTENSITY_PRESETS[intensity]}
                />
            </View>

            <View
                style={[
                    styles.volumetricHighlight,
                    { borderRadius }
                ]}
                pointerEvents="none"
            />

            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
    },
    volumetricHighlight: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderBottomWidth: 0,
        borderRightWidth: 0,
    },
    content: {
        zIndex: 1,
    },
});

export default LiquidCard;
