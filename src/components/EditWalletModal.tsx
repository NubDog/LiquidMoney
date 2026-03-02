/**
 * EditWalletModal.tsx — Modal for editing wallet name and balance
 * Extracted from WalletDetailScreen.tsx (lines 122-280).
 * Uses shared animation helpers from common/animations.ts.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
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
import { animateModalOpen, animateModalClose, SpringConfigs } from '../common/animations';
import { Colors, FontSizes, Radii, Spacing } from '../common/theme';

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditWalletModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (name: string, currentBalance: number) => void;
    walletName: string;
    walletBalance: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

const EditWalletModal: React.FC<EditWalletModalProps> = ({
    visible,
    onClose,
    onSave,
    walletName,
    walletBalance,
}) => {
    const [name, setName] = useState(walletName);
    const [balanceStr, setBalanceStr] = useState(walletBalance.toString());

    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const sheetTranslateY = useRef(new Animated.Value(400)).current;

    useEffect(() => {
        if (visible) {
            setName(walletName);
            setBalanceStr(walletBalance.toString());
            animateModalOpen(overlayOpacity, sheetTranslateY, SpringConfigs.gentle);
        }
    }, [visible, walletName, walletBalance, overlayOpacity, sheetTranslateY]);

    const handleClose = useCallback(() => {
        animateModalClose(overlayOpacity, sheetTranslateY, onClose);
    }, [overlayOpacity, sheetTranslateY, onClose]);

    const handleSave = useCallback(() => {
        const trimmedName = name.trim();
        if (!trimmedName) { return; }
        const balance = parseInt(balanceStr.replace(/[^0-9-]/g, ''), 10);
        if (isNaN(balance)) { return; }
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
            <View style={styles.root}>
                {/* Animated overlay */}
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

                {/* Sheet */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                    pointerEvents="box-none">
                    <Animated.View
                        style={[
                            styles.sheet,
                            { transform: [{ translateY: sheetTranslateY }] },
                        ]}>
                        <Pressable onPress={Keyboard.dismiss}>
                            {/* Handle bar */}
                            <View style={styles.handleBar} />

                            <Text style={styles.title}>Chỉnh sửa ví</Text>

                            {/* Name input */}
                            <Text style={styles.label}>Tên ví</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Nhập tên ví"
                                placeholderTextColor={Colors.textMuted}
                                selectionColor={Colors.accent}
                            />

                            {/* Balance input */}
                            <Text style={styles.label}>Số dư hiện tại (₫)</Text>
                            <TextInput
                                style={styles.input}
                                value={balanceStr}
                                onChangeText={setBalanceStr}
                                placeholder="0"
                                placeholderTextColor={Colors.textMuted}
                                keyboardType="numeric"
                                selectionColor={Colors.accent}
                            />

                            {/* Actions */}
                            <View style={styles.actions}>
                                <Pressable
                                    onPress={handleSave}
                                    style={styles.saveBtn}>
                                    <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
                                </Pressable>
                                <Pressable
                                    onPress={handleClose}
                                    style={styles.cancelBtn}>
                                    <Text style={styles.cancelBtnText}>Hủy</Text>
                                </Pressable>
                            </View>
                        </Pressable>
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
        backgroundColor: Colors.overlay,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: Colors.sheetBg,
        borderTopLeftRadius: Radii.xxl,
        borderTopRightRadius: Radii.xxl,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
        borderBottomWidth: 0,
        paddingHorizontal: Spacing.xl,
        paddingBottom: 40,
    },
    handleBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.handleBar,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.xl,
    },
    label: {
        fontSize: FontSizes.md - 1,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },
    input: {
        backgroundColor: Colors.inputBg,
        borderRadius: Radii.md,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
        padding: Spacing.md,
        fontSize: 17,
        color: Colors.text,
        marginBottom: Spacing.lg,
    },
    actions: {
        gap: 12,
        marginTop: Spacing.sm,
    },
    saveBtn: {
        paddingVertical: Spacing.md,
        borderRadius: Radii.md,
        backgroundColor: 'rgba(168, 85, 247, 0.35)',
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.5)',
        alignItems: 'center',
    },
    saveBtnText: {
        color: Colors.text,
        fontSize: FontSizes.lg - 2,
        fontWeight: '700',
    },
    cancelBtn: {
        paddingVertical: Spacing.md,
        borderRadius: Radii.md,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderWidth: 1,
        borderColor: Colors.inputBorder,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: FontSizes.lg - 2,
        fontWeight: '500',
    },
});

export default EditWalletModal;
