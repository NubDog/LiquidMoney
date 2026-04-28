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
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Calendar as CalendarIcon, X } from 'lucide-react-native';
import { format } from 'date-fns';
import { animateSheetIn, animateSheetOut } from '../common/animations';
import AnimatedOverlay from './AnimatedOverlay';
import AppleButton from './ui/AppleButton';
import AppleTextInput from './ui/AppleTextInput';
import AppleAmountInput from './ui/AppleAmountInput';
import AppleDatePicker from './ui/AppleDatePicker';
import AppleSegmentedControl from './ui/AppleSegmentedControl';
import AppleCloseButton from './ui/AppleCloseButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSizes, Shadows, Spacing, Radii } from '../common/theme';

interface TransactionModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (type: 'IN' | 'OUT', amount: number, reason?: string | null, imageUri?: string | null) => void | Promise<void>;
    editData?: any | null;
    onDelete?: () => void;
}

const TABS = ['Chi Tiêu', 'Thu Nhập'];
const TAB_MAP = {
    'Chi Tiêu': 'expense',
    'Thu Nhập': 'income',
} as const;

const TransactionModal: React.FC<TransactionModalProps> = ({
    visible,
    onClose,
    onSave,
    editData,
    onDelete,
}) => {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('Thu Nhập');
    const [amount, setAmount] = useState('0');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [toWalletId, setToWalletId] = useState(''); // Not fully wired, placeholder
    const [isSubmitting, setIsSubmitting] = useState(false);

    const translateY = useRef(new Animated.Value(600)).current;
    const amountInputRef = useRef<TextInput>(null);

    React.useEffect(() => {
        if (visible) {
            animateSheetIn(translateY).start();
            // Reset state
            setAmount('0');
            setDescription('');
            setDate(new Date());
            setActiveTab('Thu Nhập');
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
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardView}
                    pointerEvents="box-none">
                    <Animated.View style={[styles.sheetContainer, { transform: [{ translateY }] }]}>
                        <View style={styles.sheet}>
                            <View style={styles.handleBar} />
                            <View style={styles.header}>
                                <Text style={styles.title}>Giao dịch mới</Text>
                                <AppleCloseButton onPress={handleClose} size={32} />
                            </View>

                            <View style={styles.formContainer}>
                                <View style={styles.tabsWrapper}>
                                    <AppleSegmentedControl
                                        options={[
                                            { key: 'Thu Nhập', label: 'THU NHẬP' },
                                            { key: 'Chi Tiêu', label: 'CHI TIÊU' }
                                        ]}
                                        selected={activeTab}
                                        onChange={(val) => setActiveTab(val as string)}
                                    />
                                </View>

                                {/* AMOUNT INPUT */}
                                <AppleAmountInput
                                    label="Số tiền (₫)"
                                    value={amount}
                                    onChangeText={setAmount}
                                />

                                {/* DESCRIPTION INPUT */}
                                <AppleTextInput
                                    label="Mô tả"
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="VD: Cà phê sáng..."
                                    containerStyle={{ marginBottom: Spacing.lg }}
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

                                <AppleDatePicker
                                    visible={showDatePicker}
                                    date={date}
                                    onConfirm={(newDate) => {
                                        setDate(newDate);
                                        setShowDatePicker(false);
                                    }}
                                    onCancel={() => setShowDatePicker(false)}
                                />

                                {/* ACTION BUTTON */}
                                <View style={styles.actionsContainer}>
                                    <AppleButton
                                        title="Lưu Giao Dịch"
                                        onPress={handleSave}
                                        disabled={isSubmitting}
                                        style={{ width: '100%' }}
                                    />
                                </View>
                            </View>
                            
                            {/* Bottom padding to push up content from the screen edge / home indicator */}
                            <View style={{ height: Math.max(insets.bottom, 48) }} />
                        </View>
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
        backgroundColor: '#1C1C1E', // iOS Dark Mode Elevated
        ...Shadows.menu,
    },
    sheet: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottomWidth: 0,
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
    },
    formContainer: {
        paddingHorizontal: Spacing.xl,
    },
    tabsWrapper: {
        marginBottom: Spacing.xl,
    },
    label: {
        fontSize: 13,
        color: '#FFFFFF',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    datePickerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C2C2E', // iOS Dark Mode Elevated
        borderRadius: 100, // Pill-shape to match inputs
        paddingHorizontal: 20,
        paddingVertical: 14,
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    dateText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    actionsContainer: {
        paddingTop: Spacing.xl,
    },
});

export default TransactionModal;
