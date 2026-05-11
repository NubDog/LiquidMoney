import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { ArrowDownRight, ArrowUpRight, Repeat } from 'lucide-react-native';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FontSizes, Radii, Spacing } from '../../common/theme';
import type { Transaction } from '../../common/types';

interface AppleTransactionRowProps {
    item: Transaction;
    onPress?: (transaction: Transaction) => void;
}

const AppleTransactionRow: React.FC<AppleTransactionRowProps> = ({
    item,
    onPress,
}) => {
    const isIncome = item.type === 'IN';
    const isTransfer = false; // Placeholder for Future 'transfer' tag

    // --- Helpers ---
    const getIcon = () => {
        if (isTransfer) return <Repeat size={24} color={'#FFFFFF'} />;
        return isIncome ? (
            <ArrowDownRight size={24} color={'#32D74B'} /> // Green for income
        ) : (
            <ArrowUpRight size={24} color={'#FF453A'} /> // Red for expense
        );
    };

    const formatCurrency = (amount: number) => {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed
            ]}
            onPress={() => onPress?.(item)}
        >
            <View style={styles.iconBox}>
                {getIcon()}
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.description} numberOfLines={1}>
                    {item.reason || (isIncome ? 'Thu Nhập' : 'Chi Tiêu')}
                </Text>
                <Text style={styles.date}>
                    {format(new Date(item.created_at), 'dd MMM yyyy, HH:mm', { locale: vi })}
                </Text>
            </View>

            <View style={styles.amountBox}>
                <Text style={[styles.amount, { color: isIncome ? '#32D74B' : '#FFFFFF' }]} numberOfLines={1}>
                    {(isIncome ? '+' : '-') + formatCurrency(item.amount) + ' ₫'}
                </Text>
            </View>
        </Pressable>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: 14,
        marginBottom: Spacing.sm,
        backgroundColor: 'rgba(255, 255, 255, 0.35)', // Trả lại màu trắng kính cũ nhưng tăng độ đục (opacity 0.35)
        borderRadius: 16,
    },
    pressed: {
        opacity: 0.7,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: Radii.pill,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    infoBox: {
        flex: 1,
        justifyContent: 'center',
        marginRight: Spacing.xs,
    },
    description: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    date: {
        fontSize: FontSizes.sm,
        color: 'rgba(255, 255, 255, 0.55)',
    },
    amountBox: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: FontSizes.md,
        fontWeight: '700',
    },
});

export default React.memo(AppleTransactionRow);
