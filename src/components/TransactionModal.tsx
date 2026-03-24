/**
 * TransactionModal.tsx — Keyboard avoiding Volumetric Glass Modal
 */

import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
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
import { Calendar as CalendarIcon, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { animateSheetIn, animateSheetOut } from '../common/animations';
import AnimatedOverlay from './AnimatedOverlay';
import LiquidCard from './LiquidCard';
import SegmentedControl from './SegmentedControl';
import { Colors, FontSizes, Shadows, Spacing, Radii } from '../common/theme';

interface TransactionModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (type: 'IN' | 'OUT', amount: number, reason?: string | null, imageUri?: string | null) => void | Promise<void>;
    editData?: any | null;
    onDelete?: () => void;
}

const TABS = ['Chi Tiêu', 'Thu Nhập', 'Chuyển Khoản'];
const TAB_MAP = {
    'Chi Tiêu': 'expense',
    'Thu Nhập': 'income',
    'Chuyển Khoản': 'transfer',
} as const;

const TransactionModal: React.FC<TransactionModalProps> = ({
    visible,
    onClose,
    onSave,
    editData,
    onDelete,
}) => {
    const [activeTab, setActiveTab] = useState('Chi Tiêu');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [toWalletId, setToWalletId] = useState(''); // Not fully wired, placeholder
    const [isSubmitting, setIsSubmitting] = useState(false);

    const translateY = useRef(new Animated.Value(600)).current;

    React.useEffect(() => {
        if (visible) {
            animateSheetIn(translateY).start();
            // Reset state
            setAmount('');
            setDescription('');
            setDate(new Date());
            setActiveTab('Chi Tiêu');
        }
    }, [visible, translateY]);

    const handleClose = () => {
        Keyboard.dismiss();
        animateSheetOut(translateY, 600, 250).start(({ finished }) => {
            if (finished) onClose();
        });
    };

    const handleSave = async () => {
        if (!amount || parseInt(amount.replace(/[^0-9]/g, ''), 10) <= 0) {
            return;
        }

        const typeMap: Record<string, 'IN' | 'OUT'> = { 'Thu Nhập': 'IN', 'Chi Tiêu': 'OUT' };
        // Safe mapping
        const mappedType = typeMap[activeTab] || 'OUT';

        try {
            await onSave(
                mappedType,
                parseInt(amount.replace(/[^0-9]/g, ''), 10),
                description,
                null // imageUri
            );
            handleClose();
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
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
                                <Text style={styles.title}>Giao dịch mới</Text>
                                <Pressable onPress={handleClose} style={styles.closeBtn}>
                                    <X size={24} color="#FFFFFF" strokeWidth={2.5} />
                                </Pressable>
                            </View>

                            <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
                                <View style={styles.tabsWrapper}>
                                    <SegmentedControl
                                        tabs={TABS}
                                        activeTab={activeTab}
                                        onTabChange={setActiveTab}
                                    />
                                </View>

                                {/* AMOUNT INPUT */}
                                <Text style={styles.label}>Số tiền (₫)</Text>
                                <TextInput
                                    style={[styles.input, styles.amountInput, { 
                                        color: activeTab === 'Thu Nhập' ? Colors.income : Colors.expense 
                                    }]}
                                    value={amount}
                                    onChangeText={setAmount}
                                    placeholder="0"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    keyboardType="numeric"
                                    selectionColor={Colors.accent}
                                />

                                {/* DESCRIPTION INPUT */}
                                <Text style={styles.label}>Mô tả</Text>
                                <TextInput
                                    style={styles.input}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="VD: Cà phê sáng..."
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    selectionColor={Colors.accent}
                                />

                                {/* DATE PICKER */}
                                <Text style={styles.label}>Thời gian</Text>
                                <Pressable
                                    style={styles.datePickerBtn}
                                    onPress={() => setShowDatePicker(true)}>
                                    <CalendarIcon size={20} color="rgba(255,255,255,0.7)" />
                                    <Text style={styles.dateText}>
                                        {format(date, 'dd/MM/yyyy • HH:mm')}
                                    </Text>
                                </Pressable>

                                {showDatePicker && (
                                    <DateTimePicker
                                        value={date}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            setShowDatePicker(false);
                                            if (selectedDate) {
                                                setDate(selectedDate);
                                            }
                                        }}
                                    />
                                )}

                                {/* ACTION BUTTON */}
                                <Pressable
                                    onPress={handleSave}
                                    disabled={isSubmitting}
                                    style={({ pressed }) => [
                                        styles.saveBtn,
                                        pressed && { opacity: 0.8 },
                                        isSubmitting && { opacity: 0.5 },
                                    ]}>
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.saveBtnText}>Lưu Giao Dịch</Text>
                                    )}
                                </Pressable>
                            </ScrollView>
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
        maxHeight: '88%',
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
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    closeBtn: {
        padding: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: Radii.pill,
    },
    scroll: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: 40,
    },
    tabsWrapper: {
        marginBottom: Spacing.xl,
        marginHorizontal: -16, // Bleed edges
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
        fontSize: FontSizes.xxl,
        fontWeight: '800',
        paddingVertical: Spacing.lg,
        textAlign: 'center',
    },
    datePickerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: Radii.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        padding: Spacing.md,
        gap: Spacing.sm,
        marginBottom: Spacing.xxl,
    },
    dateText: {
        fontSize: FontSizes.lg - 2,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    saveBtn: {
        backgroundColor: 'rgba(34, 211, 238, 0.3)', // Cyan accent
        borderRadius: Radii.lg,
        paddingVertical: Spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.6)',
        marginBottom: Spacing.xxl,
    },
    saveBtnText: {
        fontSize: FontSizes.lg,
        fontWeight: '800',
        color: '#FFFFFF',
    },
});

export default TransactionModal;
