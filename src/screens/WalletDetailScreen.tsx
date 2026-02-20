/**
 * WalletDetailScreen.tsx — Màn hình chi tiết ví + danh sách giao dịch
 * Dùng RN core FlatList, SegmentedControl, TransactionModal
 * Hỗ trợ: 3-dot menu (Sửa ví / Xóa ví) + animated popup + custom confirm
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import TransactionFilterBar from '../components/TransactionFilterBar';
import TransactionModal from '../components/TransactionModal';
import TransactionDetailScreen from './TransactionDetailScreen';
import ConfirmDialog from '../components/ConfirmDialog';
import LiquidFAB from '../components/LiquidFAB';
import MeshBackground from '../components/MeshBackground';
import { useStore } from '../store/useStore';
import type { Transaction } from '../database/queries';
import {
    ArrowDownLeft,
    ArrowUpRight,
    ChevronLeft,
    ClipboardList,
    MoreVertical,
    Pencil,
    Trash2,
} from 'lucide-react-native';
import LottieView from 'lottie-react-native';

// ─── Props ────────────────────────────────────────────────────────────────────

interface WalletDetailScreenProps {
    walletId: string;
    onGoBack: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FILTER_SEGMENTS = ['Tất cả', 'Thu', 'Chi'];

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
                    <View style={[styles.txIcon, { backgroundColor: iconBg }]}>
                        {isIn ? (
                            <ArrowDownLeft size={24} color="#4ade80" strokeWidth={2} />
                        ) : (
                            <ArrowUpRight size={24} color="#f87171" strokeWidth={2} />
                        )}
                    </View>

                    <View style={styles.txInfo}>
                        <Text style={styles.txReason} numberOfLines={1}>
                            {item.reason || (isIn ? 'Thu nhập' : 'Chi tiêu')}
                        </Text>
                        <Text style={styles.txDate}>
                            {formatDate(item.created_at)}
                        </Text>
                    </View>

                    <Text style={[styles.txAmount, { color: amountColor }]}>
                        {isIn ? '+' : '-'}
                        {formatVND(item.amount)}
                    </Text>
                </View>
            </GlassCard>
        </Pressable>
    );
});

// ─── Edit Wallet Modal ────────────────────────────────────────────────────────

interface EditWalletModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (name: string, currentBalance: number) => void;
    walletName: string;
    walletBalance: number;
}

const EditWalletModal: React.FC<EditWalletModalProps> = ({
    visible,
    onClose,
    onSave,
    walletName,
    walletBalance,
}) => {
    const [name, setName] = useState(walletName);
    const [balanceStr, setBalanceStr] = useState(walletBalance.toString());

    // Animation
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const sheetTranslateY = useRef(new Animated.Value(400)).current;

    useEffect(() => {
        if (visible) {
            setName(walletName);
            setBalanceStr(walletBalance.toString());
            overlayOpacity.setValue(0);
            sheetTranslateY.setValue(400);
            Animated.parallel([
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(sheetTranslateY, {
                    toValue: 0,
                    friction: 10,
                    tension: 65,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, walletName, walletBalance, overlayOpacity, sheetTranslateY]);

    const handleClose = useCallback(() => {
        Animated.parallel([
            Animated.timing(overlayOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(sheetTranslateY, {
                toValue: 400,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => onClose());
    }, [overlayOpacity, sheetTranslateY, onClose]);

    const handleSave = useCallback(() => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            return;
        }
        const balance = parseInt(balanceStr.replace(/[^0-9-]/g, ''), 10);
        if (isNaN(balance)) {
            return;
        }
        onSave(trimmedName, balance);
        handleClose();
    }, [name, balanceStr, onSave, handleClose]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}>
            <View style={editStyles.root}>
                {/* Animated overlay */}
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        editStyles.overlay,
                        { opacity: overlayOpacity },
                    ]}
                />
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => {
                        Keyboard.dismiss();
                        handleClose();
                    }}
                />

                {/* Sheet */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={editStyles.keyboardView}
                    pointerEvents="box-none">
                    <Animated.View
                        style={[
                            editStyles.sheet,
                            { transform: [{ translateY: sheetTranslateY }] },
                        ]}>
                        <Pressable onPress={Keyboard.dismiss}>
                            {/* Handle bar */}
                            <View style={editStyles.handleBar} />

                            <Text style={editStyles.title}>Chỉnh sửa ví</Text>

                            {/* Name input */}
                            <Text style={editStyles.label}>Tên ví</Text>
                            <TextInput
                                style={editStyles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Nhập tên ví"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                selectionColor="#a855f7"
                            />

                            {/* Balance input */}
                            <Text style={editStyles.label}>Số dư hiện tại (₫)</Text>
                            <TextInput
                                style={editStyles.input}
                                value={balanceStr}
                                onChangeText={setBalanceStr}
                                placeholder="0"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                keyboardType="numeric"
                                selectionColor="#a855f7"
                            />

                            {/* Actions */}
                            <View style={editStyles.actions}>
                                <Pressable
                                    onPress={handleSave}
                                    style={editStyles.saveBtn}>
                                    <Text style={editStyles.saveBtnText}>Lưu thay đổi</Text>
                                </Pressable>
                                <Pressable
                                    onPress={handleClose}
                                    style={editStyles.cancelBtn}>
                                    <Text style={editStyles.cancelBtnText}>Hủy</Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

// ─── Popup Menu ───────────────────────────────────────────────────────────────

interface PopupMenuProps {
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    anchorY: number;
    anchorX: number;
}

const PopupMenu: React.FC<PopupMenuProps> = ({
    visible,
    onClose,
    onEdit,
    onDelete,
    anchorY,
    anchorX,
}) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.85)).current;
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            opacity.setValue(0);
            scale.setValue(0.85);
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        } else if (shouldRender) {
            // Animate close
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 120,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 0.85,
                    duration: 120,
                    useNativeDriver: true,
                }),
            ]).start(() => setShouldRender(false));
        }
    }, [visible, opacity, scale, shouldRender]);

    if (!shouldRender) { return null; }

    return (
        <Pressable style={menuStyles.backdrop} onPress={onClose}>
            <Animated.View
                style={[
                    menuStyles.container,
                    {
                        top: anchorY + 8,
                        right: anchorX,
                        opacity,
                        transform: [{ scale }],
                    },
                ]}>
                {/* Edit */}
                <Pressable
                    style={menuStyles.item}
                    onPress={() => {
                        onClose();
                        setTimeout(onEdit, 150);
                    }}>
                    <Pencil size={18} color="#FFFFFF" strokeWidth={1.5} />
                    <Text style={menuStyles.itemText}>Chỉnh sửa</Text>
                </Pressable>


                {/* Delete */}
                <Pressable
                    style={menuStyles.item}
                    onPress={() => {
                        onClose();
                        setTimeout(onDelete, 150);
                    }}>
                    <Trash2 size={18} color="#f87171" strokeWidth={1.5} />
                    <Text style={[menuStyles.itemText, { color: '#f87171' }]}>
                        Xóa ví
                    </Text>
                </Pressable>
            </Animated.View>
        </Pressable>
    );
};

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
        editWalletDirect,
        removeWallet,
    } = useStore();

    // ─── State ──────────────────────────────────────────────────────────────

    const [filterIndex, setFilterIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [viewingTx, setViewingTx] = useState<Transaction | null>(null);

    // Menu & Edit & Delete state
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuAnchorY, setMenuAnchorY] = useState(0);
    const [menuAnchorX, setMenuAnchorX] = useState(16);
    const [editWalletVisible, setEditWalletVisible] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const menuBtnRef = useRef<View>(null);

    // Transaction detail slide animation
    const detailSlideAnim = useRef(new Animated.Value(0)).current;
    const [detailRendered, setDetailRendered] = useState(false);
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        if (viewingTx) {
            setDetailRendered(true);
            detailSlideAnim.setValue(0);
            Animated.spring(detailSlideAnim, {
                toValue: 1,
                useNativeDriver: true,
                friction: 12,
                tension: 65,
            }).start();
        } else if (detailRendered) {
            Animated.timing(detailSlideAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start(() => setDetailRendered(false));
        }
    }, [viewingTx, detailSlideAnim, detailRendered]);

    const detailTranslateX = detailSlideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [screenWidth, 0],
    });

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
            if (editingTx) {
                editTransaction(
                    editingTx.id,
                    walletId,
                    type,
                    amount,
                    reason,
                    imageUri,
                );
            } else {
                addTransaction(walletId, type, amount, reason, imageUri);
            }
        },
        [editingTx, walletId, addTransaction, editTransaction],
    );

    const handleEditFromDetail = useCallback(
        (id: string, wId: string, type: 'IN' | 'OUT', amount: number, reason?: string | null, imageUri?: string | null) => {
            editTransaction(id, wId, type, amount, reason, imageUri);
        },
        [editTransaction],
    );

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
            menuBtnRef.current.measureInWindow((_x, y, _width, height) => {
                setMenuAnchorY(y + height);
                setMenuAnchorX(16);
                setMenuVisible(true);
            });
        } else {
            setMenuVisible(true);
        }
    }, []);

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
            <TransactionItem item={item} onPress={handleViewTransaction} />
        ),
        [handleViewTransaction],
    );

    const listHeader = useMemo(
        () => (
            <View>
                <GlassCard
                    style={styles.summaryCard}
                    backgroundOpacity={0.15}
                    borderOpacity={0.2}
                    borderRadius={24}>


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

                <View style={styles.filterWrapper}>
                    <TransactionFilterBar
                        segments={FILTER_SEGMENTS}
                        selectedIndex={filterIndex}
                        onChange={setFilterIndex}
                    />
                </View>

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
                <LottieView
                    source={require('../assets/Lottie Animation/No Result Green theme.json')}
                    autoPlay
                    loop
                    style={{ width: 160, height: 160, marginBottom: 8 }}
                />
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
                    <ChevronLeft size={24} color="#FFFFFF" />
                </Pressable>

                <View style={{ flex: 1 }} />

                {/* 3-dot menu button */}
                <View ref={menuBtnRef} collapsable={false}>
                    <Pressable onPress={handleOpenMenu} style={styles.menuBtn}>
                        <MoreVertical size={22} color="#FFFFFF" strokeWidth={1.5} />
                    </Pressable>
                </View>
            </View>

            {/* Popup Menu (with open + close animation) */}
            <PopupMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onEdit={handleEditWallet}
                onDelete={handleDeleteWallet}
                anchorY={menuAnchorY}
                anchorX={menuAnchorX}
            />

            {/* Transaction List */}
            <FlatList
                data={transactions}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ListHeaderComponent={listHeader}
                ListEmptyComponent={ListEmpty}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* FAB */}
            <LiquidFAB onPress={handleOpenCreate} style={{ bottom: 40 }} />

            {/* Transaction Modal (for creating new) */}
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

            {/* Transaction Detail Screen — slides in from right */}
            {detailRendered && viewingTx && (
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        { transform: [{ translateX: detailTranslateX }] },
                    ]}>
                    <MeshBackground />
                    <TransactionDetailScreen
                        transaction={viewingTx}
                        walletName={wallet?.name || 'Ví'}
                        onGoBack={handleGoBackFromDetail}
                        onEdit={handleEditFromDetail}
                        onDelete={handleDeleteFromDetail}
                    />
                </Animated.View>
            )}

            {/* Edit Wallet Modal */}
            <EditWalletModal
                visible={editWalletVisible}
                onClose={() => setEditWalletVisible(false)}
                onSave={handleSaveWallet}
                walletName={wallet?.name || ''}
                walletBalance={wallet?.current_balance || 0}
            />

            {/* Custom Delete Confirm Dialog */}
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
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    menuBtn: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
});

// ─── Popup Menu Styles ────────────────────────────────────────────────────────

const menuStyles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 100,
    },
    container: {
        position: 'absolute',
        minWidth: 180,
        backgroundColor: 'rgba(30, 30, 30, 0.95)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        paddingVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
        zIndex: 101,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    itemText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginHorizontal: 12,
    },
});

// ─── Edit Wallet Modal Styles ─────────────────────────────────────────────────

const editStyles = StyleSheet.create({
    root: {
        flex: 1,
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: 'rgba(28, 28, 30, 0.98)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderBottomWidth: 0,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    handleBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        padding: 16,
        fontSize: 17,
        color: '#FFFFFF',
        marginBottom: 20,
    },
    actions: {
        gap: 12,
        marginTop: 8,
    },
    saveBtn: {
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: 'rgba(168, 85, 247, 0.35)',
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.5)',
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    cancelBtn: {
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
    },
    cancelBtnText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default WalletDetailScreen;
