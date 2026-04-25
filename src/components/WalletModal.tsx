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
import BackgroundLiquidGlass from './BackgroundLiquidGlass';
import LiquidInput from './LiquidInput';
import AmountInput2 from './AmountInput2';
import LiquidButton2 from './LiquidButton2';

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

    const animValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(animValue, {
                toValue: 1,
                duration: 350,
                easing: Easing.out(Easing.poly(4)), // Rất mượt ở đoạn cuối
                useNativeDriver: true,
            }).start();
            setName('');
            setBalanceStr('');
        }
    }, [visible, animValue]);

    const handleClose = () => {
        Keyboard.dismiss();
        Animated.timing(animValue, {
            toValue: 0,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                onClose();
                animValue.setValue(0);
            }
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
                {/* Backdrop Layer */}
                <Pressable style={styles.backdrop} onPress={handleClose}>
                    <Animated.View
                        style={[
                            styles.backdropFill,
                            {
                                opacity: animValue
                            }
                        ]}
                    />
                </Pressable>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                    pointerEvents="box-none">
                    <Animated.View style={[styles.contentWrapper, { 
                        opacity: animValue, 
                        transform: [{ 
                            scale: animValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.95, 1],
                            }) 
                        }] 
                    }]}>
                        <BackgroundLiquidGlass variant="dense" borderRadius={24} contentContainerStyle={styles.card}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Thêm Ví Mới</Text>
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
                        </View>
                        </BackgroundLiquidGlass>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    backdropFill: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    keyboardView: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    contentWrapper: {
        width: '85%',
        maxWidth: 360,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    card: {
        paddingBottom: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#FFFFFF',
        marginBottom: 8,
        fontWeight: '500',
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
