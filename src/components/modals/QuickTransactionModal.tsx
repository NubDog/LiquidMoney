/**
 * QuickTransactionModal.tsx — Modal nhập nhanh giao dịch từ Widget
 * Thiết kế chuẩn 100% theo bản thiết kế mẫu pasted file1.png & pasted file2.png.
 */

import React, { useRef, useState, useEffect } from 'react';
import {
    Keyboard,
    Modal,
    Platform,
    StyleSheet,
    View,
    ScrollView,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, cancelAnimation, runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wallet } from '../../common/types';
import AnimatedOverlay from '../overlays/AnimatedOverlay';
import { animateSheetIn } from '../../common/animations';
import AppleSegmentedControl from '../ui/AppleSegmentedControl';
import WalletDropdownPicker from '../ui/WalletDropdownPicker';
import AppleAmountInput from '../ui/AppleAmountInput';
import AppleTextInput from '../ui/AppleTextInput';
import AppleButton from '../ui/AppleButton';
import AppleCloseButton from '../ui/AppleCloseButton';

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
        }
        prevVisible.current = visible;
    }, [visible, translateY]);

    const selectedWallet = wallets.find(w => w.id === selectedWalletId) || wallets[0];

    const handleClose = () => {
        Keyboard.dismiss();
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
                        <AppleCloseButton onPress={handleClose} size={32} />
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* 1. Wallet Selection Dropdown Pill with smooth rotation and slide down animations */}
                        <WalletDropdownPicker
                            wallets={wallets}
                            selectedWalletId={selectedWalletId}
                            onSelectWallet={setSelectedWalletId}
                        />

                        {/* 2. Type Selector (Chi Tiêu / Thu Nhập) using AppleSegmentedControl */}
                        <AppleSegmentedControl
                            options={[
                                { key: 'OUT', label: 'CHI TIÊU' },
                                { key: 'IN', label: 'THU NHẬP' },
                            ]}
                            selected={transactionType}
                            onChange={(key) => setTransactionType(key as 'OUT' | 'IN')}
                            style={{ marginBottom: 20 }}
                        />

                        {/* 3. Section: SỐ TIỀN using AppleAmountInput */}
                        <AppleAmountInput
                            label="SỐ TIỀN"
                            value={amountText}
                            onChangeText={setAmountText}
                            placeholder="0"
                        />

                        {/* 4. Section: NỘI DUNG using AppleTextInput */}
                        <AppleTextInput
                            label="NỘI DUNG"
                            value={reasonText}
                            onChangeText={setReasonText}
                            placeholder="Nhập nội dung giao dịch"
                            containerStyle={{ marginBottom: 20 }}
                        />

                        {/* 5. Submit Button using AppleButton */}
                        <AppleButton
                            title="Thêm giao dịch"
                            onPress={handleSave}
                            disabled={!amountText || isSubmitting}
                            loading={isSubmitting}
                            style={{ marginTop: 10 }}
                        />
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
    scrollContent: {
        paddingBottom: 10,
    },
});

export default QuickTransactionModal;
