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
import { X } from 'lucide-react-native';
import { animateSheetIn, animateSheetOut } from '../common/animations';

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

    const translateY = useRef(new Animated.Value(800)).current;

    useEffect(() => {
        if (visible) {
            animateSheetIn(translateY).start();
            // Reset state khi mở
            setName('');
            setBalanceStr('');
        }
    }, [visible, translateY]);

    const handleClose = () => {
        Keyboard.dismiss();
        animateSheetOut(translateY, 800, 250).start(({ finished }) => {
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
                {/* Backdrop Layer */}
                <Pressable style={styles.backdrop} onPress={handleClose}>
                    <Animated.View 
                        style={[
                            styles.backdropFill, 
                            { 
                                opacity: translateY.interpolate({ 
                                    inputRange: [0, 800], 
                                    outputRange: [1, 0],
                                    extrapolate: 'clamp'
                                }) 
                            }
                        ]} 
                    />
                </Pressable>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                    pointerEvents="box-none">
                    <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Thêm Ví Mới</Text>
                            <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.7}>
                                <X size={20} color="#8E8E93" strokeWidth={2.5} />
                            </TouchableOpacity>
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
                                    placeholderTextColor="#C7C7CC"
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
                                    placeholderTextColor="#C7C7CC"
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
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    backdropFill: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    keyboardView: {
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5EA',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000000',
        letterSpacing: -0.5,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
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
        color: '#3A3A3C',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 17,
        color: '#000000',
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
