/**
 * QuickTransactionModal.tsx — Modal nhập nhanh giao dịch từ Widget
 * Thiết kế chuẩn 100% theo bản thiết kế mẫu pasted file1.png & pasted file2.png.
 */

import React, { useRef, useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    ScrollView,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, cancelAnimation, runOnJS } from 'react-native-reanimated';
import { ChevronDown, ChevronUp, Wallet as WalletIcon, FileText, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSizes, Radii, Spacing } from '../../common/theme';
import { Wallet } from '../../common/types';
import AnimatedOverlay from '../overlays/AnimatedOverlay';
import { animateSheetIn } from '../../common/animations';

interface QuickTransactionModalProps {
    visible: boolean;
    wallets: Wallet[];
    onClose: () => void;
    onSave: (walletId: string, type: 'IN' | 'OUT', amount: number, reason?: string) => void | Promise<void>;
}

const QuickTransactionModal: React.FC<QuickTransactionModalProps> = ({
    visible,
    wallets,
    onClose,
    onSave,
}) => {
    const insets = useSafeAreaInsets();
    const [selectedWalletId, setSelectedWalletId] = useState<string>('');
    const [showWalletDropdown, setShowWalletDropdown] = useState<boolean>(false);
    const [transactionType, setTransactionType] = useState<'OUT' | 'IN'>('OUT');
    const [amountText, setAmountText] = useState<string>('');
    const [reasonText, setReasonText] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const translateY = useSharedValue(600);
    const prevVisible = useRef(false);

    // Dynamic wallet selection
    useEffect(() => {
        if (wallets.length > 0 && (!selectedWalletId || !wallets.some(w => w.id === selectedWalletId))) {
            setSelectedWalletId(wallets[0].id);
        }
    }, [wallets, selectedWalletId]);

    useEffect(() => {
        if (visible && !prevVisible.current) {
            cancelAnimation(translateY);
            animateSheetIn(translateY);
            setAmountText('');
            setReasonText('');
            setTransactionType('OUT');
            setShowWalletDropdown(false);
        }
        prevVisible.current = visible;
    }, [visible, translateY]);

    const selectedWallet = wallets.find(w => w.id === selectedWalletId) || wallets[0];

    const handleClose = () => {
        Keyboard.dismiss();
        setShowWalletDropdown(false);
        cancelAnimation(translateY);
        translateY.value = withTiming(600, { duration: 250 }, (finished) => {
            if (finished) {
                runOnJS(onClose)();
            }
        });
    };

    const handleSave = async () => {
        const rawAmount = parseInt(amountText.replace(/[^0-9]/g, ''), 10);
        if (!selectedWallet || isNaN(rawAmount) || rawAmount <= 0) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(selectedWallet.id, transactionType, rawAmount, reasonText.trim());
            handleClose();
        } catch (error) {
            console.error('[QuickTransactionModal] Save failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDisplayAmount = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        if (!cleaned) return '';
        return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleAmountChange = (val: string) => {
        const cleaned = val.replace(/[^0-9]/g, '');
        setAmountText(cleaned);
    };

    const animatedSheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            statusBarTranslucent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.modalRoot}>
                <AnimatedOverlay visible={visible} onPress={handleClose} />

                <Animated.View style={[styles.sheetContainer, animatedSheetStyle, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}>
                    {/* Handle Indicator */}
                    <View style={styles.handleBar} />

                    {/* Header with Close Button */}
                    <View style={styles.headerRow}>
                        <View style={{ flex: 1 }} />
                        <Pressable onPress={handleClose} style={styles.closeButton} hitSlop={12}>
                            <X size={18} color="#FFFFFF" />
                        </Pressable>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* 1. Wallet Selection Dropdown Pill */}
                        <View style={styles.walletDropdownWrapper}>
                            <Pressable
                                onPress={() => setShowWalletDropdown(prev => !prev)}
                                style={styles.walletPillBtn}
                            >
                                <WalletIcon size={16} color="#0066FF" style={{ marginRight: 8 }} />
                                <Text style={styles.walletPillText} numberOfLines={1}>
                                    {selectedWallet ? selectedWallet.name : 'Chọn ví'}
                                </Text>
                                {showWalletDropdown ? (
                                    <ChevronUp size={16} color="#8E8E93" style={{ marginLeft: 6 }} />
                                ) : (
                                    <ChevronDown size={16} color="#8E8E93" style={{ marginLeft: 6 }} />
                                )}
                            </Pressable>

                            {/* Dropdown Options Popup (pasted file2.png style) */}
                            {showWalletDropdown && (
                                <View style={styles.dropdownPopup}>
                                    {wallets.map(w => (
                                        <Pressable
                                            key={w.id}
                                            onPress={() => {
                                                setSelectedWalletId(w.id);
                                                setShowWalletDropdown(false);
                                            }}
                                            style={[
                                                styles.dropdownItem,
                                                w.id === selectedWalletId && styles.dropdownItemActive,
                                            ]}
                                        >
                                            <WalletIcon
                                                size={16}
                                                color={w.id === selectedWalletId ? '#0066FF' : '#8E8E93'}
                                                style={{ marginRight: 10 }}
                                            />
                                            <Text
                                                style={[
                                                    styles.dropdownItemText,
                                                    w.id === selectedWalletId && styles.dropdownItemTextActive,
                                                ]}
                                            >
                                                {w.name}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* 2. Type Selector (Chi Tiêu / Thu Nhập) */}
                        <View style={styles.typeSelectorRow}>
                            <Pressable
                                onPress={() => setTransactionType('OUT')}
                                style={[styles.typeBtn, transactionType === 'OUT' && styles.typeBtnExpense]}
                            >
                                <Text style={[styles.typeBtnText, transactionType === 'OUT' && styles.typeBtnTextActive]}>
                                    Chi Tiêu
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setTransactionType('IN')}
                                style={[styles.typeBtn, transactionType === 'IN' && styles.typeBtnIncome]}
                            >
                                <Text style={[styles.typeBtnText, transactionType === 'IN' && styles.typeBtnTextActive]}>
                                    Thu Nhập
                                </Text>
                            </Pressable>
                        </View>

                        {/* 3. Section: SỐ TIỀN */}
                        <View style={styles.fieldSection}>
                            <Text style={styles.fieldLabel}>SỐ TIỀN</Text>
                            <View style={styles.inputContainer}>
                                <Text style={styles.currencyPrefix}>đ</Text>
                                <TextInput
                                    style={styles.textInputAmount}
                                    value={formatDisplayAmount(amountText)}
                                    onChangeText={handleAmountChange}
                                    placeholder="0"
                                    placeholderTextColor="rgba(255, 255, 255, 0.25)"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        {/* 4. Section: NỘI DUNG */}
                        <View style={styles.fieldSection}>
                            <Text style={styles.fieldLabel}>NỘI DUNG</Text>
                            <View style={styles.inputContainer}>
                                <FileText size={18} color="rgba(255, 255, 255, 0.4)" style={{ marginRight: 10 }} />
                                <TextInput
                                    style={styles.textInputReason}
                                    value={reasonText}
                                    onChangeText={setReasonText}
                                    placeholder="Nhập nội dung giao dịch"
                                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                                />
                            </View>
                        </View>

                        {/* 5. Submit Button */}
                        <Pressable
                            onPress={handleSave}
                            disabled={isSubmitting || !amountText}
                            style={({ pressed }) => [
                                styles.submitBtn,
                                (!amountText || isSubmitting) && styles.submitBtnDisabled,
                                pressed && styles.submitBtnPressed,
                            ]}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.submitBtnText}>Thêm giao dịch</Text>
                            )}
                        </Pressable>
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalRoot: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheetContainer: {
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
            },
            android: {
                elevation: 16,
            },
        }),
    },
    handleBar: {
        width: 40,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        alignSelf: 'center',
        marginBottom: 8,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 10,
    },
    walletDropdownWrapper: {
        alignItems: 'center',
        marginBottom: 20,
        zIndex: 99,
    },
    walletPillBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    walletPillText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        maxWidth: 160,
    },
    dropdownPopup: {
        position: 'absolute',
        top: 48,
        backgroundColor: '#2C2C2E',
        borderRadius: 16,
        width: 220,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
            },
            android: {
                elevation: 10,
            },
        }),
        zIndex: 999,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dropdownItemActive: {
        backgroundColor: 'rgba(0, 102, 255, 0.15)',
    },
    dropdownItemText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        fontWeight: '500',
    },
    dropdownItemTextActive: {
        color: '#0066FF',
        fontWeight: '700',
    },
    typeSelectorRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 12,
        padding: 3,
        marginBottom: 20,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    typeBtnExpense: {
        backgroundColor: '#FF453A',
    },
    typeBtnIncome: {
        backgroundColor: '#32D74B',
    },
    typeBtnText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        fontWeight: '600',
    },
    typeBtnTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    fieldSection: {
        marginBottom: 20,
    },
    fieldLabel: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.8,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        paddingHorizontal: 16,
        height: 52,
    },
    currencyPrefix: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 18,
        fontWeight: '600',
        marginRight: 10,
        textDecorationLine: 'underline',
    },
    textInputAmount: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        padding: 0,
    },
    textInputReason: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '400',
        padding: 0,
    },
    submitBtn: {
        backgroundColor: '#0066FF',
        borderRadius: 20,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#0066FF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    submitBtnDisabled: {
        backgroundColor: 'rgba(0, 102, 255, 0.4)',
    },
    submitBtnPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.98 }],
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
});

export default QuickTransactionModal;
