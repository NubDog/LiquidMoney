/**
 * TransactionRow.tsx — Reusable transaction row component
 * Consolidates near-identical transaction row rendering from
 * StatsScreen (renderRecentItem) and WalletDetailScreen (TransactionItem).
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import GlassCard from './GlassCard';
import { formatVND, formatDate } from '../common/formatters';
import { Colors, FontSizes, Radii } from '../common/theme';
import type { Transaction } from '../common/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransactionRowProps {
    item: Transaction;
    /** Called when the row is pressed */
    onPress?: (item: Transaction) => void;
    /** 'card' wraps in a GlassCard, 'flat' is a simple row */
    variant?: 'card' | 'flat';
}

// ─── Component ────────────────────────────────────────────────────────────────

const TransactionRow: React.FC<TransactionRowProps> = ({
    item,
    onPress,
    variant = 'card',
}) => {
    const isIn = item.type === 'IN';
    const iconBg = isIn ? Colors.incomeBg : Colors.expenseBg;
    const amountColor = isIn ? Colors.income : Colors.expense;

    const content = (
        <View style={variant === 'card' ? styles.txRowCard : styles.txRowFlat}>
            <View style={[styles.txIcon, { backgroundColor: iconBg }]}>
                {isIn ? (
                    <ArrowDownLeft size={variant === 'card' ? 24 : 15} color={Colors.income} strokeWidth={2.5} />
                ) : (
                    <ArrowUpRight size={variant === 'card' ? 24 : 15} color={Colors.expense} strokeWidth={2.5} />
                )}
            </View>

            <View style={styles.txInfo}>
                <Text style={styles.txReason} numberOfLines={1}>
                    {item.reason || (isIn ? 'Thu nhập' : 'Chi tiêu')}
                </Text>
                <Text style={styles.txDate}>
                    {formatDate(item.created_at)}
                </Text>
            </View>

            <Text style={[styles.txAmount, { color: amountColor }]}>
                {isIn ? '+' : '-'}
                {formatVND(item.amount)}
            </Text>
        </View>
    );

    if (variant === 'card') {
        return (
            <Pressable onPress={onPress ? () => onPress(item) : undefined}>
                <GlassCard
                    style={styles.txCard}
                    backgroundOpacity={0.1}
                    borderOpacity={0.12}
                    borderRadius={Radii.lg}>
                    {content}
                </GlassCard>
            </Pressable>
        );
    }

    // Flat variant (used in StatsScreen)
    return (
        <Pressable onPress={onPress ? () => onPress(item) : undefined}>
            {content}
        </Pressable>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    txCard: {
        marginBottom: 10,
    },
    txRowCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
    },
    txRowFlat: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    txIcon: {
        width: 44,
        height: 44,
        borderRadius: Radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    txInfo: {
        flex: 1,
        marginRight: 8,
    },
    txReason: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.text,
    },
    txDate: {
        fontSize: FontSizes.xs + 1,
        color: Colors.textMuted,
        marginTop: 3,
    },
    txAmount: {
        fontSize: FontSizes.lg - 2,
        fontWeight: '700',
    },
});

export default React.memo(TransactionRow);
