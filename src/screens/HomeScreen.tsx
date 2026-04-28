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
import { Wallet as WalletIcon, PieChart, Plus } from 'lucide-react-native';
import BackgroundLiquidGlass from '../components/BackgroundLiquidGlass';
import AppleGlassBackground from '../components/ui/AppleGlassBackground';
import WalletModal from '../components/WalletModal';
import EditWalletModal from '../components/EditWalletModal';
import WalletCard2 from '../components/WalletCard2';
import IconButton from '../components/IconButton';
import EmptyState2 from '../components/EmptyState2';
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
    const { wallets, addWallet, editWallet, adjustWalletBalance, removeWallet, isReady, refreshWallets } = useStore();

    // ─── Modal State ──────────────────────────────────────────────────────────
    const [modalVisible, setModalVisible] = useState(false);
    const [editWalletVisible, setEditWalletVisible] = useState(false);
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
        (name: string, currentBalance: number) => {
            if (editingWallet) {
                adjustWalletBalance(
                    editingWallet.id,
                    name,
                    currentBalance,
                    editingWallet.current_balance,
                    editingWallet.initial_balance,
                    editingWallet.icon
                );
            }
        },
        [editingWallet, adjustWalletBalance],
    );

    const handleDelete = useCallback(() => {
        if (editingWallet) {
            removeWallet(editingWallet.id);
        }
    }, [editingWallet, removeWallet]);

    // ─── Render Item ──────────────────────────────────────────────────────────

    const renderWalletItem = useCallback(
        ({ item }: { item: Wallet }) => (
            <WalletCard2
                name={item.name}
                balance={item.current_balance}
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
            <EmptyState2
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
                    <View collapsable={false} style={styles.totalSection}>
                        <View collapsable={false} style={styles.heroHeader}>
                            <View style={styles.heroIconWrapper}>
                                <PieChart size={22} color="#FFFFFF" strokeWidth={2.5} />
                            </View>
                            <Text style={styles.heroLabel}>TỔNG TÀI SẢN</Text>
                        </View>
                        
                        <View collapsable={false}>
                            <Text style={styles.heroBalance} numberOfLines={1} adjustsFontSizeToFit>{formatVND(totalBalance)}</Text>
                        </View>
                        
                        <View style={styles.heroFooter}>
                            <AppleGlassBackground
                                variant="chromeMaterial"
                                borderRadius={9999}
                                style={styles.badge}
                                contentContainerStyle={styles.badgeContent}
                            >
                                <WalletIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
                                <Text style={styles.badgeText}>{wallets.length} ví hoạt động</Text>
                            </AppleGlassBackground>
                        </View>
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

            {/* Add Wallet Button */}
            <IconButton 
                icon={<Plus strokeWidth={1.5} color="#FFF" size={32} />}
                size={60}
                onPress={openCreateModal} 
                style={{ 
                    position: 'absolute', 
                    bottom: 140, 
                    right: 20, 
                    zIndex: 9999,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 1,
                    shadowRadius: 10,
                    elevation: 10,
                }} 
            />

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
                />
            )}
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
        borderRadius: 9999,
    },
    badgeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    badgeText: {
        marginLeft: 8,
        color: '#FFFFFF',
        fontSize: FontSizes.md,
        fontWeight: '700',
    },
    separator: {
        height: 14,
    },
});

export default HomeScreen;
