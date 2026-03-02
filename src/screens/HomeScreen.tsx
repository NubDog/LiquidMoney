/**
 * HomeScreen.tsx — Main screen showing wallet list
 * FlatList + FAB + Empty State + WalletModal
 *
 * Refactored: Uses shared formatters, theme tokens, EmptyState component.
 * Fixed: Inline ItemSeparatorComponent lambda → named component.
 * Cleaned: Removed empty cardWrapper style, duplicate FAB comment.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';
import WalletCard from '../components/WalletCard';
import WalletModal from '../components/WalletModal';
import LiquidFAB from '../components/LiquidFAB';
import EmptyState from '../components/EmptyState';
import { formatVND } from '../common/formatters';
import { Colors, FontSizes, Spacing, Radii } from '../common/theme';
import type { Wallet } from '../common/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface HomeScreenProps {
    onNavigateToWallet?: (walletId: string) => void;
}

// ─── Separator (named to avoid re-creation on every render) ───────────────────

const ItemSeparator = () => <View style={styles.separator} />;

// ─── Component ────────────────────────────────────────────────────────────────

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToWallet }) => {
    const insets = useSafeAreaInsets();
    const { wallets, addWallet, editWallet, removeWallet, isReady, refreshWallets } = useStore();

    // ─── Modal State ──────────────────────────────────────────────────────────
    const [modalVisible, setModalVisible] = useState(false);
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
        setModalVisible(true);
    }, []);

    const handleSave = useCallback(
        (name: string, initialBalance: number, imageUri?: string | null, icon?: string | null) => {
            if (editingWallet) {
                editWallet(editingWallet.id, name, initialBalance, imageUri, icon);
            } else {
                addWallet(name, initialBalance, imageUri, icon);
            }
        },
        [editingWallet, addWallet, editWallet],
    );

    const handleDelete = useCallback(() => {
        if (editingWallet) {
            removeWallet(editingWallet.id);
        }
    }, [editingWallet, removeWallet]);

    // ─── Render Item ──────────────────────────────────────────────────────────

    const renderWalletItem = useCallback(
        ({ item }: { item: Wallet }) => (
            <WalletCard
                name={item.name}
                currentBalance={item.current_balance}
                initialBalance={item.initial_balance}
                imageUri={item.image_uri}
                icon={item.icon}
                createdAt={item.created_at}
                onPress={() => onNavigateToWallet?.(item.id)}
                onLongPress={() => openEditModal(item)}
            />
        ),
        [onNavigateToWallet, openEditModal],
    );

    const keyExtractor = useCallback((item: Wallet) => item.id, []);

    // ─── Empty State ──────────────────────────────────────────────────────────

    const emptyState = useMemo(
        () => (
            <EmptyState
                animation="nodata"
                title="Chưa có ví nào"
                subtitle="Nhấn nút + bên dưới để tạo ví đầu tiên"
                animationSize={150}
            />
        ),
        [],
    );

    // ─── Header ───────────────────────────────────────────────────────────────

    const ListHeader = useMemo(
        () => (
            <View style={styles.headerSection}>
                {wallets.length > 0 && (
                    <View style={styles.totalSection}>
                        <Text style={styles.totalLabel}>Tổng số dư</Text>
                        <Text style={styles.totalBalance}>{formatVND(totalBalance)}</Text>
                        <Text style={styles.walletCount}>
                            {wallets.length} ví
                        </Text>
                    </View>
                )}
            </View>
        ),
        [wallets.length, totalBalance],
    );

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <FlatList
                data={wallets}
                renderItem={renderWalletItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={emptyState}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={ItemSeparator}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            refreshWallets();
                            setTimeout(() => setRefreshing(false), 300);
                        }}
                        tintColor="rgba(255,255,255,0.3)"
                        colors={['#22d3ee']}
                    />
                }
            />

            {/* FAB — Create new wallet */}
            <LiquidFAB onPress={openCreateModal} style={{ bottom: 140 }} />

            {/* Create/Edit wallet modal */}
            <WalletModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSave}
                onDelete={editingWallet ? handleDelete : undefined}
                editData={
                    editingWallet
                        ? {
                            name: editingWallet.name,
                            initialBalance: editingWallet.initial_balance,
                            imageUri: editingWallet.image_uri,
                            icon: editingWallet.icon,
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
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 120,
        flexGrow: 1,
    },
    headerSection: {
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    totalSection: {
        marginTop: Spacing.lg,
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.lg,
        backgroundColor: Colors.card,
        borderRadius: Radii.xl,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    totalLabel: {
        fontSize: FontSizes.md - 1,
        color: 'rgba(255, 255, 255, 0.45)',
        fontWeight: '500',
    },
    totalBalance: {
        fontSize: FontSizes.title,
        fontWeight: '800',
        color: Colors.text,
        marginTop: 4,
        letterSpacing: -1,
    },
    walletCount: {
        fontSize: FontSizes.sm,
        color: 'rgba(255, 255, 255, 0.35)',
        marginTop: 6,
        fontWeight: '500',
    },
    separator: {
        height: 14,
    },
});

export default HomeScreen;
