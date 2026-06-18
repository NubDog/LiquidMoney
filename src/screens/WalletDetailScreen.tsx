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
    Platform,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, interpolate, Extrapolation, runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MoreVertical, Plus } from 'lucide-react-native';

// ─── Components ───────────────────────────────────────────────────────────────

import AppleSegmentedControl from '../components/ui/AppleSegmentedControl';
import TransactionModal from '../components/modals/TransactionModal';
import AppleTransactionRow from '../components/ui/AppleTransactionRow';
import TransactionDetailOverlay from '../components/overlays/TransactionDetailOverlay';
import ConfirmDialog from '../components/modals/ConfirmDialog';
import EditWalletModal from '../components/modals/EditWalletModal';
import ApplePopupMenu from '../components/ui/ApplePopupMenu';
import AppleIconButton from '../components/ui/AppleIconButton';
import LiquidBackground from '../components/layout/LiquidBackground';
import { WalletDetailSkeleton } from '../components/layout/skeletons/WalletDetailSkeleton';
import AppleEmptyState from '../components/ui/AppleEmptyState';
import AppleSummaryCard from '../components/ui/AppleSummaryCard';

// ─── Shared ───────────────────────────────────────────────────────────────────
import { useStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
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
    onFabPressRef: React.MutableRefObject<(() => void) | null>;
    isTransitioning: boolean;
}

