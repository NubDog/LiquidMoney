/**
 * WalletDetailScreen.tsx — Màn hình chi tiết ví + danh sách giao dịch
 * Dùng RN core FlatList, SegmentedControl, TransactionModal
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../components/GlassCard';
import SegmentedControl from '../components/SegmentedControl';
import TransactionModal from '../components/TransactionModal';
import { useStore } from '../store/useStore';
import type { Transaction } from '../database/queries';

// ─── Props ────────────────────────────────────────────────────────────────────

interface WalletDetailScreenProps {
    walletId: string;
    onGoBack: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FILTER_SEGMENTS = ['Tất cả', '💰 Thu', '💸 Chi'];

function formatVND(n: number): string {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₫';
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month} ${hours}:${mins}`;
}

// ─── Transaction Item ─────────────────────────────────────────────────────────

const TransactionItem: React.FC<{
    item: Transaction;
    onPress: (item: Transaction) => void;
}> = React.memo(({ item, onPress }) => {
    const isIn = item.type === 'IN';
    const iconBg = isIn
        ? 'rgba(74, 222, 128, 0.15)'
        : 'rgba(248, 113, 113, 0.15)';
    const amountColor = isIn ? '#4ade80' : '#f87171';

    return (
        <Pressable onPress={() => onPress(item)}>
            <GlassCard
                style={styles.txCard}
                backgroundOpacity={0.1}
                borderOpacity={0.12}
                borderRadius={16}>
                <View style={styles.txRow}>
                    {/* Icon */}
                    <View style={[styles.txIcon, { backgroundColor: iconBg }]}>
                        <Text style={styles.txEmoji}>
                            {isIn ? '💰' : '💸'}
                        </Text>
                    </View>

                    {/* Info */}
                    <View style={styles.txInfo}>
                        <Text style={styles.txReason} numberOfLines={1}>
                            {item.reason || (isIn ? 'Thu nhập' : 'Chi tiêu')}
                        </Text>
                        <Text style={styles.txDate}>
                            {formatDate(item.created_at)}
                        </Text>
                    </View>

                    {/* Amount */}
                    <Text style={[styles.txAmount, { color: amountColor }]}>
                        {isIn ? '+' : '-'}
                        {formatVND(item.amount)}
                    </Text>
                </View>
            </GlassCard>
        </Pressable>
    );
});

// ─── Component ────────────────────────────────────────────────────────────────

