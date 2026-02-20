/**
 * LiquidFAB.tsx — Literal Moon & Universe Theme
 * Subtle, elegant, night sky focused. Focuses intensely on subtlety and elegance.
 * Features:
 * - Deep midnight space background
 * - A literal elegant crescent moon motif overlay (CSS rendered)
 * - 3 tiny twinkling starlight dots 
 * - Standard FAB size (56px) with zero flashy changing ring colors.
 * - Solid icy moonlight shadow/glow around the button
 */

import React, { useEffect } from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    View,
    type ViewStyle,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSpring,
    Easing,
    withSequence,
    SharedValue,
} from 'react-native-reanimated';
import { Plus } from 'lucide-react-native';

interface LiquidFABProps {
    onPress: () => void;
    style?: ViewStyle;
}

const FAB_SIZE = 56;

const LiquidFAB: React.FC<LiquidFABProps> = ({ onPress, style }) => {
    const isPressed = useSharedValue(0);

    // Ngôi sao lấp lánh (Twinkling stars opacity)
    const starOpacity1 = useSharedValue(0.1);
    const starOpacity2 = useSharedValue(0.3);
    const starOpacity3 = useSharedValue(0.1);

    useEffect(() => {
        // Hàm tạo nhịp đập lấp lánh ngẫu nhiên
        const twinkle = (sv: SharedValue<number>, duration: number) => {
            sv.value = withRepeat(
                withSequence(
                    withTiming(0.85, { duration, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.1, { duration: duration * 1.5, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        };

        twinkle(starOpacity1, 1400);
        twinkle(starOpacity2, 2100);
        twinkle(starOpacity3, 1700);
    }, [starOpacity1, starOpacity2, starOpacity3]);

    const handlePressIn = () => {
        isPressed.value = withSpring(1, { damping: 14, stiffness: 300 });
    };

    const handlePressOut = () => {
        isPressed.value = withSpring(0, { damping: 12, stiffness: 200 });
    };

    // ─── Animated Styles ───
    const animatedContainerStyle = useAnimatedStyle(() => {
        // Thu nhỏ nhẹ khi ấn
        const scale = 1 - isPressed.value * 0.12;
        return { transform: [{ scale }] };
    });

    return (
        <Animated.View style={[styles.wrapper, style, animatedContainerStyle]}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.button}
            >
                {/* 1. Nền Vũ Trụ cực kỳ sâu (Deep Space Background) */}
                <View style={styles.spaceBg} />

                {/* 2. Mặt Trăng Khuyết (Crescent Moon Silhouette) */}
                <View style={styles.moonContainer}>
                    {/* Quả cầu trăng sáng */}
                    <View style={styles.moon} />
                    {/* Shadow đè lên để tạo hình trăng khuyết tinh tế */}
                    <View style={styles.moonShadow} />
                </View>

                {/* 3. Những Điểm Sao Nhỏ Lấp Lánh (Twinkling Stars) */}
                <Animated.View style={[styles.star, styles.star1, { opacity: starOpacity1 }]} />
                <Animated.View style={[styles.star, styles.star2, { opacity: starOpacity2 }]} />
                <Animated.View style={[styles.star, styles.star3, { opacity: starOpacity3 }]} />

                {/* 4. Viền ánh sáng mặt trăng bắt sáng lên đỉnh nút (Moonlight Highlight) */}
                <View style={styles.moonlightReflection} />

                <Plus size={26} color="#FFFFFF" strokeWidth={2.5} style={styles.icon} />
            </Pressable>
        </Animated.View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        width: FAB_SIZE,
        height: FAB_SIZE,
        zIndex: 9999,
        // Soft icy moonlight drop shadow 
        shadowColor: 'rgba(219, 234, 254, 0.45)', // Màu sáng trắng xanh (Ánh trăng)
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 18,
        elevation: 12, // Dành cho Android
    },
    button: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        // Viền mỏng giả kim loại phản chiếu ánh sáng
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.18)',
    },

    // ── Nền Vũ Trụ ──
    spaceBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#050914', // Xanh đen vô tận (không lòe loẹt, chỉ sâu thẳm)
    },

    // ── Hình Ảnh Trực Quan Mặt Trăng ──
    moonContainer: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 18,
        height: 18,
    },
    moon: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#E2E8F0', // Ánh bạc dịu mắt
        position: 'absolute',
        top: 0,
        right: 0,
    },
    moonShadow: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#050914', // Cùng màu với nền để khoét một nửa mặt trăng
        position: 'absolute',
        top: 3,
        right: 4,
    },

    // ── Ngôi Sao Tinh Tế ──
    star: {
        position: 'absolute',
        width: 2,
        height: 2,
        borderRadius: 1,
        backgroundColor: '#FFFFFF',
    },
    // Rải rác quang nút bấm
    star1: { top: 14, left: 16 },
    star2: { bottom: 18, right: 14 },
    star3: { bottom: 14, left: 22 },

    // ── Khối Thể (3D Highlight) ──
    moonlightReflection: {
        position: 'absolute',
        top: 0,
        left: '20%',
        right: '20%',
        height: '30%',
        borderRadius: FAB_SIZE / 2,
        // Lớp Highlight làm bóng phía trên
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },

    icon: {
        zIndex: 10,
    }
});

export default LiquidFAB;
