/**
 * WalletCard.tsx — Card hiển thị thông tin ví
 * Glassmorphism style, press animation (RN Animated)
 */

import React, { useRef } from 'react';
import {
    Animated,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import GlassCard from './GlassCard';

// ─── Props ────────────────────────────────────────────────────────────────────

interface WalletCardProps {
    /** Tên ví */
    name: string;
    /** Số dư hiện tại (đơn vị: VNĐ) */
    currentBalance: number;
    /** Số dư ban đầu */
    initialBalance: number;
    /** URI ảnh bìa ví (nếu có) */
    imageUri?: string | null;
    /** Ngày tạo (ISO string) */
    createdAt: string;
    /** Callback khi nhấn vào card */
    onPress?: () => void;
    /** Callback khi nhấn giữ (long press) */
    onLongPress?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format số tiền theo VNĐ
 * 1234567 → "1.234.567 ₫"
 */
function formatVND(amount: number): string {
    const formatted = Math.abs(amount)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${amount < 0 ? '-' : ''}${formatted} ₫`;
}

/**
 * Format ngày: "2026-02-19T10:00:00Z" → "19/02/2026"
 */
function formatDate(isoString: string): string {
    const d = new Date(isoString);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const WalletCard: React.FC<WalletCardProps> = ({
    name,
    currentBalance,
    initialBalance,
    imageUri,
    createdAt,
    onPress,
    onLongPress,
}) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.96,
            useNativeDriver: true,
            friction: 8,
            tension: 100,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 6,
            tension: 120,
        }).start();
    };

    // Tính chênh lệch so với ban đầu
    const diff = currentBalance - initialBalance;
    const diffColor = diff >= 0 ? '#4ADE80' : '#F87171'; // xanh lá / đỏ
    const diffSign = diff >= 0 ? '+' : '';

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <Pressable
                onPress={onPress}
                onLongPress={onLongPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}>
                <GlassCard
                    style={styles.card}
                    backgroundOpacity={0.1}
                    borderOpacity={0.2}
                    borderRadius={22}>
                    {/* Ảnh bìa nếu có */}
                    {imageUri && (
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.coverImage}
                            resizeMode="cover"
                        />
                    )}

                    {/* Gradient overlay khi có ảnh */}
                    {imageUri && <View style={styles.imageOverlay} />}

                    {/* Nội dung */}
                    <View style={styles.content}>
                        {/* Row trên: Tên ví + Emoji */}
                        <View style={styles.headerRow}>
                            <Text style={styles.walletEmoji}>💳</Text>
                            <View style={styles.headerText}>
                                <Text style={styles.walletName} numberOfLines={1}>
                                    {name}
                                </Text>
                                <Text style={styles.createdDate}>
                                    Tạo {formatDate(createdAt)}
                                </Text>
                            </View>
                        </View>

                        {/* Số dư chính */}
                        <Text style={styles.balance}>{formatVND(currentBalance)}</Text>

                        {/* Chênh lệch so với ban đầu */}
                        {diff !== 0 && (
                            <Text style={[styles.diff, { color: diffColor }]}>
                                {diffSign}{formatVND(diff)} so với ban đầu
                            </Text>
                        )}
                    </View>
                </GlassCard>
            </Pressable>
        </Animated.View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    card: {
        minHeight: 150,
        overflow: 'hidden',
    },
    coverImage: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 22,
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(5, 0, 18, 0.55)',
        borderRadius: 22,
    },
    content: {
        padding: 20,
        zIndex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    walletEmoji: {
        fontSize: 28,
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    walletName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.2,
    },
    createdDate: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.4)',
        marginTop: 2,
    },
    balance: {
        fontSize: 30,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    diff: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 6,
        letterSpacing: 0.1,
    },
});

export default WalletCard;
