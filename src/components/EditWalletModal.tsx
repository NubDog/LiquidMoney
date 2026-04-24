/**
 * EditWalletModal.tsx — Modal for editing wallet name and balance
 * Refactored to Volumetric Liquid Glass
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
import AnimatedOverlay from './AnimatedOverlay';
import LiquidButton2 from './LiquidButton2';
import AmountInput2 from './AmountInput2';
import BackgroundLiquidGlass from './BackgroundLiquidGlass';
import LiquidInput from './LiquidInput';

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

    const sheetTranslateY = useRef(new Animated.Value(400)).current;
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            setName(walletName);
            setBalanceStr(walletBalance.toString());
            // Animate after mount
            requestAnimationFrame(() => {
                Animated.spring(sheetTranslateY, {
                    toValue: 0,
                    ...SpringConfigs.gentle,
                    useNativeDriver: true,
                }).start();
            });
        }
    }, [visible, walletName, walletBalance, sheetTranslateY]);

    const handleClose = useCallback(() => {
        Animated.timing(sheetTranslateY, {
            toValue: 400,
            duration: 250,
            useNativeDriver: true, // We will manually hide via timeout or parallel with Overlay
        }).start(({ finished }) => {
            if (finished) {
                setShouldRender(false);
                onClose();
            }
        });
    }, [sheetTranslateY, onClose]);

    const handleSave = useCallback(() => {
        const trimmedName = name.trim();
        if (!trimmedName) { return; }
        const balance = parseInt(balanceStr.replace(/[^0-9-]/g, ''), 10);
        if (isNaN(balance)) { return; }
        onSave(trimmedName, balance);
        handleClose();
    }, [name, balanceStr, onSave, handleClose]);

    if (!shouldRender && !visible) return null;

    return (
        <Modal
            visible={shouldRender}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}>
            <View style={styles.root}>
                <AnimatedOverlay 
                    visible={visible} 
                    onPress={() => {
                        Keyboard.dismiss();
                        handleClose();
                    }} 
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                    pointerEvents="box-none">
                    <Animated.View style={[{ transform: [{ translateY: sheetTranslateY }] }]}>
                        <BackgroundLiquidGlass 
                            style={styles.sheet}
                            
                            borderRadius={Radii.xxl}
                        >
                            <Pressable onPress={Keyboard.dismiss}>
                                <View style={styles.handleBar} />

                                <Text style={styles.title}>Chỉnh sửa ví</Text>

                                <Text style={styles.label}>Tên ví</Text>
                                <LiquidInput
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Nhập tên ví"
                                    containerStyle={{ marginBottom: Spacing.lg }}
                                />

                                <AmountInput2
                                    label="Số dư hiện tại (₫)"
                                    value={balanceStr}
                                    onChangeText={setBalanceStr}
                                />

                                <View style={styles.actions}>
                                    <LiquidButton2 title="Lưu thay đổi" onPress={handleSave} />
                                    <LiquidButton2 title="Hủy" onPress={handleClose} />
                                </View>
                            </Pressable>
                        </BackgroundLiquidGlass>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1 },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheet: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottomWidth: 0,
        paddingHorizontal: Spacing.xl,
        paddingBottom: 40,
    },
    handleBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: Spacing.xl,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    label: {
        fontSize: FontSizes.md - 1,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: Spacing.sm,
    },
    actions: {
        gap: 12,
        marginTop: Spacing.sm,
    },
});

export default EditWalletModal;
