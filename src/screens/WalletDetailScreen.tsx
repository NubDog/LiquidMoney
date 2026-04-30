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
    Easing,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MoreVertical, Plus } from 'lucide-react-native';

// ─── Components ───────────────────────────────────────────────────────────────
import AppleGlassBackground from '../components/ui/AppleGlassBackground';
import LiquidSegmentedControl2 from '../components/inputs/LiquidSegmentedControl2';
import TransactionModal from '../components/modals/TransactionModal';
import AppleTransactionRow from '../components/ui/AppleTransactionRow';
import TransactionDetailOverlay from '../components/overlays/TransactionDetailOverlay';
import ConfirmDialog2 from '../components/modals/ConfirmDialog2';
import EditWalletModal from '../components/modals/EditWalletModal';
import PopupMenu from '../components/overlays/PopupMenu';
import IconButton from '../components/buttons/IconButton';
import LiquidBackground from '../components/layout/LiquidBackground';
import { WalletDetailSkeleton } from '../components/layout/WalletDetailSkeleton';
import EmptyState2 from '../components/layout/EmptyState2';

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
        adjustWalletBalance,
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
        (type: 'IN' | 'OUT', amount: number, reason?: string | null, imageUri?: string | null, customDate?: string) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            if (editingTx) {
                // Editing existing transaction (does not support changing date yet)
                editTransaction(editingTx.id, walletId, type, amount, reason, imageUri);
            } else {
                addTransaction(walletId, type, amount, reason, imageUri, customDate);
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
            if (currentWallet) {
                adjustWalletBalance(
                    walletId,
                    name,
                    currentBalance,
                    currentWallet.current_balance,
                    currentWallet.initial_balance,
                    currentWallet.icon
                );
            }
        },
        [walletId, adjustWalletBalance, currentWallet],
    );

    // ─── Derived ────────────────────────────────────────────────────────────
    const wallet = currentWallet;
    const balanceDiff = wallet ? wallet.current_balance - wallet.initial_balance : 0;
    const diffColor = balanceDiff >= 0 ? Colors.income : Colors.expense;

    // ─── Render ─────────────────────────────────────────────────────────────
    const renderItem = useCallback(
        ({ item }: { item: Transaction }) => (
            <AppleTransactionRow item={item} onPress={handleViewTransaction} />
        ),
        [handleViewTransaction],
    );

    const listHeader = useMemo(
        () => (
            <View>
                <View collapsable={false}>
                    <AppleGlassBackground
                        style={styles.summaryCard}
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
                    </AppleGlassBackground>
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
            <EmptyState2
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
                initialNumToRender={6}
                maxToRenderPerBatch={5}
                windowSize={5}
                removeClippedSubviews={Platform.OS === 'android'}
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
            <ConfirmDialog2
                visible={deleteDialogVisible}
                title="Xóa ví"
                message={`Bạn có chắc muốn xóa ví "${wallet?.name || ''}"?\nToàn bộ giao dịch sẽ bị xóa vĩnh viễn.`}
                cancelText="Hủy"
                confirmText="Xóa"
                isDestructive
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
    const transitionAnim = useRef(new Animated.Value(0)).current;

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

                    // Delay animation by 500ms (0.5s) to allow JS thread to completely finish rendering heavy payload
                    setTimeout(() => {
                        if (!mounted) return;
                        Animated.timing(transitionAnim, {
                            toValue: 1,
                            useNativeDriver: true,
                            duration: 400,
                            easing: Easing.out(Easing.cubic),
                        }).start(() => {
                            if (mounted) { setShowContent(true); }
                        });
                    }, 500);
                }
            } catch (error) {
                console.error('[WalletDetailScreen] loadContent error:', error);
                if (mounted) {
                    setIsReady(true);
                    transitionAnim.setValue(1);
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

    // ─── Pro Max Animation Interpolations ───────────────────────────────────────
    const skelOpacity = transitionAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
    const skelScale = transitionAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.95] });
    const skelTranslateY = transitionAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -15] });

    const payloadOpacity = transitionAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
    const payloadScale = transitionAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] });
    const payloadTranslateY = transitionAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>


            {/* LAYER 1: IMMEDIATE SHELL */}
            <View style={styles.topBar}>
                <IconButton onPress={onGoBack} style={styles.backBtn} size={42} icon={<ChevronLeft size={24} color={Colors.text} />} />

                <View style={{ flex: 1 }} />

                <View ref={menuBtnRef} collapsable={false}>
                    <IconButton
                        onPress={handleMenuPress}
                        style={[styles.menuBtn, !isReady && { opacity: 0.5 }]}
                        disabled={!isReady}
                        size={42}
                        icon={<MoreVertical size={22} color={Colors.text} strokeWidth={1.5} />}
                    />
                </View>
            </View>

            {/* CONTENT: Skeleton → Payload Drift & Expand Transition */}
            <View style={{ flex: 1, position: 'relative' }}>
                {/* Skeleton (Exit Layer) */}
                {!showContent && (
                    <Animated.View
                        pointerEvents="none"
                        renderToHardwareTextureAndroid={true}
                        needsOffscreenAlphaCompositing={!showContent}
                        style={[
                            StyleSheet.absoluteFill,
                            {
                                opacity: skelOpacity,
                                transform: [{ scale: skelScale }, { translateY: skelTranslateY }]
                            }
                        ]}
                    >
                        <WalletDetailSkeleton />
                    </Animated.View>
                )}

                {/* Payload (Entrance Layer) */}
                {isReady && (
                    <Animated.View
                        pointerEvents={showContent ? 'auto' : 'none'}
                        renderToHardwareTextureAndroid={true}
                        needsOffscreenAlphaCompositing={!showContent}
                        style={[
                            StyleSheet.absoluteFill,
                            {
                                opacity: payloadOpacity,
                                transform: [{ scale: payloadScale }, { translateY: payloadTranslateY }]
                            }
                        ]}
                    >
                        <WalletPayload
                            walletId={walletId}
                            onGoBack={onGoBack}
                            menuBtnRef={menuBtnRef}
                            onMenuPressRef={menuPressRef}
                        />
                    </Animated.View>
                )}
            </View>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
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
        paddingTop: Spacing.xl,
        paddingHorizontal: Spacing.md,
        paddingBottom: 100,
    },

    // ── Summary Card ──
    summaryCard: {
        marginBottom: Spacing.xl,
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
        marginBottom: Spacing.xl,
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
