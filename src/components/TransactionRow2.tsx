import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowDownRight, ArrowUpRight, Repeat } from 'lucide-react-native';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FontSizes, Radii, Spacing } from '../common/theme';
import type { Transaction } from '../common/types';
import BackgroundLiquidGlass from './BackgroundLiquidGlass';

interface TransactionRowProps {
    item: Transaction;
    onPress?: (transaction: Transaction) => void;
}

const TransactionRow2: React.FC<TransactionRowProps> = ({
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

    // --- Render Content ---
    const renderContentBody = () => (
        <View style={styles.textContent}>
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
        </View>
    );

    return (
        <View style={styles.wrapper}>
            <BackgroundLiquidGlass
                borderRadius={24}
                onPress={() => onPress?.(item)}
                style={[styles.container, { aspectRatio: 4.236 }]}
                fillContainer={true}
                contentContainerStyle={styles.contentContainer}
            >
                {renderContentBody()}
            </BackgroundLiquidGlass>
        </View>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    wrapper: {
        marginBottom: Spacing.sm,
    },
    container: {
        width: '100%',
    },
    contentContainer: {
        flex: 1,
        width: '100%',
    },
    textContent: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
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

export default React.memo(TransactionRow2);
