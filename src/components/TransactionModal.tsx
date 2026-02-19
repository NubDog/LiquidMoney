/**
 * TransactionModal.tsx — Modal tạo / sửa giao dịch
 * Dùng RN core Modal + SegmentedControl cho toggle IN/OUT
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import SegmentedControl from './SegmentedControl';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransactionModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (
        type: 'IN' | 'OUT',
        amount: number,
        reason?: string | null,
    ) => void;
    onDelete?: () => void;
    editData?: {
        type: 'IN' | 'OUT';
        amount: number;
        reason: string | null;
    } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEGMENTS = ['💰 Thu', '💸 Chi'];

function typeToIndex(type: 'IN' | 'OUT'): number {
    return type === 'IN' ? 0 : 1;
}

function indexToType(index: number): 'IN' | 'OUT' {
    return index === 0 ? 'IN' : 'OUT';
}

// ─── Component ────────────────────────────────────────────────────────────────

const TransactionModal: React.FC<TransactionModalProps> = ({
    visible,
    onClose,
    onSave,
    onDelete,
    editData,
}) => {
    const insets = useSafeAreaInsets();
    const isEdit = editData != null;

    // ─── Form State ─────────────────────────────────────────────────────────
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [amountText, setAmountText] = useState('');
    const [reason, setReason] = useState('');

    // Reset form khi mở modal
    useEffect(() => {
        if (visible) {
            if (editData) {
                setSelectedIndex(typeToIndex(editData.type));
                setAmountText(editData.amount.toString());
                setReason(editData.reason || '');
            } else {
                setSelectedIndex(0);
                setAmountText('');
                setReason('');
            }
        }
    }, [visible, editData]);

    // ─── Handlers ───────────────────────────────────────────────────────────

    const handleAmountChange = useCallback((text: string) => {
        const numbersOnly = text.replace(/\D/g, '');
        setAmountText(numbersOnly);
    }, []);

    const displayAmount = amountText
        ? parseInt(amountText, 10)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        : '';

    const handleSave = useCallback(() => {
        const amount = parseInt(amountText.replace(/\D/g, ''), 10) || 0;
        if (amount <= 0) {
            Alert.alert('Lỗi', 'Vui lòng nhập số tiền lớn hơn 0.');
            return;
        }

        const type = indexToType(selectedIndex);
        onSave(type, amount, reason.trim() || null);
        onClose();
    }, [amountText, selectedIndex, reason, onSave, onClose]);

    const handleDelete = useCallback(() => {
        Alert.alert('Xóa giao dịch', 'Bạn có chắc muốn xóa giao dịch này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: () => {
                    onDelete?.();
                    onClose();
                },
            },
        ]);
    }, [onDelete, onClose]);

    // ─── Render ─────────────────────────────────────────────────────────────

    const currentType = indexToType(selectedIndex);
    const accentColor =
        currentType === 'IN' ? 'rgba(74, 222, 128, 0.5)' : 'rgba(248, 113, 113, 0.5)';
    const accentBorder =
        currentType === 'IN' ? 'rgba(74, 222, 128, 0.6)' : 'rgba(248, 113, 113, 0.6)';

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            statusBarTranslucent
            onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}>
                        <View
                            style={[
                                styles.modalContainer,
                                { paddingBottom: insets.bottom + 16 },
                            ]}>
                            <GlassCard
                                style={styles.modalCard}
                                backgroundOpacity={0.95}
                                borderOpacity={0.25}
                                borderRadius={28}>
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled">
                                    {/* Header */}
                                    <View style={styles.header}>
                                        <Text style={styles.headerTitle}>
                                            {isEdit
                                                ? '✏️ Sửa giao dịch'
                                                : '📝 Giao dịch mới'}
                                        </Text>
                                        <Pressable
                                            onPress={onClose}
                                            style={styles.closeBtn}>
                                            <Text style={styles.closeBtnText}>
                                                ✕
                                            </Text>
                                        </Pressable>
                                    </View>

                                    {/* Toggle IN / OUT */}
                                    <View style={styles.segmentWrapper}>
                                        <SegmentedControl
                                            segments={SEGMENTS}
                                            selectedIndex={selectedIndex}
                                            onChange={setSelectedIndex}
                                        />
                                    </View>

                                    {/* Số tiền */}
                                    <Text style={styles.label}>
                                        Số tiền (₫)
                                    </Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            styles.amountInput,
                                        ]}
                                        placeholder="0"
                                        placeholderTextColor="rgba(255, 255, 255, 0.25)"
                                        value={displayAmount}
                                        onChangeText={handleAmountChange}
                                        keyboardType="numeric"
                                        returnKeyType="next"
                                    />

                                    {/* Lý do */}
                                    <Text style={styles.label}>Lý do</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            styles.reasonInput,
                                        ]}
                                        placeholder="VD: Ăn trưa, Lương tháng..."
                                        placeholderTextColor="rgba(255, 255, 255, 0.25)"
                                        value={reason}
                                        onChangeText={setReason}
                                        maxLength={200}
                                        multiline
                                        numberOfLines={3}
                                        returnKeyType="done"
                                    />

                                    {/* Nút hành động */}
                                    <View style={styles.actions}>
                                        <GlassButton
                                            title={
                                                isEdit ? 'Cập nhật' : 'Thêm giao dịch'
                                            }
                                            onPress={handleSave}
                                            style={{
                                                backgroundColor: accentColor,
                                                borderColor: accentBorder,
                                            }}
                                        />

                                        {isEdit && onDelete && (
                                            <GlassButton
                                                title="Xóa giao dịch"
                                                onPress={handleDelete}
                                                variant="outline"
                                                style={styles.deleteBtn}
                                            />
                                        )}
                                    </View>
                                </ScrollView>
                            </GlassCard>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        paddingHorizontal: 12,
    },
    modalCard: {
        backgroundColor: 'rgba(15, 5, 35, 0.95)',
        maxHeight: '85%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingBottom: 8,
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
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 16,
        fontWeight: '600',
    },
    segmentWrapper: {
        paddingHorizontal: 20,
        marginTop: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.6)',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 8,
    },
    input: {
        marginHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    amountInput: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
    reasonInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    actions: {
        padding: 20,
        gap: 12,
    },
    deleteBtn: {
        borderColor: 'rgba(248, 113, 113, 0.4)',
    },
});

export default TransactionModal;
