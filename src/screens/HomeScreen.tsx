/**
 * HomeScreen.tsx — Main screen showing wallet list
 * FlatList + FAB + Empty State + WalletModal
 *
 * Refactored: Uses shared formatters, theme tokens, EmptyState component.
 * Fixed: Inline ItemSeparatorComponent lambda → named component.
 * Cleaned: Removed empty cardWrapper style, duplicate FAB comment.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import Animated, {
    Easing,
    FadeInDown,
    FadeOutUp,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { Wallet as WalletIcon, PieChart, Plus, Check } from 'lucide-react-native';
import AppleEmptyState from '../components/ui/AppleEmptyState';
import WalletModal from '../components/modals/WalletModal';
import EditWalletModal from '../components/modals/EditWalletModal';
import AppleIconButton from '../components/ui/AppleIconButton';
import ReorderableWalletCard from '../components/ui/ReorderableWalletCard';
import QuickTransactionModal from '../components/modals/QuickTransactionModal';
import { formatVNDTruncated } from '../common/formatters';
import { FontSizes, Spacing } from '../common/theme';
import type { Wallet } from '../common/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface HomeScreenProps {
    onNavigateToWallet?: (walletId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToWallet }) => {
    const insets = useSafeAreaInsets();
    const { width: screenWidth } = useWindowDimensions();
    const {
        wallets,
        addWallet,
        adjustWalletBalance,
        removeWallet,
        refreshWallets,
        addTransaction,
        isReorderingWallets,
        setIsReorderingWallets,
        reorderWallets,
        saveWalletOrderDirectly,
    } = useStore(useShallow(state => ({
        wallets: state.wallets,
        addWallet: state.addWallet,
        adjustWalletBalance: state.adjustWalletBalance,
        removeWallet: state.removeWallet,
        refreshWallets: state.refreshWallets,
        addTransaction: state.addTransaction,
        isReorderingWallets: state.isReorderingWallets,
        setIsReorderingWallets: state.setIsReorderingWallets,
        reorderWallets: state.reorderWallets,
        saveWalletOrderDirectly: state.saveWalletOrderDirectly,
    })));

    // ─── Reordering & Drag Shared Values ──────────────────────────────────────
    const orderMap = useSharedValue<number[]>([]);
    const activeDragIndex = useSharedValue<number>(-1);
    const activeTargetSlot = useSharedValue<number>(-1);
    const dragPanY = useSharedValue<number>(0);
    const isDragging = useSharedValue<boolean>(false);

    // Latest reordered wallets reference
    const currentOrderedWalletsRef = useRef<Wallet[]>(wallets);

    useEffect(() => {
        orderMap.value = wallets.map((_, i) => i);
        currentOrderedWalletsRef.current = wallets;
    }, [wallets, orderMap]);

    // Card aspect ratio is 2.2, Spacing.md * 2 = 32, separator is 14
    const defaultSlotHeight = useMemo(() => {
        const cardWidth = screenWidth - Spacing.md * 2;
        return Math.round(cardWidth / 2.2 + 14);
    }, [screenWidth]);

    // FAB hide animation
    const fabAnim = useSharedValue(1);

    useEffect(() => {
        fabAnim.value = withTiming(isReorderingWallets ? 0 : 1, {
            duration: 250,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
    }, [isReorderingWallets, fabAnim]);

    const animatedFabStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: fabAnim.value },
            { translateY: (1 - fabAnim.value) * 60 },
        ],
        opacity: fabAnim.value,
    }));

    // Cleanup reorder mode on unmount
    useEffect(() => {
        return () => {
            if (currentOrderedWalletsRef.current !== wallets) {
                useStore.getState().reorderWallets(currentOrderedWalletsRef.current);
            }
            useStore.getState().setIsReorderingWallets(false);
        };
    }, [wallets]);

    // ─── Modal State ──────────────────────────────────────────────────────────
    const [modalVisible, setModalVisible] = useState(false);
    const [editWalletVisible, setEditWalletVisible] = useState(false);
    const [quickModalVisible, setQuickModalVisible] = useState(false);
    const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // ─── Total balance ────────────────────────────────────────────────────────
    const totalBalance = useMemo(
        () => wallets.reduce((sum, w) => sum + w.current_balance, 0),
        [wallets],
    );

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const openCreateModal = useCallback(() => {
        setEditingWallet(null);
        setModalVisible(true);
    }, []);

    const openEditModal = useCallback((wallet: Wallet) => {
        setEditingWallet(wallet);
        setEditWalletVisible(true);
    }, []);

    const handleSave = useCallback(
        (name: string, initialBalance: number, imageUri?: string | null, icon?: string | null) => {
            addWallet(name, initialBalance, imageUri, icon);
        },
        [addWallet],
    );

    const handleSaveWalletBalance = useCallback(
        async (name: string, currentBalance: number, imageUri: string | null) => {
            if (editingWallet) {
                let finalImageUri = editingWallet.image_uri;
                if (imageUri !== undefined && imageUri !== editingWallet.image_uri) {
                    const { imageService } = require('../services/imageService');
                    if (imageUri) {
                        finalImageUri = await imageService.saveImageToLocal(imageUri);
                    } else {
                        finalImageUri = null;
                    }
                    if (editingWallet.image_uri) {
                        await imageService.deleteLocalImage(editingWallet.image_uri);
                    }
                }
                
                adjustWalletBalance(
                    editingWallet.id,
                    name,
                    currentBalance,
                    editingWallet.current_balance,
                    editingWallet.initial_balance,
                    editingWallet.icon,
                    finalImageUri
                );
            }
        },
        [editingWallet, adjustWalletBalance],
    );

    // ─── Reorder & Drag Handlers ──────────────────────────────────────────────

    const handleStartReordering = useCallback(() => {
        setIsReorderingWallets(true);
    }, [setIsReorderingWallets]);

    const handleExitReordering = useCallback(() => {
        if (isReorderingWallets) {
            setIsReorderingWallets(false);
            if (currentOrderedWalletsRef.current !== wallets) {
                reorderWallets(currentOrderedWalletsRef.current);
            }
        }
    }, [isReorderingWallets, setIsReorderingWallets, reorderWallets, wallets]);

    const handleDragCommit = useCallback(
        (newOrderMap: number[]) => {
            const sorted: Wallet[] = [];
            for (let slot = 0; slot < wallets.length; slot++) {
                const originalIdx = newOrderMap.findIndex((s) => s === slot);
                if (originalIdx !== -1 && wallets[originalIdx]) {
                    sorted.push(wallets[originalIdx]);
                }
            }
            if (sorted.length === wallets.length) {
                currentOrderedWalletsRef.current = sorted;
                saveWalletOrderDirectly(sorted);
            }
        },
        [wallets, saveWalletOrderDirectly],
    );

    // ─── Render Item ──────────────────────────────────────────────────────────

    const renderWalletItem = useCallback(
        ({ item, index }: { item: Wallet; index: number }) => (
            <ReorderableWalletCard
                item={item}
                index={index}
                totalCount={wallets.length}
                slotHeight={defaultSlotHeight}
                isReordering={isReorderingWallets}
                orderMap={orderMap}
                activeDragIndex={activeDragIndex}
                activeTargetSlot={activeTargetSlot}
                dragPanY={dragPanY}
                isDragging={isDragging}
                onNavigate={(walletId) => onNavigateToWallet?.(walletId)}
                onStartReordering={handleStartReordering}
                onDragCommit={handleDragCommit}
            />
        ),
        [
            wallets.length,
            defaultSlotHeight,
            isReorderingWallets,
            orderMap,
            activeDragIndex,
            activeTargetSlot,
            dragPanY,
            isDragging,
            onNavigateToWallet,
            handleStartReordering,
            handleDragCommit,
        ],
    );

    const keyExtractor = useCallback((item: Wallet) => item.id, []);

    // ─── Empty State ──────────────────────────────────────────────────────────

    const emptyState = useMemo(
        () => (
            <AppleEmptyState
                animation="nodata"
                title="Chưa có ví nào"
                subtitle="Nhấn nút + bên dưới để tạo ví đầu tiên"
            />
        ),
        [],
    );

    const handleQuickSaveTransaction = useCallback(
        async (walletId: string, type: 'IN' | 'OUT', amount: number, reason?: string) => {
            addTransaction(walletId, type, amount, reason || null, null, new Date().toISOString());
            refreshWallets();
        },
        [addTransaction, refreshWallets],
    );

    // ─── Header & Footer ──────────────────────────────────────────────────────

    const ListHeader = useMemo(
        () => (
            <Pressable
                onPress={handleExitReordering}
                disabled={!isReorderingWallets}
                style={styles.headerSection}
            >
                {wallets.length > 0 && (
                    <View collapsable={false} style={styles.totalSection}>
                        <View collapsable={false} style={styles.heroHeader}>
                            <View style={styles.heroIconWrapper}>
                                <PieChart size={22} color="#FFFFFF" strokeWidth={2.5} />
                            </View>
                            <Text style={styles.heroLabel}>TỔNG TÀI SẢN</Text>
                        </View>

                        <View collapsable={false}>
                            <Text style={styles.heroBalance} numberOfLines={1} adjustsFontSizeToFit>
                                {formatVNDTruncated(totalBalance)}
                            </Text>
                        </View>

                        <View style={styles.heroFooter}>
                            {isReorderingWallets ? (
                                <Animated.View
                                    entering={FadeInDown.duration(250)}
                                    exiting={FadeOutUp.duration(200)}
                                    style={styles.reorderNoticeBadge}
                                >
                                    <Check size={14} color="#32D74B" strokeWidth={3} />
                                    <Text style={styles.reorderNoticeText}>
                                        Chạm chỗ trống để hoàn tất
                                    </Text>
                                </Animated.View>
                            ) : (
                                <View style={styles.badge}>
                                    <WalletIcon size={14} color="#FFFFFF" strokeWidth={2.5} />
                                    <Text style={styles.badgeText}>{wallets.length} ví hoạt động</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
            </Pressable>
        ),
        [wallets.length, totalBalance, isReorderingWallets, handleExitReordering],
    );

    const ListFooter = useMemo(
        () => (
            <Pressable
                onPress={handleExitReordering}
                disabled={!isReorderingWallets}
                style={styles.listFooter}
            />
        ),
        [isReorderingWallets, handleExitReordering],
    );

    const ItemSeparator = useCallback(
        () => (
            <Pressable
                onPress={handleExitReordering}
                disabled={!isReorderingWallets}
                style={styles.separator}
            />
        ),
        [isReorderingWallets, handleExitReordering],
    );

    // ─── Render ───────────────────────────────────────────────────────────────

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        refreshWallets();
        setTimeout(() => setRefreshing(false), 300);
    }, [refreshWallets]);

    return (
        <View style={styles.container}>
            <FlatList
                data={wallets}
                renderItem={renderWalletItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={ListHeader}
                ListFooterComponent={ListFooter}
                ListEmptyComponent={emptyState}
                contentContainerStyle={[styles.listContent, { paddingTop: insets.top }]}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={ItemSeparator}
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                windowSize={7}
                removeClippedSubviews={false}
                scrollEnabled={true}
                // @ts-ignore: delaysContentTouches is a valid ScrollView prop but missing in FlatList types
                delaysContentTouches={false}
                refreshControl={
                    isReorderingWallets ? undefined : (
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="rgba(255,255,255,0.3)"
                            colors={['#22d3ee']}
                        />
                    )
                }
            />

            {/* Add Wallet Button with Reanimated Hide/Show Animation */}
            <Animated.View
                pointerEvents={isReorderingWallets ? 'none' : 'auto'}
                style={[styles.fabWrapper, animatedFabStyle]}
            >
                <AppleIconButton 
                    icon={<Plus strokeWidth={1.5} color="#FFF" size={32} />}
                    size={60}
                    onPress={openCreateModal} 
                    style={{ 
                        shadowColor: 'rgba(0, 0, 0, 0.6)',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 1,
                        shadowRadius: 10,
                        elevation: 0,
                    }} 
                />
            </Animated.View>

            {/* Create wallet modal */}
            <WalletModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSave}
                editData={null}
            />

            {/* Edit wallet modal */}
            {editingWallet && (
                <EditWalletModal
                    visible={editWalletVisible}
                    onClose={() => setEditWalletVisible(false)}
                    onSave={handleSaveWalletBalance}
                    walletName={editingWallet.name}
                    walletBalance={editingWallet.current_balance}
                    walletImageUri={editingWallet.image_uri}
                />
            )}

            {/* Quick Add Transaction Modal */}
            <QuickTransactionModal
                visible={quickModalVisible}
                wallets={wallets}
                onClose={() => setQuickModalVisible(false)}
                onSave={handleQuickSaveTransaction}
            />
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: Spacing.md,
        paddingBottom: 120,
        flexGrow: 1,
    },
    headerSection: {
        paddingTop: Spacing.md,
        paddingBottom: Spacing.xxl,
        marginBottom: Spacing.lg,
    },
    totalSection: {
        marginTop: Spacing.xl,
        marginHorizontal: Spacing.md,
        alignItems: 'center',
        paddingBottom: Spacing.xl,
    },
    heroHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    heroIconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm,
    },
    heroLabel: {
        fontSize: FontSizes.lg,
        color: '#FFFFFF',
        fontWeight: '800',
        letterSpacing: 2,
    },
    heroBalance: {
        fontSize: 46,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -1.5,
        marginBottom: Spacing.lg,
        textAlign: 'center',
        backgroundColor: 'transparent',
        textShadowColor: 'transparent',
        textShadowRadius: 0,
    },
    heroFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)', // Flat translucent Apple style
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 9999,
    },
    badgeText: {
        marginLeft: 6,
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    reorderNoticeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(50, 215, 75, 0.15)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(50, 215, 75, 0.35)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 9999,
    },
    reorderNoticeText: {
        marginLeft: 6,
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
    separator: {
        height: 14,
    },
    listFooter: {
        height: 260,
        width: '100%',
    },
    fabWrapper: {
        position: 'absolute',
        bottom: 140,
        right: 20,
        zIndex: 9999,
    },
});

export default HomeScreen;
