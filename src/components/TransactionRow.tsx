/**
 * TransactionRow.tsx — Item Row displaying individual transactions
 * Wrapped entirely in a slim LiquidCard for uniformity
 */

import React, { useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { ArrowDownRight, ArrowUpRight, Repeat } from 'lucide-react-native';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Colors, FontSizes, Shadows, Radii, Spacing } from '../common/theme';
import LiquidCard from './LiquidCard';
import type { Transaction } from '../common/types';

interface TransactionRowProps {
    item: Transaction;
    onPress?: (transaction: Transaction) => void;
    variant?: 'card' | 'flat';
}

const TransactionRow: React.FC<TransactionRowProps> = ({
    item,
    onPress,
    variant = 'card',
}) => {
    const isIncome = item.type === 'IN';
    const isTransfer = false; // Add actual logic if 'transfer' exists in types later
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const getIcon = () => {
        if (isTransfer) return <Repeat size={20} color={'#FFFFFF'} />;
        return isIncome ? (
            <ArrowDownRight size={20} color={'#FFFFFF'} />
        ) : (
            <ArrowUpRight size={20} color={'#FFFFFF'} />
        );
    };

    return (
        <Animated.View style={[{ transform: [{ scale }] }, variant === 'flat' && { marginBottom: 1 }]}>
            <Pressable
                onPress={() => onPress?.(item)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.wrapper}>
                <LiquidCard 
                    style={styles.card}
                    intensity="heavy"
                    
                    borderRadius={Radii.lg}
                >
                    <View style={styles.content}>
                        <View style={[
                            styles.iconContainer,
                            { backgroundColor: isIncome ? 'rgba(16, 185, 129, 0.2)' : isTransfer ? 'rgba(168, 85, 247, 0.2)' : 'rgba(239, 68, 68, 0.2)' }
                        ]}>
                            {getIcon()}
                        </View>
                        
                        <View style={styles.info}>
                            <Text style={styles.description} numberOfLines={1}>
                                {item.reason || (isIncome ? 'Thu Nhập' : 'Chi Tiêu')}
                            </Text>
                            <Text style={styles.date}>
                                {format(new Date(item.created_at), 'dd MMM yyyy, HH:mm', { locale: vi })}
                            </Text>
                        </View>
                        
                        <Text style={[
                            styles.amount,
                            { color: isIncome ? Colors.income : isTransfer ? '#A855F7' : '#FFFFFF' }
                        ]}>
                            {(isIncome ? '+' : '-') + item.amount.toString() + ' ₫'}
                        </Text>
                    </View>
                </LiquidCard>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.sm,
    },
    card: {
        overflow: 'hidden',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    info: {
        flex: 1,
        marginRight: Spacing.md,
    },
    description: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    date: {
        fontSize: FontSizes.sm - 1,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    amount: {
        fontSize: FontSizes.lg - 2,
        fontWeight: '700',
    },
});

export default React.memo(TransactionRow);
