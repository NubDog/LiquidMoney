/**
 * WalletModal.tsx
 * Modal for creating a new wallet, Refactored to Volumetric Glass
 */

import React, { useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
} from 'react-native';
import { Keyboard, StyleSheet, Text, TextInput, View, Pressable, Animated } from 'react-native';
import { X, Pencil, Image as ImageIcon, Wallet } from 'lucide-react-native';
import { animateSheetIn, animateSheetOut } from '../common/animations';
import AnimatedOverlay from './AnimatedOverlay';
import LiquidCard from './LiquidCard';
import { Colors, FontSizes, Shadows, Spacing, Radii } from '../common/theme';

interface WalletModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (name: string, initialBalance: number, imageUri?: string | null, icon?: string | null) => void;
    editData?: any | null;
    onDelete?: () => void;
}
const WalletModal: React.FC<WalletModalProps> = ({
    visible,
    onClose,
    onSave,
}) => {
    const [name, setName] = useState('');
    const [balanceStr, setBalanceStr] = useState('');

    const translateY = useRef(new Animated.Value(500)).current;

    React.useEffect(() => {
        if (visible) {
            animateSheetIn(translateY).start();
            // Reset state
            setName('');
            setBalanceStr('');
        }
    }, [visible, translateY]);

    const handleClose = () => {
        Keyboard.dismiss();
        animateSheetOut(translateY, 600, 250).start(({ finished }) => {
            if (finished) onClose();
        });
    };

    const handleSave = () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        const balance = parseInt(balanceStr.replace(/[^0-9]/g, ''), 10);
        if (isNaN(balance)) return;
        
        onSave(trimmedName, balance);
        handleClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}>
            <View style={styles.container}>
                <AnimatedOverlay visible={visible} onPress={handleClose} />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                    pointerEvents="box-none">
                    <Animated.View style={[styles.sheetContainer, { transform: [{ translateY }] }]}>
                        <LiquidCard
                            style={styles.sheet}
                            intensity="heavy"
                            
                            borderRadius={Radii.xxl}
                        >
                            <View style={styles.handleBar} />
                            <View style={styles.header}>
                                <Text style={styles.title}>Thêm Ví Mới</Text>
                                <Pressable onPress={handleClose} style={styles.closeBtn}>
                                    <X size={24} color="#FFFFFF" strokeWidth={2.5} />
                                </Pressable>
                            </View>

                            <View style={styles.content}>
                                <Text style={styles.label}>Tên ví</Text>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="VD: Tiền mặt, Thẻ tín dụng..."
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    selectionColor={Colors.accent}
                                />

                                <Text style={styles.label}>Số dư ban đầu (₫)</Text>
                                <TextInput
                                    style={[styles.input, styles.amountInput]}
                                    value={balanceStr}
                                    onChangeText={setBalanceStr}
                                    placeholder="0"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    keyboardType="numeric"
                                    selectionColor={Colors.accent}
                                />

                                <Pressable
                                    onPress={handleSave}
                                    style={({ pressed }) => [
                                        styles.saveBtn,
                                        pressed && { opacity: 0.8 },
                                    ]}>
                                    <Text style={styles.saveBtnText}>Tạo Ví</Text>
                                </Pressable>
                            </View>
                        </LiquidCard>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'flex-end' },
    keyboardView: { flex: 1, justifyContent: 'flex-end' },
    sheetContainer: {
        borderTopLeftRadius: Radii.xxl,
        borderTopRightRadius: Radii.xxl,
        ...Shadows.menu,
    },
    sheet: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottomWidth: 0,
        paddingBottom: 40,
    },
    handleBar: {
        width: 44,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: 'rgba(255,255,255,0.4)',
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: Spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSizes.xl + 2,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    closeBtn: {
        padding: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: Radii.pill,
    },
    content: {
        paddingHorizontal: Spacing.xl,
    },
    label: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: Spacing.sm,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: Radii.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        padding: Spacing.md,
        fontSize: FontSizes.lg,
        color: '#FFFFFF',
        marginBottom: Spacing.lg,
    },
    amountInput: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        paddingVertical: Spacing.lg,
    },
    saveBtn: {
        backgroundColor: 'rgba(34, 211, 238, 0.3)', // Cyan accent
        borderRadius: Radii.lg,
        paddingVertical: Spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.6)',
        marginTop: Spacing.lg,
    },
    saveBtnText: {
        fontSize: FontSizes.lg,
        fontWeight: '800',
        color: '#FFFFFF',
    },
});

export default WalletModal;
