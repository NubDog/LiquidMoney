/**
 * WalletCard.tsx — Card hiển thị thông tin ví
 * Glassmorphism style, press animation (RN Animated)
 * Hiển thị icon lucide từ DB thay vì emoji
 */

import React, { useRef } from 'react';
import {
    Animated,
    Image,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import LottieView from 'lottie-react-native';
import GlassCard from './GlassCard';
import { getWalletIcon } from '../constants/walletIcons';
import { formatVND as sharedFormatVND } from '../common/formatters';

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
    /** Icon key (lucide icon name) */
    icon?: string | null;
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
    icon,
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

    // Lấy icon component từ key
    const IconComp = getWalletIcon(icon);

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
                    {/* Lottie Background */}
                    <View style={styles.coverImage}>
                        <LottieView
                            source={require('../assets/Lottie Animation/LikeTikFormularWebsite.json')}
                            autoPlay
                            loop
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                            resizeMode="cover"
                        />
                    </View>

                    {/* Ảnh bìa nếu có */}
                    {imageUri && (
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.coverImage}
                            resizeMode="cover"
                        />
                    )}

                    {/* Dark overlay for text readability */}
                    <View style={styles.imageOverlay} />

                    {/* Nội dung */}
                    <View style={styles.content}>
                        {/* Row trên: Icon + Tên ví */}
                        <View style={styles.headerRow}>
                            <View style={styles.iconContainer}>
                                <IconComp
                                    size={22}
                                    color="#22d3ee"
                                    strokeWidth={1.8}
                                />
                            </View>
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
        backgroundColor: 'rgba(5, 0, 18, 0.45)',
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
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
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
        // Text shadow for readability over animated background
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    createdDate: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.6)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    balance: {
        fontSize: 30,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
        // Strong text shadow so balance never blends into background
        textShadowColor: 'rgba(0, 0, 0, 0.9)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    diff: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 6,
        letterSpacing: 0.1,
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
});

export default WalletCard;
