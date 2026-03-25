/**
 * TransactionDetailOverlay.tsx — Detail popup logic separated
 * Uses LiquidCard to present Liquid Glass overlay
 */

import React, { useRef } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Animated,
} from 'react-native';
import { X } from 'lucide-react-native';
import { format } from 'date-fns';
import { animateSheetIn, animateSheetOut } from '../common/animations';
import AnimatedOverlay from './AnimatedOverlay';
import LiquidCard from './LiquidCard';
import LiquidButton from './LiquidButton';
import { Colors, FontSizes, Shadows, Spacing, Radii } from '../common/theme';
import type { Transaction } from '../common/types';

interface TransactionDetailOverlayProps {
    visible?: boolean;
    transaction: Transaction | null;
    onClose: () => void;
    formatCurrency?: (amount: number, type: string) => string;
    walletName?: string;
    onGoBack?: () => void;
    onEdit?: (id: string, wId: string, type: "IN" | "OUT", amount: number, reason?: string | null | undefined, imageUri?: string | null | undefined) => void;
    onDelete?: (id: string, wId: string) => void;
}

const TransactionDetailOverlay: React.FC<TransactionDetailOverlayProps> = ({
    visible,
    transaction,
    onClose,
    formatCurrency,
}) => {
    const translateY = useRef(new Animated.Value(400)).current;

    React.useEffect(() => {
        if (visible) {
            animateSheetIn(translateY).start(); // Assuming animateModalOpen is now animateSheetIn
        }
    }, [visible, translateY]);

    const handleClose = () => {
        animateSheetOut(translateY, 600, 250).start(({ finished }) => { // Assuming animateModalClose is now animateSheetOut
            if (finished) onClose();
        });
    };

    if (!transaction) { return null; }

    const isIncome = transaction.type === 'IN'; // Updated based on new type 'IN'

    return (
        <Modal
            key={`detail-modal-${transaction.id}`}
            visible={!!visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}>
            <View style={styles.container}>
                <AnimatedOverlay visible={!!visible} onPress={handleClose} />
                
                <Animated.View style={[styles.sheetContainer, { transform: [{ translateY }] }]}>
                    <LiquidCard 
                        style={styles.sheet}
                        intensity="light"
                        
                        borderRadius={Radii.xxl}
                    >
                        <View style={styles.handleBar} />
                        
                        <View style={styles.header}>
                            <Text style={styles.title}>Chi tiết giao dịch</Text>
                            <Pressable onPress={handleClose} style={styles.closeBtn}>
                                <X size={24} color="#FFFFFF" strokeWidth={2.5} />
                            </Pressable>
                        </View>

                        <ScrollView style={styles.scroll}>
                            <View style={styles.amountContainer}>
                                <Text
                                    style={[
                                        styles.amountNumber,
                                        { color: isIncome ? Colors.income : Colors.expense },
                                    ]}>
                                    {isIncome ? '+' : '-'}
                                    {formatCurrency ? formatCurrency(transaction.amount, transaction.type) : `${transaction.amount} ₫`}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Mô tả</Text>
                                <Text style={styles.detailValue}>{transaction.reason}</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Phân loại</Text>
                                <Text
                                    style={[
                                        styles.detailValue,
                                        styles.tagStyle,
                                        { backgroundColor: isIncome ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' },
                                    ]}>
                                    {isIncome ? 'Thu nhập' : 'Chi tiêu'}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Ngày</Text>
                                <Text style={styles.detailValue}>
                                    {format(new Date(transaction.created_at), 'dd/MM/yyyy • HH:mm')}
                                </Text>
                            </View>
                        </ScrollView>
                    </LiquidCard>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheetContainer: {
        borderTopLeftRadius: Radii.xxl,
        borderTopRightRadius: Radii.xxl,
        ...Shadows.menu,
    },
    sheet: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottomWidth: 0,
        height: '60%', // Takes up portion of screen
        paddingTop: 12,
    },
    handleBar: {
        width: 44,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: 'rgba(255,255,255,0.4)',
        alignSelf: 'center',
        marginBottom: Spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    closeBtn: {
        padding: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: Radii.pill,
    },
    scroll: {
        padding: Spacing.xl,
    },
    amountContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        marginBottom: Spacing.lg,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: Radii.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    amountNumber: {
        fontSize: 36,
        fontWeight: '800',
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    detailLabel: {
        fontSize: FontSizes.md,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    tagStyle: {
        paddingHorizontal: Spacing.sm + 2,
        paddingVertical: 4,
        borderRadius: Radii.sm,
        overflow: 'hidden',
    },
});

export default TransactionDetailOverlay;
