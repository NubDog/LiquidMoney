/**
 * TransactionDetailScreen.tsx — Màn hình chi tiết giao dịch
 * Liquid Glass style, hiển thị đầy đủ thông tin + hình ảnh
 * Hỗ trợ: Sửa giao dịch + Xóa giao dịch (custom confirm dialog)
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
import GlassCard from '../components/GlassCard';
import TransactionModal from '../components/TransactionModal';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Transaction } from '../database/queries';
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const { width } = Dimensions.get('window');

function formatVND(n: number): string {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₫';
}

function formatFullDate(iso: string): string {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    const secs = String(d.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} — ${hours}:${mins}:${secs}`;
}

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

    // ─── State ──────────────────────────────────────────────────────────────
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

    // ─── Animation ──────────────────────────────────────────────────────────
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    // ─── Colors ─────────────────────────────────────────────────────────────
    const typeColor = isIn ? '#4ade80' : '#f87171';
    const typeBg = isIn ? 'rgba(74, 222, 128, 0.12)' : 'rgba(248, 113, 113, 0.12)';
    const typeBorder = isIn ? 'rgba(74, 222, 128, 0.25)' : 'rgba(248, 113, 113, 0.25)';
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
        <Animated.View style={[styles.container, { paddingTop: insets.top, opacity: fadeAnim }]}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <Pressable onPress={onGoBack} style={styles.backBtn}>
                    <ChevronLeft size={24} color="#FFFFFF" />
                </Pressable>
                <Text style={styles.topBarTitle}>Chi tiết giao dịch</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>

                {/* ── Amount Card ── */}
                <GlassCard
                    style={styles.amountCard}
                    backgroundOpacity={0.15}
                    borderOpacity={0.2}
                    borderRadius={24}>
                    {/* Type badge */}
                    <View style={[styles.typeBadge, { backgroundColor: typeBg, borderColor: typeBorder }]}>
                        {isIn ? (
                            <ArrowDownLeft size={18} color={typeColor} strokeWidth={2.5} />
                        ) : (
                            <ArrowUpRight size={18} color={typeColor} strokeWidth={2.5} />
                        )}
                        <Text style={[styles.typeBadgeText, { color: typeColor }]}>
                            {typeLabel}
                        </Text>
                    </View>

                    {/* Amount */}
                    <Text style={[styles.amount, { color: typeColor }]}>
                        {typeSign}{formatVND(transaction.amount)}
                    </Text>
                </GlassCard>

                {/* ── Info Card ── */}
                <GlassCard
                    style={styles.infoCard}
                    backgroundOpacity={0.08}
                    borderOpacity={0.12}
                    borderRadius={20}>

                    {/* Reason */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoIconWrap}>
                            <FileText size={18} color="#C084FC" strokeWidth={2} />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Lý do</Text>
                            <Text style={styles.infoValue}>
                                {transaction.reason || (isIn ? 'Thu nhập' : 'Chi tiêu')}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Date */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoIconWrap}>
                            <Calendar size={18} color="#22d3ee" strokeWidth={2} />
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
                            <Wallet size={18} color="#fbbf24" strokeWidth={2} />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Ví</Text>
                            <Text style={styles.infoValue}>{walletName}</Text>
                        </View>
                    </View>
                </GlassCard>

                {/* ── Image Card ── */}
                {transaction.image_uri ? (
                    <GlassCard
                        style={styles.imageCard}
                        backgroundOpacity={0.08}
                        borderOpacity={0.12}
                        borderRadius={20}>
                        <View style={styles.imageHeader}>
                            <ImageIcon size={18} color="#22d3ee" strokeWidth={2} />
                            <Text style={styles.imageHeaderText}>Hình ảnh đính kèm</Text>
                        </View>
                        <Image
                            source={{ uri: transaction.image_uri }}
                            style={styles.transactionImage}
                            resizeMode="cover"
                        />
                    </GlassCard>
                ) : null}

                {/* ── Action Buttons ── */}
                <View style={styles.actionsContainer}>
                    <Pressable
                        onPress={handleOpenEdit}
                        style={({ pressed }) => [
                            styles.actionBtn,
                            styles.editBtn,
                            pressed && { opacity: 0.7 },
                        ]}>
                        <Pencil size={18} color="#22d3ee" strokeWidth={2} />
                        <Text style={styles.editBtnText}>Sửa giao dịch</Text>
                    </Pressable>

                    <Pressable
                        onPress={handleDeletePress}
                        style={({ pressed }) => [
                            styles.actionBtn,
                            styles.delBtn,
                            pressed && { opacity: 0.7 },
                        ]}>
                        <Trash2 size={18} color="#f87171" strokeWidth={2} />
                        <Text style={styles.delBtnText}>Xóa giao dịch</Text>
                    </Pressable>
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
            <ConfirmDialog
                visible={deleteDialogVisible}
                title="Xóa giao dịch"
                message="Bạn có chắc muốn xóa giao dịch này? Hành động này không thể hoàn tác."
                cancelText="Hủy"
                confirmText="Xóa"
                confirmColor="#ef4444"
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
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    topBarTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },

    // ── Amount Card ──
    amountCard: {
        padding: 28,
        alignItems: 'center',
        marginBottom: 16,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 16,
    },
    typeBadgeText: {
        fontSize: 14,
        fontWeight: '700',
    },
    amount: {
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -1,
    },

    // ── Info Card ──
    infoCard: {
        padding: 20,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.4)',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        marginLeft: 50,
    },

    // ── Image Card ──
    imageCard: {
        padding: 16,
        marginBottom: 16,
    },
    imageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    imageHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
    },
    transactionImage: {
        width: '100%',
        height: width * 0.55,
        borderRadius: 14,
    },

    // ── Actions ──
    actionsContainer: {
        gap: 12,
        marginTop: 8,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 15,
        borderRadius: 16,
        borderWidth: 1,
    },
    editBtn: {
        backgroundColor: 'rgba(34, 211, 238, 0.08)',
        borderColor: 'rgba(34, 211, 238, 0.25)',
    },
    editBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#22d3ee',
    },
    delBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderColor: 'rgba(239, 68, 68, 0.25)',
    },
    delBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#f87171',
    },
});

export default TransactionDetailScreen;
