/**
 * WalletDetailScreen.tsx — Wallet detail + transaction list
 *
 * Architecture: Shell & Skeleton → Deferred Payload
 *  Layer 1 (Frame 1): Lightweight shell — root View, SafeArea, Header
 *  Layer 2 (During transition): Animated skeleton loader
 *  Layer 3 (After transition): Heavy payload — Zustand, FlatList, Modals
 *
 * Refactored: Extracted EditWalletModal, PopupMenu, TransactionRow,
 * TransactionDetailOverlay, EmptyState into standalone components.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    FlatList,
    InteractionManager,
    LayoutAnimation,
    Pressable,
    StyleSheet,
    Text,
    View,
    Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MoreVertical, Plus } from 'lucide-react-native';

// ─── Components ───────────────────────────────────────────────────────────────
import LiquidCard from '../components/LiquidCard';
import LiquidSegmentedControl2 from '../components/LiquidSegmentedControl2';
import TransactionModal from '../components/TransactionModal';
import TransactionRow2 from '../components/TransactionRow2';
import TransactionDetailOverlay from '../components/TransactionDetailOverlay';
import ConfirmDialog from '../components/ConfirmDialog';
import EditWalletModal from '../components/EditWalletModal';
import PopupMenu from '../components/PopupMenu';
import IconButton from '../components/IconButton';
import LiquidBackground from '../components/LiquidBackground';
import LiquidIconButton from '../components/LiquidIconButton';
import { WalletDetailSkeleton } from '../components/WalletDetailSkeleton';
import EmptyState from '../components/EmptyState';

// ─── Shared ───────────────────────────────────────────────────────────────────
import { useStore } from '../store/useStore';
import { formatVND } from '../common/formatters';
import { Colors, FontSizes, Radii, Spacing } from '../common/theme';
import type { Transaction } from '../common/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface WalletDetailScreenProps {
    walletId: string;
    onGoBack: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_SEGMENTS = ['Tất cả', 'Thu', 'Chi'];
const FILTER_OPTIONS = FILTER_SEGMENTS.map((seg, i) => ({ key: i.toString(), label: seg }));

// ─── LAYER 3: HEAVY PAYLOAD ───────────────────────────────────────────────────
// Only mounted AFTER the navigation transition completes.

interface WalletPayloadProps {
    walletId: string;
    onGoBack: () => void;
    menuBtnRef: React.RefObject<View | null>;
    onMenuPressRef: React.MutableRefObject<(() => void) | null>;
}

const WalletPayload: React.FC<WalletPayloadProps> = ({
    walletId,
    onGoBack,
    menuBtnRef,
    onMenuPressRef,
}) => {
    const {
        currentWallet,
        transactions,
        refreshTransactions,
        addTransaction,
        editTransaction,
        removeTransaction,
        editWalletDirect,
        removeWallet,
    } = useStore();

    // ─── State ──────────────────────────────────────────────────────────────
    const [filterIndex, setFilterIndex] = useState(0);
    
    // Stable callback for segmented control to prevent re-renders
    const handleFilterChange = useCallback((key: string) => {
        setFilterIndex(parseInt(key, 10));
    }, []);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [viewingTx, setViewingTx] = useState<Transaction | null>(null);

    // Menu & Edit & Delete state
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuAnchorY, setMenuAnchorY] = useState(0);
    const [menuAnchorX, setMenuAnchorX] = useState(16);
    const [editWalletVisible, setEditWalletVisible] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

    // ─── Filter change → refresh ────────────────────────────────────────────
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const filterType: 'IN' | 'OUT' | undefined =
            filterIndex === 1 ? 'IN' : filterIndex === 2 ? 'OUT' : undefined;
        refreshTransactions(walletId, filterType);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterIndex, walletId]);

    // ─── Handlers: Transactions ─────────────────────────────────────────────
    const handleOpenCreate = useCallback(() => {
        setEditingTx(null);
        setModalVisible(true);
    }, []);

    const handleViewTransaction = useCallback((tx: Transaction) => {
        setViewingTx(tx);
    }, []);

    const handleGoBackFromDetail = useCallback(() => {
        setViewingTx(null);
    }, []);

    const handleSave = useCallback(
        (type: 'IN' | 'OUT', amount: number, reason?: string | null, imageUri?: string | null) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            if (editingTx) {
                editTransaction(editingTx.id, walletId, type, amount, reason, imageUri);
            } else {
                addTransaction(walletId, type, amount, reason, imageUri);
            }
        },
        [editingTx, walletId, addTransaction, editTransaction],
    );

    const handleEditFromDetail = useCallback(
        (id: string, wId: string, type: 'IN' | 'OUT', amount: number, reason?: string | null, imageUri?: string | null) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            editTransaction(id, wId, type, amount, reason, imageUri);
        },
        [editTransaction],
    );

    const handleDeleteFromDetail = useCallback(
        (id: string, wId: string) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            removeTransaction(id, wId);
        },
        [removeTransaction],
    );

    const handleDelete = useCallback(() => {
        if (editingTx) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            removeTransaction(editingTx.id, walletId);
        }
    }, [editingTx, walletId, removeTransaction]);

    // ─── Handlers: Wallet Menu ──────────────────────────────────────────────
    const handleOpenMenu = useCallback(() => {
        if (menuBtnRef.current) {
            (menuBtnRef.current as any).measureInWindow((_x: number, y: number, _width: number, height: number) => {
                setMenuAnchorY(y + height);
                setMenuAnchorX(16);
                setMenuVisible(true);
            });
        } else {
            setMenuVisible(true);
        }
    }, [menuBtnRef]);

    useEffect(() => {
        onMenuPressRef.current = handleOpenMenu;
        return () => { onMenuPressRef.current = null; };
    }, [handleOpenMenu, onMenuPressRef]);

    const handleEditWallet = useCallback(() => {
        setEditWalletVisible(true);
    }, []);

    const handleDeleteWallet = useCallback(() => {
        setDeleteDialogVisible(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        setDeleteDialogVisible(false);
        removeWallet(walletId);
        onGoBack();
    }, [walletId, removeWallet, onGoBack]);

    const handleSaveWallet = useCallback(
        (name: string, currentBalance: number) => {
            editWalletDirect(walletId, name, currentBalance, currentWallet?.icon);
        },
        [walletId, editWalletDirect, currentWallet],
    );

    // ─── Derived ────────────────────────────────────────────────────────────
    const wallet = currentWallet;
    const balanceDiff = wallet ? wallet.current_balance - wallet.initial_balance : 0;
    const diffColor = balanceDiff >= 0 ? Colors.income : Colors.expense;

    // ─── Render ─────────────────────────────────────────────────────────────
    const renderItem = useCallback(
        ({ item }: { item: Transaction }) => (
            <TransactionRow2 item={item} onPress={handleViewTransaction} variant="card" />
        ),
        [handleViewTransaction],
    );

    const listHeader = useMemo(
        () => (
            <View>
                <View collapsable={false}>
                    <LiquidCard
                        style={styles.summaryCard}
                        intensity="light"
                        
                        borderRadius={Radii.xxl}>
                        <Text style={styles.walletName}>{wallet?.name || 'Ví'}</Text>
                        <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
                        <Text style={styles.balanceAmount}>
                            {formatVND(wallet?.current_balance || 0)}
                        </Text>

                        <View collapsable={false} style={styles.balanceRow}>
                            <View style={styles.balanceCol}>
                                <Text style={styles.smallLabel}>Ban đầu</Text>
                                <Text style={styles.smallValue}>
                                    {formatVND(wallet?.initial_balance || 0)}
                                </Text>
                            </View>
                            <View style={styles.balanceCol}>
                                <Text style={styles.smallLabel}>Chênh lệch</Text>
                                <Text style={[styles.smallValue, { color: diffColor }]}>
                                    {balanceDiff >= 0 ? '+' : ''}
                                    {formatVND(balanceDiff)}
                                </Text>
                            </View>
                        </View>
                    </LiquidCard>
                </View>

                <View style={styles.filterWrapper}>
                    <LiquidSegmentedControl2
                        options={FILTER_OPTIONS}
                        selected={filterIndex.toString()}
                        onChange={handleFilterChange}
                    />
                </View>

                <Text style={styles.sectionTitle}>
                    Giao dịch ({transactions.length})
                </Text>
            </View>
        ),
        [wallet, balanceDiff, diffColor, filterIndex, transactions.length],
    );

    const listEmpty = useMemo(
        () => (
            <EmptyState
                animation="noresult"
                title="Chưa có giao dịch"
                subtitle="Nhấn nút + để tạo giao dịch đầu tiên"
            />
        ),
        [],
    );

    return (
        <>
            {/* Popup Menu */}
            <PopupMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                items={[
                    { id: 'edit', label: 'Sửa ví', onPress: handleEditWallet },
                    { id: 'delete', label: 'Xóa ví', onPress: handleDeleteWallet, color: '#ef4444' }
                ]}
                anchor={{ x: menuAnchorX, y: menuAnchorY }}
            />

            {/* Transaction List */}
            <FlatList
                data={transactions}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ListHeaderComponent={listHeader}
                ListEmptyComponent={listEmpty}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* FAB */}
            <IconButton 
                icon={<Plus strokeWidth={1.5} color="#FFF" size={32} />}
                size={60}
                onPress={handleOpenCreate} 
                style={{ position: 'absolute', bottom: 140, right: 20, zIndex: 9999, shadowColor: 'rgba(0, 0, 0, 0.6)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 10 }} 
            />

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
                            image_uri: editingTx.image_uri,
                        }
                        : null
                }
            />

            {/* Transaction Detail Overlay */}
            {viewingTx && (
                <TransactionDetailOverlay
                    visible={!!viewingTx}
                    transaction={viewingTx}
                    walletName={wallet?.name || 'Ví'}
                    onGoBack={handleGoBackFromDetail}
                    onClose={handleGoBackFromDetail}
                    onEdit={handleEditFromDetail}
                    onDelete={handleDeleteFromDetail}
                />
            )}

            {/* Edit Wallet Modal */}
            <EditWalletModal
                visible={editWalletVisible}
                onClose={() => setEditWalletVisible(false)}
                onSave={handleSaveWallet}
                walletName={wallet?.name || ''}
                walletBalance={wallet?.current_balance || 0}
            />

            {/* Delete Confirm Dialog */}
            <ConfirmDialog
                visible={deleteDialogVisible}
                title="Xóa ví"
                message={`Bạn có chắc muốn xóa ví "${wallet?.name || ''}"?\nToàn bộ giao dịch sẽ bị xóa vĩnh viễn.`}
                cancelText="Hủy"
                confirmText="Xóa"
                confirmColor="#ef4444"
                onCancel={() => setDeleteDialogVisible(false)}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT COMPONENT: SHELL
