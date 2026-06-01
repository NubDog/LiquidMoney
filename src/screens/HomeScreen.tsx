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
import { useShallow } from 'zustand/react/shallow';
import { Wallet as WalletIcon, PieChart, Plus } from 'lucide-react-native';
import AppleEmptyState from '../components/ui/AppleEmptyState';
import WalletModal from '../components/modals/WalletModal';
import EditWalletModal from '../components/modals/EditWalletModal';
import AppleWalletCard from '../components/ui/AppleWalletCard';
import AppleIconButton from '../components/ui/AppleIconButton';
import { formatVND, formatVNDTruncated } from '../common/formatters';
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
    const { wallets, addWallet, editWallet, adjustWalletBalance, removeWallet, isReady, refreshWallets } = useStore(useShallow(state => ({
        wallets: state.wallets,
        addWallet: state.addWallet,
        editWallet: state.editWallet,
        adjustWalletBalance: state.adjustWalletBalance,
        removeWallet: state.removeWallet,
        isReady: state.isReady,
        refreshWallets: state.refreshWallets,
    })));

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

    const handleDelete = useCallback(() => {
        if (editingWallet) {
            removeWallet(editingWallet.id);
        }
    }, [editingWallet, removeWallet]);

    // ─── Render Item ──────────────────────────────────────────────────────────

    const renderWalletItem = useCallback(
        ({ item }: { item: Wallet }) => (
            <AppleWalletCard
                name={item.name}
                balance={item.current_balance}
                imageUri={item.image_uri}
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
            <AppleEmptyState
                animation="nodata"
                title="Chưa có ví nào"
                subtitle="Nhấn nút + bên dưới để tạo ví đầu tiên"
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
                            <Text style={styles.heroBalance} numberOfLines={1} adjustsFontSizeToFit>{formatVNDTruncated(totalBalance)}</Text>
                        </View>
                        
                        <View style={styles.heroFooter}>
                            <View style={styles.badge}>
                                <WalletIcon size={14} color="#FFFFFF" strokeWidth={2.5} />
                                <Text style={styles.badgeText}>{wallets.length} ví hoạt động</Text>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        ),
        [wallets.length, totalBalance],
    );

    // ─── Render ───────────────────────────────────────────────────────────────

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        refreshWallets();
        setTimeout(() => setRefreshing(false), 300);
    }, [refreshWallets]);

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
                initialNumToRender={6}
                maxToRenderPerBatch={5}
                windowSize={5}
                removeClippedSubviews={true}
                // @ts-ignore: delaysContentTouches is a valid ScrollView prop but missing in FlatList types
                delaysContentTouches={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="rgba(255,255,255,0.3)"
                        colors={['#22d3ee']}
                    />
                }
            />

            {/* Add Wallet Button */}
            <AppleIconButton 
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
                    walletImageUri={editingWallet.image_uri}
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
    separator: {
        height: 14,
    },
});

export default HomeScreen;
