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
                    <Animated.View style={[styles.sheet, { 
                        opacity: animValue, 
                        transform: [{ 
                            scale: animValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.95, 1],
                            }) 
                        }] 
                    }]}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Thêm Ví Mới</Text>
                        </View>

                        {/* Content */}
                        <View style={styles.content}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tên ví</Text>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="VD: Tiền mặt, Thẻ tín dụng..."
                                    placeholderTextColor="#8E8E93"
                                    autoCapitalize="sentences"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Số dư ban đầu</Text>
                                <TextInput
                                    style={[styles.input, styles.amountInput]}
                                    value={balanceStr}
                                    onChangeText={handleAmountChange}
                                    placeholder="0"
                                    placeholderTextColor="#8E8E93"
                                    keyboardType="numeric"
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.saveBtn, isSaveDisabled && styles.saveBtnDisabled]}
                                onPress={handleSave}
                                disabled={isSaveDisabled}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.saveBtnText, isSaveDisabled && styles.saveBtnTextDisabled]}>
                                    Tạo Ví
                                </Text>
                            </TouchableOpacity>
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
    sheet: {
        backgroundColor: '#1C1C1E',
        borderRadius: 24,
        paddingBottom: 24,
        width: '85%',
        maxWidth: 360,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
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
        fontSize: 15,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 17,
        color: '#FFFFFF',
    },
    amountInput: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'right',
        paddingVertical: 20,
    },
    saveBtn: {
        backgroundColor: '#007AFF',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    saveBtnDisabled: {
        backgroundColor: '#E5E5EA',
    },
    saveBtnText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    saveBtnTextDisabled: {
        color: '#8E8E93',
    },
});

export default WalletModal;
