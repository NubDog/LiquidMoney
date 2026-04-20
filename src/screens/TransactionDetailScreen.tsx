/**
 * TransactionDetailScreen.tsx — Transaction detail screen
 * Liquid Glass style, full transaction info + image
 * Supports: Edit + Delete (custom confirm dialog)
 *
 * Refactored: Uses shared formatters, theme tokens.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LiquidCard from '../components/LiquidCard';
import LiquidButton2 from '../components/LiquidButton2';
import TransactionModal from '../components/TransactionModal';
import ConfirmDialog2 from '../components/ConfirmDialog2';
import { formatVND, formatFullDate } from '../common/formatters';
import { Colors, FontSizes, Radii, Spacing } from '../common/theme';
import type { Transaction } from '../common/types';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Calendar,
    ChevronLeft,
    FileText,
    ImageIcon,
    Pencil,
    Trash2,
    Wallet,
} from 'lucide-react-native';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransactionDetailScreenProps {
    transaction: Transaction;
    walletName: string;
    onGoBack: () => void;
    onEdit: (
        id: string,
        walletId: string,
        type: 'IN' | 'OUT',
        amount: number,
        reason?: string | null,
        imageUri?: string | null,
    ) => void;
    onDelete: (id: string, walletId: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const { width } = Dimensions.get('window');

// ─── Component ────────────────────────────────────────────────────────────────

const TransactionDetailScreen: React.FC<TransactionDetailScreenProps> = ({
    transaction,
    walletName,
    onGoBack,
    onEdit,
    onDelete,
}) => {
    const insets = useSafeAreaInsets();
    const isIn = transaction.type === 'IN';

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

    // ─── Animation ──────────────────────────────────────────────────────────
    // Removed fadeAnim to eliminate the "flash" during the slide transition.

    // ─── Colors ─────────────────────────────────────────────────────────────
    const typeColor = isIn ? Colors.income : Colors.expense;
    const typeBg = isIn ? Colors.incomeBg : Colors.expenseBg;
    const typeBorder = isIn ? Colors.incomeBorder : Colors.expenseBorder;
    const typeLabel = isIn ? 'Thu nhập' : 'Chi tiêu';
    const typeSign = isIn ? '+' : '-';

    // ─── Handlers ───────────────────────────────────────────────────────────

    const handleOpenEdit = useCallback(() => {
        setEditModalVisible(true);
    }, []);

    const handleSaveEdit = useCallback(
        (type: 'IN' | 'OUT', amount: number, reason?: string | null, imageUri?: string | null) => {
            onEdit(transaction.id, transaction.wallet_id, type, amount, reason, imageUri);
            onGoBack();
        },
        [transaction.id, transaction.wallet_id, onEdit, onGoBack],
    );

    const handleDeletePress = useCallback(() => {
        setDeleteDialogVisible(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        setDeleteDialogVisible(false);
        onDelete(transaction.id, transaction.wallet_id);
        onGoBack();
    }, [transaction.id, transaction.wallet_id, onDelete, onGoBack]);

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <Animated.View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <Pressable onPress={onGoBack} style={styles.backBtn}>
                    <ChevronLeft size={24} color={Colors.text} />
                </Pressable>
                <Text style={styles.topBarTitle}>Chi tiết giao dịch</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>

                {/* ── Amount Card ── */}
                <LiquidCard
                    style={styles.amountCard}
                    intensity="light"
                    
                    borderRadius={Radii.xxl}>
                    <View style={[styles.typeBadge, { borderColor: typeColor }]}>
                        {isIn ? (
                            <ArrowDownLeft size={16} color={typeColor} strokeWidth={2.5} />
                        ) : (
                            <ArrowUpRight size={16} color={typeColor} strokeWidth={2.5} />
                        )}
                        <Text style={[styles.typeBadgeText, { color: typeColor }]}>
                            {typeLabel}
                        </Text>
                    </View>
                    <Text style={[styles.amount, { color: typeColor }]}>
                        {typeSign}{formatVND(transaction.amount)}
                    </Text>
                </LiquidCard>

                {/* ── Info Card ── */}
                <LiquidCard
                    style={styles.infoCard}
                    intensity="light"
                    
                    borderRadius={Radii.xl}>
                    {/* Reason */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoIconWrap}>
                            <FileText size={18} color="rgba(255,255,255,0.7)" strokeWidth={2} />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Lý do</Text>
                            <Text style={styles.infoValue}>
                                {transaction.reason || typeLabel}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Date */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoIconWrap}>
                            <Calendar size={18} color="rgba(255,255,255,0.7)" strokeWidth={2} />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Thời gian</Text>
                            <Text style={styles.infoValue}>
                                {formatFullDate(transaction.created_at)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Wallet */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoIconWrap}>
                            <Wallet size={18} color="rgba(255,255,255,0.7)" strokeWidth={2} />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Ví</Text>
                            <Text style={styles.infoValue}>{walletName}</Text>
                        </View>
                    </View>
                </LiquidCard>

                {/* ── Image Card ── */}
                {transaction.image_uri ? (
                    <LiquidCard
                        style={styles.imageCard}
                        intensity="light"
                        
                        borderRadius={Radii.xl}>
                        <View style={styles.imageHeader}>
                            <ImageIcon size={18} color="rgba(255,255,255,0.7)" strokeWidth={2} />
                            <Text style={styles.imageHeaderText}>Hình ảnh đính kèm</Text>
                        </View>
                        <Image
                            source={{ uri: transaction.image_uri }}
                            style={styles.transactionImage}
                            resizeMode="cover"
                        />
                    </LiquidCard>
                ) : null}

                {/* ── Action Buttons ── */}
                <View style={styles.actionsContainer}>
                    <LiquidButton2 
                        onPress={handleOpenEdit}
                        title="Sửa giao dịch"
                        icon={<Pencil size={18} color="#FFFFFF" strokeWidth={2.5} />}
                    />

                    <LiquidButton2 
                        onPress={handleDeletePress}
                        title="Xóa giao dịch"
                        icon={<Trash2 size={18} color="#ef4444" strokeWidth={2.5} />}
                    />
                </View>

                <View style={{ height: insets.bottom + 40 }} />
            </ScrollView>

            {/* Edit Modal */}
            <TransactionModal
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                onSave={handleSaveEdit}
                editData={{
                    type: transaction.type,
                    amount: transaction.amount,
                    reason: transaction.reason,
                    image_uri: transaction.image_uri,
                }}
            />

            {/* Delete Confirm Dialog */}
            <ConfirmDialog2
                visible={deleteDialogVisible}
                title="Xóa giao dịch"
                message="Bạn có chắc muốn xóa giao dịch này? Hành động này không thể hoàn tác."
                cancelText="Hủy"
                confirmText="Xóa"
                isDestructive
                onCancel={() => setDeleteDialogVisible(false)}
                onConfirm={handleConfirmDelete}
            />
        </Animated.View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: 12,
    },
    backBtn: {
        padding: Spacing.sm,
        borderRadius: Radii.xl,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    topBarTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.text,
        letterSpacing: -0.3,
    },
    scrollContent: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
    },

    // ── Amount Card ──
    amountCard: {
        padding: Spacing.xxl - 4,
        alignItems: 'center',
        marginBottom: Spacing.md,
        elevation: 0,
        shadowOpacity: 0,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: Radii.xl,
        borderWidth: 1,
        marginBottom: Spacing.md,
    },
    typeBadgeText: {
        fontSize: FontSizes.md - 1,
        fontWeight: '700',
    },
    amount: {
        fontSize: FontSizes.title,
        fontWeight: '800',
        letterSpacing: -1,
    },

    // ── Info Card ──
    infoCard: {
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        elevation: 0,
        shadowOpacity: 0,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoIconWrap: {
        width: 36,
        height: 36,
        borderRadius: Radii.sm,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: FontSizes.xs + 1,
        fontWeight: '500',
        color: Colors.textMuted,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.divider,
        marginLeft: 50,
    },

    // ── Image Card ──
    imageCard: {
        padding: Spacing.md,
        marginBottom: Spacing.md,
        elevation: 0,
        shadowOpacity: 0,
    },
    imageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: 12,
    },
    imageHeaderText: {
        fontSize: FontSizes.md - 1,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
    },
    transactionImage: {
        width: '100%',
        height: width * 0.55,
        borderRadius: Radii.md,
    },

    // ── Actions ──
    actionsContainer: {
        gap: 12,
        marginTop: Spacing.sm,
    },
});

export default TransactionDetailScreen;