// ═══════════════════════════════════════════════════════════════════════════════

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const WalletDetailScreen: React.FC<WalletDetailScreenProps> = ({
    walletId,
    onGoBack,
}) => {
    const insets = useSafeAreaInsets();
    const { selectWallet, refreshTransactions } = useStore();

    const [isReady, setIsReady] = useState(false);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                await new Promise<void>(resolve => {
                    InteractionManager.runAfterInteractions(() => resolve());
                });

                try {
                    selectWallet(walletId);
                    refreshTransactions(walletId);
                } catch (err) {
                    console.error('Error in fetchWalletData:', err);
                }

                await delay(800);

                if (mounted) {
                    setIsReady(true);
                    setTimeout(() => {
                        if (mounted) { setShowContent(true); }
                    }, 50);
                }
            } catch (error) {
                console.error('[WalletDetailScreen] loadContent error:', error);
                if (mounted) {
                    setIsReady(true);
                    setShowContent(true);
                }
            }
        };

        load();
        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletId]);

    const menuBtnRef = useRef<View>(null);
    const menuPressRef = useRef<(() => void) | null>(null);

    const handleMenuPress = useCallback(() => {
        menuPressRef.current?.();
    }, []);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Vibe Layer: Mesh Background drives the Liquid Glass */}
            <View style={StyleSheet.absoluteFill}>
                <LiquidBackground />
            </View>

            {/* LAYER 1: IMMEDIATE SHELL */}
            <View style={styles.topBar}>
                <LiquidIconButton onPress={onGoBack} style={styles.backBtn} size={42}>
                    <ChevronLeft size={24} color={Colors.text} />
                </LiquidIconButton>

                <View style={{ flex: 1 }} />

                <View ref={menuBtnRef} collapsable={false}>
                    <LiquidIconButton
                        onPress={handleMenuPress}
                        style={[styles.menuBtn, !isReady && { opacity: 0.5 }]}
                        disabled={!isReady}
                        size={42}>
                        <MoreVertical size={22} color={Colors.text} strokeWidth={1.5} />
                    </LiquidIconButton>
                </View>
            </View>

            {/* CONTENT: Skeleton → Payload swap */}
            {!isReady ? (
                <View style={{ flex: 1 }}>
                    <WalletDetailSkeleton />
                </View>
            ) : (
                <View style={[styles.payloadContainer, { opacity: showContent ? 1 : 0 }]}>
                    <WalletPayload
                        walletId={walletId}
                        onGoBack={onGoBack}
                        menuBtnRef={menuBtnRef}
                        onMenuPressRef={menuPressRef}
                    />
                </View>
            )}
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: 12,
    },
    backBtn: {
    },
    menuBtn: {
    },
    payloadContainer: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: Spacing.md,
        paddingBottom: 100,
    },

    // ── Summary Card ──
    summaryCard: {
        marginBottom: Spacing.md,
        overflow: 'hidden',
    },
    walletName: {
        fontSize: FontSizes.lg + 2,
        fontWeight: '700',
        color: Colors.text,
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.md,
        backgroundColor: 'transparent',
    },
    balanceLabel: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginTop: 12,
        marginHorizontal: Spacing.lg,
    },
    balanceAmount: {
        fontSize: FontSizes.title,
        fontWeight: '800',
        color: Colors.text,
        marginHorizontal: Spacing.lg,
        marginTop: 2,
        letterSpacing: -1,
        backgroundColor: 'transparent',
        textShadowColor: 'transparent',
        textShadowRadius: 0,
    },
    balanceRow: {
        flexDirection: 'row',
        marginTop: Spacing.md,
        marginBottom: Spacing.lg,
        marginHorizontal: Spacing.lg,
        gap: Spacing.md,
    },
    balanceCol: {
        flex: 1,
    },
    smallLabel: {
        fontSize: FontSizes.xs + 1,
        color: Colors.textMuted,
        marginBottom: 2,
    },
    smallValue: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.85)',
        backgroundColor: 'transparent',
    },

    // ── Filter ──
    filterWrapper: {
        marginBottom: Spacing.md,
    },

    // ── Section ──
    sectionTitle: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 12,
    },
});

export default WalletDetailScreen;
