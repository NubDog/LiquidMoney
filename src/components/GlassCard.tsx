/**
 * GlassCard.tsx — Container Glassmorphism
 * Phong cách kính mờ VisionOS / iOS 18
 */

import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

// ─── Props ────────────────────────────────────────────────────────────────────

interface GlassCardProps {
    children: React.ReactNode;
    /** Style bổ sung / ghi đè */
    style?: ViewStyle;
    /** Độ mờ nền (0-1). Mặc định 0.08 */
    backgroundOpacity?: number;
    /** Độ sáng viền (0-1). Mặc định 0.18 */
    borderOpacity?: number;
    /** Bo góc. Mặc định 20 */
    borderRadius?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

const GlassCard: React.FC<GlassCardProps> = ({
    children,
    style,
    backgroundOpacity = 0.08,
    borderOpacity = 0.18,
    borderRadius = 20,
}) => {
    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: `rgba(255, 255, 255, ${backgroundOpacity})`,
                    borderColor: `rgba(255, 255, 255, ${borderOpacity})`,
                    borderRadius,
                },
                style,
            ]}>
            {/* Viền sáng phía trên — tạo chiều sâu kính */}
            <View
                style={[
                    styles.topHighlight,
                    {
                        borderTopLeftRadius: borderRadius,
                        borderTopRightRadius: borderRadius,
                    },
                ]}
            />
            {children}
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        overflow: 'hidden',
        // Shadow nhẹ tạo chiều sâu
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    topHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
});

export default GlassCard;
