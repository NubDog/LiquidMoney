/**
 * WalletCard.tsx
 * Large card summarizing wallet status natively using LiquidCard
 */

import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Wallet } from 'lucide-react-native';
import { Colors, FontSizes, Shadows, Radii, Spacing } from '../common/theme';
import LiquidCard from './LiquidCard';
import { formatVND } from '../common/formatters';

interface WalletCardProps {
    name: string;
    currentBalance: number;
    initialBalance?: number;
    imageUri?: string | null;
    icon?: string | null;
    createdAt?: string;
    currency?: string;
    onPress: () => void;
    onLongPress?: () => void;
    formatCurrency?: (amount: number) => string;
}

const WalletCard: React.FC<WalletCardProps> = ({
    name,
    currentBalance,
    currency = 'VND',
    onPress,
    onLongPress,
    formatCurrency = formatVND,
}) => {
    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            style={({ pressed }) => [styles.wrapper, pressed && { opacity: 0.8 }]}
        >
            <LiquidCard
                style={styles.card}
                intensity="light"

                borderRadius={Radii.xl}
            >
                <View style={styles.header}>
                    <View collapsable={false} style={styles.titleRow}>
                        <View style={styles.iconWrapper}>
                            <Wallet size={20} color={'#FFFFFF'} />
                        </View>
                        <Text style={styles.name}>{name}</Text>
                    </View>
                </View>

                <View collapsable={false} style={styles.balanceContainer}>
                    <Text style={styles.balanceLabel}>Tổng số dư</Text>
                    <View collapsable={false} style={styles.balanceRow}>
                        <Text style={styles.balanceLarge}>{formatCurrency(currentBalance)}</Text>
                    </View>
                </View>
            </LiquidCard>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.lg,
        ...Shadows.card,
    },
    card: {
        padding: Spacing.xl,
        minHeight: 150,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.xl,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm,
    },
    name: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: '#FFFFFF',
        backgroundColor: 'transparent',
    },
    balanceContainer: {
        marginTop: Spacing.sm,
    },
    balanceLabel: {
        fontSize: FontSizes.sm,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '500',
        marginBottom: 4,
    },
    balanceRow: {
        flexDirection: 'row',
    },
    balanceLarge: {
        fontSize: 34,
        fontWeight: '800',
        color: '#ffffffff',
        backgroundColor: 'transparent',
        textShadowColor: 'transparent',
        textShadowRadius: 0,
    },
});

export default WalletCard;
