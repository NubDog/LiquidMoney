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
import AppleGlassBackground from './ui/AppleGlassBackground';
import LiquidInput from './LiquidInput';
import AmountInput2 from './AmountInput2';
import LiquidButton2 from './LiquidButton2';
import { animateSheetIn, animateSheetOut } from '../common/animations';
import AnimatedOverlay from './AnimatedOverlay';
import AppleCloseButton from './ui/AppleCloseButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Radii, Shadows, Spacing, FontSizes } from '../common/theme';

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

    useEffect(() => {
        if (visible) {
            animateSheetIn(translateY).start();
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
                        <AppleGlassBackground 
                            variant="dark" 
                            borderRadius={Radii.xxl} 
                            style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                            contentContainerStyle={styles.card}
                        >
                            <View style={styles.handleBar} />
                            
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>Thêm Ví Mới</Text>
                                <AppleCloseButton onPress={handleClose} size={32} />
                            </View>

                            {/* Content */}
                            <View style={styles.content}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Tên ví</Text>
                                    <LiquidInput
                                        containerStyle={styles.nameInputContainer}
                                        style={styles.input}
                                        value={name}
                                        onChangeText={setName}
                                        placeholder="VD: Tiền mặt, Thẻ tín dụng..."
                                        autoCapitalize="sentences"
                                        disableBlur={true}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Số dư ban đầu</Text>
                                    <AmountInput2
                                        style={styles.amountInputContainer}
                                        value={balanceStr}
                                        onChangeText={handleAmountChange}
                                        disableBlur={true}
                                    />
                                </View>

                                <LiquidButton2
                                    title="Tạo Ví"
                                    onPress={handleSave}
                                    disabled={isSaveDisabled}
                                    style={styles.saveBtn}
                                    disableBlur={true}
                                />
                                
                                {/* Bottom padding to push up content from the screen edge / home indicator */}
                                <View style={{ height: Math.max(insets.bottom, 48) }} />
                            </View>
                        </AppleGlassBackground>
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
    card: {
        // Content wrapper
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
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#FFFFFF',
        marginBottom: 8,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        fontSize: 16,
    },
    nameInputContainer: {
        height: 54,
    },
    amountInputContainer: {
        width: '100%',
        height: 56,
    },
    saveBtn: {
        marginTop: 10,
    },
});

export default WalletModal;