const WalletDetailScreen: React.FC<WalletDetailScreenProps> = ({
    walletId,
    onGoBack,
}) => {
    const insets = useSafeAreaInsets();
    const {
        currentWallet,
        transactions,
        selectWallet,
        refreshTransactions,
        addTransaction,
        editTransaction,
        removeTransaction,
    } = useStore();

    // ─── State ──────────────────────────────────────────────────────────────

    const [filterIndex, setFilterIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);

    // ─── Load wallet + transactions khi mount ────────────────────────────────

    useEffect(() => {
        selectWallet(walletId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletId]);

    // ─── Filter thay đổi → refresh ─────────────────────────────────────────

    useEffect(() => {
        const filterType: 'IN' | 'OUT' | undefined =
            filterIndex === 1 ? 'IN' : filterIndex === 2 ? 'OUT' : undefined;
        refreshTransactions(walletId, filterType);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterIndex, walletId]);

    // ─── Handlers ───────────────────────────────────────────────────────────

    const handleOpenCreate = useCallback(() => {
        setEditingTx(null);
        setModalVisible(true);
    }, []);

    const handleOpenEdit = useCallback((tx: Transaction) => {
        setEditingTx(tx);
        setModalVisible(true);
    }, []);

    const handleSave = useCallback(
        (type: 'IN' | 'OUT', amount: number, reason?: string | null) => {
            if (editingTx) {
                editTransaction(
                    editingTx.id,
                    walletId,
                    type,
                    amount,
                    reason,
                );
            } else {
                addTransaction(walletId, type, amount, reason);
            }
        },
        [editingTx, walletId, addTransaction, editTransaction],
    );

    const handleDelete = useCallback(() => {
        if (editingTx) {
            removeTransaction(editingTx.id, walletId);
        }
    }, [editingTx, walletId, removeTransaction]);

    // ─── Balance diff ───────────────────────────────────────────────────────

    const wallet = currentWallet;
    const balanceDiff = wallet
        ? wallet.current_balance - wallet.initial_balance
        : 0;
    const diffColor =
        balanceDiff >= 0 ? '#4ade80' : '#f87171';

    // ─── Render ─────────────────────────────────────────────────────────────

    const renderItem = useCallback(
        ({ item }: { item: Transaction }) => (
            <TransactionItem item={item} onPress={handleOpenEdit} />
        ),
        [handleOpenEdit],
    );

    const ListHeader = useCallback(
        () => (
            <View>
                {/* Wallet Summary Card */}
                <GlassCard
                    style={styles.summaryCard}
                    backgroundOpacity={0.15}
                    borderOpacity={0.2}
                    borderRadius={24}>
                    {/* Cover / Accent line */}
                    <View style={styles.accentLine} />

                    <Text style={styles.walletName}>
                        {wallet?.name || 'Ví'}
                    </Text>

                    <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
                    <Text style={styles.balanceAmount}>
                        {formatVND(wallet?.current_balance || 0)}
                    </Text>

                    <View style={styles.balanceRow}>
                        <View style={styles.balanceCol}>
                            <Text style={styles.smallLabel}>Ban đầu</Text>
                            <Text style={styles.smallValue}>
                                {formatVND(wallet?.initial_balance || 0)}
                            </Text>
                        </View>
                        <View style={styles.balanceCol}>
                            <Text style={styles.smallLabel}>Chênh lệch</Text>
                            <Text
                                style={[
                                    styles.smallValue,
                                    { color: diffColor },
                                ]}>
                                {balanceDiff >= 0 ? '+' : ''}
                                {formatVND(balanceDiff)}
                            </Text>
                        </View>
                    </View>
                </GlassCard>

                {/* Filter */}
                <View style={styles.filterWrapper}>
                    <SegmentedControl
                        segments={FILTER_SEGMENTS}
                        selectedIndex={filterIndex}
                        onChange={setFilterIndex}
                    />
                </View>

                {/* Section title */}
                <Text style={styles.sectionTitle}>
                    Giao dịch ({transactions.length})
                </Text>
            </View>
        ),
        [wallet, balanceDiff, diffColor, filterIndex, transactions.length],
    );

    const ListEmpty = useCallback(
        () => (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>📋</Text>
                <Text style={styles.emptyText}>Chưa có giao dịch</Text>
                <Text style={styles.emptySubtext}>
                    Nhấn nút + để tạo giao dịch đầu tiên
                </Text>
            </View>
        ),
        [],
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <Pressable onPress={onGoBack} style={styles.backBtn}>
                    <Text style={styles.backText}>← Quay lại</Text>
                </Pressable>
            </View>

            {/* Transaction List */}
            <FlatList
                data={transactions}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={ListEmpty}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* FAB */}
            <Pressable
                onPress={handleOpenCreate}
                style={[styles.fab, { bottom: insets.bottom + 24 }]}>
                <Text style={styles.fabText}>＋</Text>
            </Pressable>

            {/* Transaction Modal */}
            <TransactionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSave}
                onDelete={editingTx ? handleDelete : undefined}
                editData={
                    editingTx
                        ? {
                            type: editingTx.type,
                            amount: editingTx.amount,
                            reason: editingTx.reason,
                        }
                        : null
                }
            />
        </View>
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
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    backText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 15,
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },

    // ── Summary Card ──
    summaryCard: {
        marginBottom: 16,
        overflow: 'hidden',
    },
    accentLine: {
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(168, 85, 247, 0.6)',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 16,
    },
    walletName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginHorizontal: 20,
    },
    balanceLabel: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.45)',
        marginTop: 12,
        marginHorizontal: 20,
    },
    balanceAmount: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: 2,
        letterSpacing: -1,
    },
    balanceRow: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 20,
        marginHorizontal: 20,
        gap: 16,
    },
    balanceCol: {
        flex: 1,
    },
    smallLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.4)',
        marginBottom: 2,
    },
    smallValue: {
        fontSize: 15,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.85)',
    },

    // ── Filter ──
    filterWrapper: {
        marginBottom: 16,
    },

    // ── Section ──
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
        marginBottom: 12,
    },

    // ── Transaction Item ──
    txCard: {
        marginBottom: 10,
    },
    txRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
    },
    txIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    txEmoji: {
        fontSize: 20,
    },
    txInfo: {
        flex: 1,
        marginRight: 8,
    },
    txReason: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    txDate: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.4)',
        marginTop: 3,
    },
    txAmount: {
        fontSize: 16,
        fontWeight: '700',
    },

    // ── Empty ──
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 48,
        paddingBottom: 48,
    },
    emptyEmoji: {
        fontSize: 56,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.6)',
    },
    emptySubtext: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.35)',
        marginTop: 6,
    },

    // ── FAB ──
    fab: {
        position: 'absolute',
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.4)',
    },
    fabText: {
        fontSize: 28,
        color: '#FFFFFF',
        fontWeight: '600',
    },
});

export default WalletDetailScreen;
