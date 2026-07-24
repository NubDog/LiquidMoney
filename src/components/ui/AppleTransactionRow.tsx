import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { ArrowDownRight, ArrowUpRight, Repeat } from 'lucide-react-native';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FontSizes, Radii, Spacing } from '../../common/theme';
import type { Transaction } from '../../common/types';


interface AppleTransactionRowProps {
    item: Transaction;
    onPress?: (transaction: Transaction) => void;
    index?: number;
}

const AppleTransactionRow: React.FC<AppleTransactionRowProps> = ({
    item,
    index = 0,
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

    // Giới hạn delay tối đa là cho 12 phần tử (để những mẻ tải sau không bị delay quá lâu)
    const animationDelay = (index % 12) * 35;

    return (
        <Animated.View 
            entering={FadeInDown.delay(animationDelay).duration(300)}
            exiting={FadeOutUp.duration(250)}
            layout={LinearTransition.duration(250)}
            style={styles.wrapper}
        >
            <View style={styles.cardStyle}>
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
            </View>
        </Animated.View>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    wrapper: {
        marginBottom: Spacing.sm,
    },
    cardStyle: {
        width: '100%',
        backgroundColor: '#1C1C1E', // Pure black / Dark elevated
        borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
    },
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: 14,
    },
    pressed: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
