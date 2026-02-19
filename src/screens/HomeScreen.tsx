/**
 * HomeScreen.tsx — Màn hình chính hiển thị danh sách ví
 * FlatList + FAB + Empty State + WalletModal
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';
import WalletCard from '../components/WalletCard';
import WalletModal from '../components/WalletModal';
import LiquidFAB from '../components/LiquidFAB';
import type { Wallet } from '../database/queries';

// ─── Props ────────────────────────────────────────────────────────────────────

interface HomeScreenProps {
    onNavigateToWallet?: (walletId: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(amount: number): string {
    const formatted = Math.abs(amount)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${amount < 0 ? '-' : ''}${formatted} ₫`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToWallet }) => {
    const insets = useSafeAreaInsets();
    const { wallets, addWallet, editWallet, removeWallet, isReady } = useStore();

    // ─── Modal State ──────────────────────────────────────────────────────────
    const [modalVisible, setModalVisible] = useState(false);
    const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

    // ─── Tổng số dư ──────────────────────────────────────────────────────────
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
        (name: string, initialBalance: number, imageUri?: string | null) => {
            if (editingWallet) {
                editWallet(editingWallet.id, name, initialBalance, imageUri);
            } else {
                addWallet(name, initialBalance, imageUri);
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
            <View style={styles.cardWrapper}>
                <WalletCard
                    name={item.name}
                    currentBalance={item.current_balance}
                    initialBalance={item.initial_balance}
                    imageUri={item.image_uri}
                    createdAt={item.created_at}
                    onPress={() => onNavigateToWallet?.(item.id)}
                    onLongPress={() => openEditModal(item)}
                />
            </View>
        ),
        [onNavigateToWallet, openEditModal],
    );

    const keyExtractor = useCallback((item: Wallet) => item.id, []);

    // ─── Empty State ──────────────────────────────────────────────────────────

    const EmptyState = useMemo(
        () => (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>💰</Text>
                <Text style={styles.emptyTitle}>Chưa có ví nào</Text>
                <Text style={styles.emptySubtitle}>
                    Nhấn nút + bên dưới để tạo ví đầu tiên
                </Text>
            </View>
        ),
        [],
    );

    // ─── Header ───────────────────────────────────────────────────────────────

    const ListHeader = useMemo(
        () => (
            <View style={styles.headerSection}>
                {/* Tổng số dư */}
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
                ListEmptyComponent={EmptyState}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            {/* FAB — Nút tạo ví mới */}
            {/* FAB — Nút tạo ví mới */}
            <LiquidFAB onPress={openCreateModal} />

            {/* Modal tạo/sửa ví */}
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
        paddingHorizontal: 20,
        paddingBottom: 100, // Dành chỗ cho FAB
        flexGrow: 1,
    },
    headerSection: {
        paddingTop: 16,
        paddingBottom: 8,
    },
    totalSection: {
        marginTop: 20,
        paddingVertical: 20,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    totalLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.45)',
        fontWeight: '500',
    },
    totalBalance: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: 4,
        letterSpacing: -1,
    },
    walletCount: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.35)',
        marginTop: 6,
        fontWeight: '500',
    },
    cardWrapper: {
        // marginBottom handled by separator
    },
    separator: {
        height: 14,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyEmoji: {
        fontSize: 56,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.4)',
        textAlign: 'center',
        lineHeight: 22,
    },
    fab: {
        position: 'absolute',
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(74, 0, 224, 0.75)',
        borderWidth: 1,
        borderColor: 'rgba(123, 47, 255, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        // Shadow
        shadowColor: '#4A00E0',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 12,
        elevation: 8,
    },
    fabText: {
        fontSize: 32,
        fontWeight: '300',
        color: '#FFFFFF',
        marginTop: -2,
    },
});

export default HomeScreen;
