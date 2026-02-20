/**
 * WalletModal.tsx — Modal tạo / sửa ví
 * Dùng RN core Modal, animated overlay (fade), Icon Picker Grid
 * Thay thế image picker bằng icon picker cho giao diện thống nhất
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles, Pencil, X, Check } from 'lucide-react-native';
import GlassCard from './GlassCard';
import { WALLET_ICONS, DEFAULT_WALLET_ICON } from '../constants/walletIcons';

// ─── Props ────────────────────────────────────────────────────────────────────

interface WalletModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (
        name: string,
        initialBalance: number,
        imageUri?: string | null,
        icon?: string | null,
    ) => void;
    onDelete?: () => void;
    editData?: {
        name: string;
        initialBalance: number;
        imageUri: string | null;
        icon: string | null;
    } | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

const WalletModal: React.FC<WalletModalProps> = ({
    visible,
    onClose,
    onSave,
    editData,
}) => {
    const insets = useSafeAreaInsets();
    const isEdit = editData != null;

    // ─── Animation ──────────────────────────────────────────────────────────
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const sheetTranslateY = useRef(new Animated.Value(600)).current;

    useEffect(() => {
        if (visible) {
            overlayOpacity.setValue(0);
            sheetTranslateY.setValue(600);
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
    }, [visible, overlayOpacity, sheetTranslateY]);

    const handleClose = useCallback(() => {
        Animated.parallel([
            Animated.timing(overlayOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(sheetTranslateY, {
                toValue: 600,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => onClose());
    }, [overlayOpacity, sheetTranslateY, onClose]);

    // ─── Form State ─────────────────────────────────────────────────────────
    const [name, setName] = useState('');
    const [balanceText, setBalanceText] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(DEFAULT_WALLET_ICON);

    useEffect(() => {
        if (visible) {
            if (editData) {
                setName(editData.name);
                setBalanceText(editData.initialBalance.toString());
                setSelectedIcon(editData.icon || DEFAULT_WALLET_ICON);
            } else {
                setName('');
                setBalanceText('');
                setSelectedIcon(DEFAULT_WALLET_ICON);
            }
        }
    }, [visible, editData]);

    // ─── Save ───────────────────────────────────────────────────────────────

    const handleSave = useCallback(() => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên ví.');
            return;
        }

        const balance = parseInt(balanceText.replace(/\D/g, ''), 10) || 0;
        onSave(trimmedName, balance, null, selectedIcon);
        handleClose();
    }, [name, balanceText, selectedIcon, onSave, handleClose]);

    // ─── Format balance input ──────────────────────────────────────────────

    const handleBalanceChange = useCallback((text: string) => {
        const numbersOnly = text.replace(/\D/g, '');
        setBalanceText(numbersOnly);
    }, []);

    const displayBalance = balanceText
        ? parseInt(balanceText, 10)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        : '';

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <Modal
            visible={visible}
            animationType="none"
            transparent
            statusBarTranslucent
            onRequestClose={handleClose}>
            <View style={styles.root}>
                {/* Animated overlay — fade in/out */}
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        styles.overlay,
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

                {/* Sheet — slides up */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardView}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                    pointerEvents="box-none">
                    <Animated.View
                        style={[
                            styles.modalContainer,
                            { paddingBottom: insets.bottom + 16 },
                            { transform: [{ translateY: sheetTranslateY }] },
                        ]}>
                        <View>
                            <GlassCard
                                style={styles.modalCard}
                                backgroundOpacity={0.95}
                                borderOpacity={0.2}
                                borderRadius={28}>
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled">
                                    {/* Header */}
                                    <View style={styles.header}>
                                        <View style={styles.headerLeft}>
                                            {isEdit ? (
                                                <Pencil size={20} color="#22d3ee" strokeWidth={2} />
                                            ) : (
                                                <Sparkles size={20} color="#22d3ee" strokeWidth={2} />
                                            )}
                                            <Text style={styles.headerTitle}>
                                                {isEdit ? 'Sửa ví' : 'Tạo ví mới'}
                                            </Text>
                                        </View>
                                        <Pressable onPress={handleClose} style={styles.closeBtn}>
                                            <X size={18} color="rgba(255,255,255,0.5)" strokeWidth={2} />
                                        </Pressable>
                                    </View>

                                    {/* ── Icon Picker ──────────────────────────── */}
                                    <Text style={styles.label}>Chọn biểu tượng</Text>
                                    <View style={styles.iconGrid}>
                                        {WALLET_ICONS.map(item => {
                                            const isSelected = selectedIcon === item.key;
                                            const IconComp = item.icon;
                                            return (
                                                <Pressable
                                                    key={item.key}
                                                    style={[
                                                        styles.iconCell,
                                                        isSelected && styles.iconCellSelected,
                                                    ]}
                                                    onPress={() => setSelectedIcon(item.key)}>
                                                    <IconComp
                                                        size={26}
                                                        color={isSelected ? '#22d3ee' : 'rgba(255,255,255,0.5)'}
                                                        strokeWidth={isSelected ? 2 : 1.5}
                                                    />
                                                    {isSelected && (
                                                        <View style={styles.iconCheck}>
                                                            <Check size={10} color="#000" strokeWidth={3} />
                                                        </View>
                                                    )}
                                                </Pressable>
                                            );
                                        })}
                                    </View>

                                    {/* Input tên ví */}
                                    <Text style={styles.label}>Tên ví</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="VD: Tiền mặt, Ngân hàng..."
                                        placeholderTextColor="rgba(255, 255, 255, 0.25)"
                                        value={name}
                                        onChangeText={setName}
                                        maxLength={50}
                                        returnKeyType="next"
                                        selectionColor="#22d3ee"
                                    />

                                    {/* Input số dư ban đầu */}
                                    <Text style={styles.label}>Số dư ban đầu (₫)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        placeholderTextColor="rgba(255, 255, 255, 0.25)"
                                        value={displayBalance}
                                        onChangeText={handleBalanceChange}
                                        keyboardType="numeric"
                                        returnKeyType="done"
                                        selectionColor="#22d3ee"
                                    />

                                    {/* Nút hành động */}
                                    <View style={styles.actions}>
                                        <Pressable
                                            onPress={handleSave}
                                            style={styles.saveBtn}>
                                            <Text style={styles.saveBtnText}>
                                                {isEdit ? 'Cập nhật' : 'Tạo ví'}
                                            </Text>
                                        </Pressable>

                                        <Pressable
                                            onPress={handleClose}
                                            style={styles.cancelBtn}>
                                            <Text style={styles.cancelBtnText}>Hủy</Text>
                                        </Pressable>
                                    </View>
                                </ScrollView>
                            </GlassCard>
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
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
    modalContainer: {
        paddingHorizontal: 12,
    },
    modalCard: {
        backgroundColor: 'rgba(18, 18, 22, 0.97)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingBottom: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Icon Picker ──
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 8,
    },
    iconCell: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCellSelected: {
        backgroundColor: 'rgba(34, 211, 238, 0.12)',
        borderColor: 'rgba(34, 211, 238, 0.5)',
    },
    iconCheck: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#22d3ee',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Form ──
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    input: {
        marginHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    actions: {
        padding: 20,
        gap: 12,
    },
    saveBtn: {
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: 'rgba(34, 211, 238, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.4)',
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

export default WalletModal;