const WalletPayload: React.FC<WalletPayloadProps> = ({
    walletId,
    onGoBack,
    menuBtnRef,
    onMenuPressRef,
    onFabPressRef,
    isTransitioning,
}) => {
    const insets = useSafeAreaInsets();
    const {
        currentWallet,
        transactions,
        refreshTransactions,
        loadMoreTransactions,
        hasMoreTransactions,
        addTransaction,
        editTransaction,
        removeTransaction,
        adjustWalletBalance,
        removeWallet,
    } = useStore(useShallow(state => ({
        currentWallet: state.currentWallet,
        transactions: state.transactions,
        refreshTransactions: state.refreshTransactions,
        loadMoreTransactions: state.loadMoreTransactions,
        hasMoreTransactions: state.hasMoreTransactions,
        addTransaction: state.addTransaction,
        editTransaction: state.editTransaction,
        removeTransaction: state.removeTransaction,
        adjustWalletBalance: state.adjustWalletBalance,
        removeWallet: state.removeWallet,
    })));

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

    useEffect(() => {
        onFabPressRef.current = handleOpenCreate;
        return () => { onFabPressRef.current = null; };
    }, [handleOpenCreate, onFabPressRef]);

    const handleViewTransaction = useCallback((tx: Transaction) => {
        setViewingTx(tx);
    }, []);

    const handleGoBackFromDetail = useCallback(() => {
        setViewingTx(null);
    }, []);

    const handleSave = useCallback(
        (type: 'IN' | 'OUT', amount: number, reason?: string | null, imageUri?: string | null, customDate?: string) => {
            if (editingTx) {
                // Editing existing transaction (does not support changing date yet)
                editTransaction(editingTx.id, walletId, type, amount, reason, imageUri);
            } else {
                addTransaction(walletId, type, amount, reason, imageUri, customDate);
            }
        },
        [editingTx, walletId, addTransaction, editTransaction],
    );

    const handleOpenEditTransaction = useCallback(() => {
        if (viewingTx) {
            setEditingTx(viewingTx);
            setViewingTx(null); // Close detail overlay
            setModalVisible(true); // Open edit modal
        }
    }, [viewingTx]);

    const handleDeleteFromDetail = useCallback(
        (id: string, wId: string) => {
            removeTransaction(id, wId);
        },
        [removeTransaction],
    );

    const handleDelete = useCallback(() => {
        if (editingTx) {
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
        async (name: string, currentBalance: number, imageUri: string | null) => {
            if (currentWallet) {
                let finalImageUri = currentWallet.image_uri;
                if (imageUri !== undefined && imageUri !== currentWallet.image_uri) {
                    const { imageService } = require('../services/imageService');
                    if (imageUri) {
                        finalImageUri = await imageService.saveImageToLocal(imageUri);
                    } else {
                        finalImageUri = null;
                    }
                    if (currentWallet.image_uri) {
                        await imageService.deleteLocalImage(currentWallet.image_uri);
                    }
                }

                adjustWalletBalance(
                    walletId,
                    name,
                    currentBalance,
                    currentWallet.current_balance,
                    currentWallet.initial_balance,
                    currentWallet.icon,
                    finalImageUri
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
        ({ item, index }: { item: Transaction, index: number }) => (
            <AppleTransactionRow item={item} index={index} onPress={handleViewTransaction} />
        ),
        [handleViewTransaction],
    );

    const listHeader = useMemo(
        () => (
            <View>
                <View collapsable={false}>
                    <AppleSummaryCard
                        walletName={wallet?.name || 'Ví'}
                        currentBalance={wallet?.current_balance || 0}
                        initialBalance={wallet?.initial_balance || 0}
                        balanceDiff={balanceDiff}
                        diffColor={diffColor}
                        imageUri={wallet?.image_uri}
                        style={styles.summaryCard}
                    />
                </View>

                <View style={styles.filterWrapper}>
                    <AppleSegmentedControl
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
            <AppleEmptyState
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
            <ApplePopupMenu
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
                data={isTransitioning ? [] : transactions}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ListHeaderComponent={listHeader}
                ListEmptyComponent={isTransitioning ? null : listEmpty}
                contentContainerStyle={[styles.listContent, { paddingTop: insets.top + 66 + Spacing.xl }]}
                showsVerticalScrollIndicator={false}
                initialNumToRender={12}
                maxToRenderPerBatch={12}
                windowSize={5}
                removeClippedSubviews={Platform.OS === 'android'}
                // @ts-ignore - Thuộc tính này có thật trên Native (ScrollView) nhưng bị thiếu trong TypeScript
                delaysContentTouches={false}
                onEndReached={() => {
                    if (hasMoreTransactions && !isTransitioning) {
                        const filterType: 'IN' | 'OUT' | undefined = filterIndex === 1 ? 'IN' : filterIndex === 2 ? 'OUT' : undefined;
                        loadMoreTransactions(walletId, filterType);
                    }
                }}
                onEndReachedThreshold={0.5}
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
                            date: editingTx.created_at,
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
                    onEditRequest={handleOpenEditTransaction}
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
                walletImageUri={wallet?.image_uri}
            />

            {/* Delete Confirm Dialog */}
            <ConfirmDialog
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
    const { selectWallet, refreshTransactions } = useStore(useShallow(state => ({
        selectWallet: state.selectWallet,
        refreshTransactions: state.refreshTransactions
    })));

    const [isReady, setIsReady] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const transitionAnim = useSharedValue(0);

    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const handleTransitionComplete = useCallback(() => {
        if (!mountedRef.current) return;
        setShowContent(true);
        // Đợi TẤT CẢ animation (kể cả mờ màn hình chính) kết thúc hẳn rồi mới render danh sách giao dịch
        InteractionManager.runAfterInteractions(() => {
            if (mountedRef.current) {
                setIsTransitioning(false);
            }
        });
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                selectWallet(walletId);
                refreshTransactions(walletId);
            } catch (err) {
                console.error('Error in fetchWalletData:', err);
            }

            // Đợi 500ms để hiển thị Skeleton (Tạo cảm giác tải dữ liệu tự nhiên)
            await delay(500);

            if (!mountedRef.current) return;

            // Immediately mount payload in transition state to prepare layout
            setIsReady(true);
            
            // Defer loading heavy FlatList items to free up JS Thread for animation
            if (!mountedRef.current) return;
            
            transitionAnim.value = withTiming(1, {
                duration: 400, // Super fast transition
                easing: Easing.out(Easing.cubic),
            }, (finished) => {
                if (finished) {
                    runOnJS(handleTransitionComplete)();
                }
            });
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletId]);

    const menuBtnRef = useRef<View>(null);
    const menuPressRef = useRef<(() => void) | null>(null);
    const fabPressRef = useRef<(() => void) | null>(null);

    const handleMenuPress = useCallback(() => {
        menuPressRef.current?.();
    }, []);

    const handleFabPress = useCallback(() => {
        fabPressRef.current?.();
    }, []);

    // ─── Pro Max Animation Interpolations ───────────────────────────────────────
    const animatedSkelStyle = useAnimatedStyle(() => ({
        opacity: interpolate(transitionAnim.value, [0, 1], [1, 0], Extrapolation.CLAMP),
        transform: [
            { scale: interpolate(transitionAnim.value, [0, 1], [1, 0.95], Extrapolation.CLAMP) },
            { translateY: interpolate(transitionAnim.value, [0, 1], [0, -15], Extrapolation.CLAMP) }
        ]
    }));

    const animatedPayloadStyle = useAnimatedStyle(() => ({
        opacity: interpolate(transitionAnim.value, [0, 1], [0, 1], Extrapolation.CLAMP),
        transform: [
            { scale: interpolate(transitionAnim.value, [0, 1], [0.95, 1], Extrapolation.CLAMP) },
            { translateY: interpolate(transitionAnim.value, [0, 1], [20, 0], Extrapolation.CLAMP) }
        ]
    }));

    return (
        <View style={styles.container}>


            {/* LAYER 1: IMMEDIATE SHELL */}
            <View style={[styles.topBar, { paddingTop: insets.top + 12, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }]}>
                <AppleIconButton 
                    onPress={onGoBack} 
                    style={[styles.backBtn, { borderWidth: 0, shadowOpacity: 0, elevation: 0 }]} 
                    backgroundColor="transparent"
                    size={42} 
                    icon={<ChevronLeft size={24} color={Colors.text} />} 
                />

                <View style={{ flex: 1 }} />

                <View ref={menuBtnRef} collapsable={false}>
                    <AppleIconButton
                        onPress={handleMenuPress}
                        style={[styles.menuBtn, !isReady && { opacity: 0.5 }, { borderWidth: 0, shadowOpacity: 0, elevation: 0 }]}
                        backgroundColor="transparent"
                        disabled={!isReady}
                        size={42}
                        icon={<MoreVertical size={22} color={Colors.text} strokeWidth={1.5} />}
                    />
                </View>
            </View>

            {/* CONTENT: Skeleton → Payload Drift & Expand Transition */}
            <View style={StyleSheet.absoluteFill}>
                {/* Skeleton (Exit Layer) */}
                {!showContent && (
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            StyleSheet.absoluteFill,
                            {
                                paddingTop: insets.top + 66,
                            },
                            animatedSkelStyle
                        ]}
                    >
                        <WalletDetailSkeleton />
                    </Animated.View>
                )}

                {/* Payload (Entrance Layer) */}
                {isReady && (
                    <Animated.View
                        style={[
                            StyleSheet.absoluteFill,
                            animatedPayloadStyle
                        ]}
                    >
                        <WalletPayload
                            walletId={walletId}
                            onGoBack={onGoBack}
                            menuBtnRef={menuBtnRef}
                            onMenuPressRef={menuPressRef}
                            onFabPressRef={fabPressRef}
                            isTransitioning={isTransitioning}
                        />
                    </Animated.View>
                )}
            </View>

            {/* LAYER 4: IMMEDIATE FAB (Independent of Skeleton delay) */}
            <AppleIconButton
                icon={<Plus strokeWidth={1.5} color="#FFF" size={32} />}
                size={60}
                onPress={handleFabPress}
                style={{ position: 'absolute', bottom: 140, right: 20, zIndex: 9999, shadowColor: 'rgba(0, 0, 0, 0.6)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 0 }}
            />
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
        paddingHorizontal: Spacing.md,
        paddingBottom: 100,
    },

    // ── Summary Card ──
    summaryCard: {
        marginBottom: Spacing.xl,
        overflow: 'hidden',
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
