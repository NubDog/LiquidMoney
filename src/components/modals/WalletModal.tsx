import React, { useRef, useState, useEffect } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
    Pressable,
    Animated,
    Keyboard,
    TouchableOpacity
} from 'react-native';

import { Easing } from 'react-native';
import AppleTextInput from '../ui/AppleTextInput';
import AppleAmountInput from '../ui/AppleAmountInput';
import AppleButton from '../ui/AppleButton';
import { animateSheetIn, animateSheetOut } from '../../common/animations';
import AnimatedOverlay from '../overlays/AnimatedOverlay';
import AppleCloseButton from '../ui/AppleCloseButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Radii, Shadows, Spacing, FontSizes } from '../../common/theme';

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
    const insets = useSafeAreaInsets();
    const [name, setName] = useState('');
    const [balanceStr, setBalanceStr] = useState('');

    const translateY = useRef(new Animated.Value(600)).current;

    const prevVisible = useRef(false);

    useEffect(() => {
        if (visible && !prevVisible.current) {
            translateY.stopAnimation();
            animateSheetIn(translateY).start();
            setName('');
            setBalanceStr('');
        }
        prevVisible.current = visible;
    }, [visible, translateY]);

    const handleClose = () => {
        Keyboard.dismiss();
        translateY.stopAnimation();
        animateSheetOut(translateY, 600, 250).start(() => {
            onClose();
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

    const handleAmountChange = (text: string) => {
        const rawValue = text.replace(/[^0-9]/g, '');
        if (!rawValue) {
            setBalanceStr('');
            return;
        }
        const formatted = parseInt(rawValue, 10).toLocaleString('vi-VN').replace(/,/g, '.');
        setBalanceStr(formatted);
    };

    const isSaveDisabled = !name.trim() || !balanceStr;

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
                        <View style={styles.modalContent}>
                            <View style={styles.handleBar} />
                            
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>Thêm Ví Mới</Text>
                                <AppleCloseButton onPress={handleClose} size={32} />
                            </View>

                            {/* Content */}
                            <View style={styles.content}>
                                <AppleTextInput
                                    label="Tên ví"
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="VD: Tiền mặt, Thẻ tín dụng..."
                                    autoCapitalize="sentences"
                                />

                                <AppleAmountInput
                                    label="Số dư ban đầu"
                                    value={balanceStr}
                                    onChangeText={handleAmountChange}
                                    placeholder="0"
                                />

                                <AppleButton
                                    title="Tạo Ví"
                                    onPress={handleSave}
                                    disabled={isSaveDisabled}
                                    style={styles.saveBtn}
                                />
                                
                                {/* Bottom padding to push up content from the screen edge / home indicator */}
                                <View style={{ height: Math.max(insets.bottom, 48) }} />
                            </View>
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end',
        width: '100%',
    },
    sheetContainer: {
        width: '100%',
        ...Shadows.menu,
    },
    modalContent: {
        backgroundColor: '#1C1C1E', // Dark mode background
        borderTopLeftRadius: Radii.xxl,
        borderTopRightRadius: Radii.xxl,
        overflow: 'hidden',
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
    content: {
        paddingHorizontal: Spacing.xl,
        paddingTop: 10,
    },
    saveBtn: {
        marginTop: 10,
    },
});

export default WalletModal;
