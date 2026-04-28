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
import AppleCloseButton from './ui/AppleCloseButton';

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

    const isIncome = transaction.type === 'IN';

    const formatAmount = (amount: number) => {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

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
                    <View style={styles.sheet}>
                        <View style={styles.handleBar} />
                        
                        <View style={styles.header}>
                            <Text style={styles.title}>Chi tiết giao dịch</Text>
                            <AppleCloseButton onPress={handleClose} size={32} />
                        </View>

                        <ScrollView style={styles.scroll}>
                            <View style={styles.amountContainer}>
                                <Text
                                    style={[
                                        styles.amountNumber,
                                        { color: isIncome ? Colors.income : Colors.expense },
                                    ]}>
                                    {isIncome ? '+' : '-'}
                                    {formatAmount(transaction.amount)} ₫
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
                                        { 
                                            backgroundColor: isIncome ? Colors.incomeBg : Colors.expenseBg,
                                            color: isIncome ? Colors.income : Colors.expense 
                                        },
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
                    </View>
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
        backgroundColor: '#1C1C1E', // iOS Dark Mode Elevated
        ...Shadows.menu,
    },
    sheet: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottomWidth: 0,
        paddingBottom: 40,
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
        fontSize: FontSizes.xl + 2,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    scroll: {
        padding: Spacing.xl,
    },
    amountContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        marginBottom: Spacing.lg,
        backgroundColor: '#2C2C2E', // iOS Dark Mode Elevated inner
        borderRadius: Radii.xl,
    },
    amountNumber: {
        fontSize: 36,
        fontWeight: '800',
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
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: 100, // Pill-shape
        overflow: 'hidden',
    },
});

export default TransactionDetailOverlay;
