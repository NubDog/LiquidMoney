import React from 'react';
import { StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { LiquidContext } from './LiquidContext';

interface LiquidCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    borderRadius?: number;
    intensity?: 'light' | 'medium' | 'heavy';
    extendBottom?: boolean;
}

const INTENSITY_PRESETS = {
    light: { blurAmount: 10, bgAlpha: 0.05 },
    medium: { blurAmount: 15, bgAlpha: 0.15 },
    heavy: { blurAmount: 25, bgAlpha: 0.25 },
};

const LiquidCard: React.FC<LiquidCardProps> = ({
    children,
    style,
    borderRadius = 24,
    intensity = 'medium',
    extendBottom = false,
}) => {
    return (
        <View style={[styles.container, { borderRadius }, style]}>
            {/* Lớp cha chứa BlurView: Cố tình đặt overflow='hidden' để cắt xén. Khi extendBottom=true, thân kính được nối dài xuống 500px */}
            <View style={[
                StyleSheet.absoluteFill, 
                { borderRadius, overflow: 'hidden' },
                extendBottom && { bottom: -500, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
            ]}>
                {/* @ts-ignore: overlayColor fixes Android native tinting */}
                <BlurView
                    // Nới rộng BlurView ra khỏi viền container (-25px các cạnh) để triệt tiêu lỗi "vệt sáng/dải sáng trắng" do Android lấy mẫu sai pixel ở biên.
                    style={[StyleSheet.absoluteFill, { top: -25, left: -25, right: -25, bottom: extendBottom ? -500 : -25 }]}
                    blurType="light"
                    blurAmount={INTENSITY_PRESETS[intensity].blurAmount}
                    overlayColor="transparent"
                    reducedTransparencyFallbackColor="transparent"
                />
                <View style={[
                    StyleSheet.absoluteFill, 
                    { backgroundColor: `rgba(0, 0, 0, ${INTENSITY_PRESETS[intensity].bgAlpha})` },
                    { top: -25, left: -25, right: -25, bottom: extendBottom ? -500 : -25 }
                ]} />
            </View>

            <View
                style={[
                    styles.volumetricHighlight,
                    { borderRadius },
                    extendBottom && { bottom: -500 }
                ]}
                pointerEvents="none"
            />

            <View style={styles.content}>
                <LiquidContext.Provider value={{ isInsideGlass: true }}>
                    {children}
                </LiquidContext.Provider>
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
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderBottomWidth: 0,
        borderRightWidth: 0,
    },
    content: {
        zIndex: 1,
    },
});

export default LiquidCard;
