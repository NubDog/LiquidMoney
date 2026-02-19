/**
 * MeshBackground.tsx — Animated Mesh Gradient Background
 *
 * Phiên bản fallback: dùng pure React Native View + radial gradient
 * giả lập bằng nhiều tầng View tròn với opacity.
 *
 * Khi rebuild native binary (có reanimated + skia), đổi lại bản gốc
 * để có animation mượt mà hơn.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';

// ─── Màu sắc chủ đạo ────────────────────────────────────────────────────────

const COLORS = {
    base: '#050012',
    purple: '#4A00E0',
    navy: '#000046',
    peach: '#EE9CA7',
    violet: '#7B2FFF',
};

// ─── Component ────────────────────────────────────────────────────────────────

const MeshBackground: React.FC = () => {
    const { width, height } = useWindowDimensions();

    // Animated value 0 → 1 loop liên tục
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(anim, {
                toValue: 1,
                duration: 16000,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        ).start();
    }, [anim]);

    // Tính vị trí dao động nhẹ cho các blob
    const translateBlob0 = anim.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: [0, 20, 0, -20, 0],
    });
    const translateBlob1 = anim.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: [0, -15, 0, 15, 0],
    });
    const translateBlob2 = anim.interpolate({
        inputRange: [0, 0.33, 0.66, 1],
        outputRange: [0, 25, -10, 0],
    });
    const translateBlob3 = anim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, -18, 0],
    });

    const blobSize0 = width * 1.1;
    const blobSize1 = width * 0.9;
    const blobSize2 = width * 1.0;
    const blobSize3 = width * 0.7;

    return (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.base }]} pointerEvents="none">
            {/* Blob 0: Tím lớn — góc trên trái */}
            <Animated.View
                style={[
                    styles.blob,
                    {
                        width: blobSize0,
                        height: blobSize0,
                        borderRadius: blobSize0 / 2,
                        backgroundColor: COLORS.purple,
                        opacity: 0.55,
                        top: -height * 0.15,
                        left: -width * 0.3,
                        transform: [
                            { translateX: translateBlob0 },
                            { translateY: translateBlob1 },
                        ],
                    },
                ]}
            />

            {/* Blob 1: Hồng đào — góc dưới phải */}
            <Animated.View
                style={[
                    styles.blob,
                    {
                        width: blobSize1,
                        height: blobSize1,
                        borderRadius: blobSize1 / 2,
                        backgroundColor: COLORS.peach,
                        opacity: 0.35,
                        bottom: -height * 0.05,
                        right: -width * 0.2,
                        transform: [
                            { translateX: translateBlob1 },
                            { translateY: translateBlob0 },
                        ],
                    },
                ]}
            />

            {/* Blob 2: Navy — giữa */}
            <Animated.View
                style={[
                    styles.blob,
                    {
                        width: blobSize2,
                        height: blobSize2,
                        borderRadius: blobSize2 / 2,
                        backgroundColor: COLORS.navy,
                        opacity: 0.65,
                        top: height * 0.2,
                        left: -width * 0.1,
                        transform: [
                            { translateX: translateBlob2 },
                            { translateY: translateBlob3 },
                        ],
                    },
                ]}
            />

            {/* Blob 3: Tím sáng — nhỏ, trên phải */}
            <Animated.View
                style={[
                    styles.blob,
                    {
                        width: blobSize3,
                        height: blobSize3,
                        borderRadius: blobSize3 / 2,
                        backgroundColor: COLORS.violet,
                        opacity: 0.35,
                        top: height * 0.1,
                        right: -width * 0.05,
                        transform: [
                            { translateX: translateBlob3 },
                            { translateY: translateBlob2 },
                        ],
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    blob: {
        position: 'absolute',
    },
});

export default MeshBackground;
