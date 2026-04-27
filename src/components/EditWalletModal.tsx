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
import { SpringConfigs } from '../common/animations';

interface EditWalletModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (name: string, currentBalance: number) => void;
    walletName: string;
    walletBalance: number;
}

const formatCurrency = (val: string) => {
    const num = val.replace(/[^0-9-]/g, '');
    if (!num || num === '-') return num;
    const parsed = parseInt(num, 10);
    if (isNaN(parsed)) return '';
    return parsed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const EditWalletModal: React.FC<EditWalletModalProps> = ({
    visible,
    onClose,
    onSave,
    walletName,
    walletBalance,
}) => {
    const [name, setName] = useState(walletName);
    const [balanceStr, setBalanceStr] = useState(formatCurrency(walletBalance.toString()));

    const sheetTranslateY = useRef(new Animated.Value(600)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            setName(walletName);
            setBalanceStr(formatCurrency(walletBalance.toString()));
            
            // Animate after mount
            requestAnimationFrame(() => {
                Animated.parallel([
                    Animated.spring(sheetTranslateY, {
                        toValue: 0,
                        ...SpringConfigs.gentle,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 1,
                        duration: 250,
                        useNativeDriver: true,
                    })
                ]).start();
            });
        }
    }, [visible, walletName, walletBalance, sheetTranslateY, opacityAnim]);

    const handleClose = useCallback(() => {
        Animated.parallel([
            Animated.timing(sheetTranslateY, {
                toValue: 600,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            })
        ]).start(({ finished }) => {
            if (finished) {
                setShouldRender(false);
                onClose();
            }
        });
    }, [sheetTranslateY, opacityAnim, onClose]);

    const handleSave = useCallback(() => {
        const trimmedName = name.trim();
        if (!trimmedName) { return; }
        const balance = parseInt(balanceStr.replace(/[^0-9-]/g, ''), 10) || 0;
        onSave(trimmedName, balance);
        handleClose();
    }, [name, balanceStr, onSave, handleClose]);

    const handleBalanceChange = (text: string) => {
        setBalanceStr(formatCurrency(text));
    };

    const isSaveDisabled = !name.trim();

    if (!shouldRender && !visible) return null;

    return (
        <Modal
            visible={shouldRender}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}>
            <View style={styles.root}>
                <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, { opacity: opacityAnim }]}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => {
                        Keyboard.dismiss();
                        handleClose();
                    }} />
                </Animated.View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardView}
                    pointerEvents="box-none">
                    <Animated.View style={[styles.sheetContainer, { transform: [{ translateY: sheetTranslateY }] }]}>
                        <View style={styles.sheet}>
                            {/* Drag Handle */}
                            <View style={styles.handleBar} />

                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>Chỉnh sửa ví</Text>
                            </View>

                            {/* Inputs */}
                            <View style={styles.formContainer}>
                                <Text style={styles.inputLabel}>Tên ví</Text>
                                <TextInput
                                    style={styles.inputField}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Nhập tên ví..."
                                    placeholderTextColor="rgba(235, 235, 245, 0.3)"
                                    autoCapitalize="sentences"
                                />

                                <Text style={[styles.inputLabel, { marginTop: 20 }]}>Số dư hiện tại (₫)</Text>
                                <TextInput
                                    style={styles.inputField}
                                    value={balanceStr}
                                    onChangeText={handleBalanceChange}
                                    placeholder="0"
                                    placeholderTextColor="rgba(235, 235, 245, 0.3)"
                                    keyboardType="numeric"
                                />
                            </View>
                            
                            {/* Actions (Bottom) */}
                            <View style={styles.actionsContainer}>
                                <Pressable 
                                    style={[styles.bottomBtn, styles.bottomBtnCancel]} 
                                    onPress={handleClose}
                                >
                                    <Text style={styles.bottomBtnCancelText}>Hủy</Text>
                                </Pressable>

                                <Pressable 
                                    style={[styles.bottomBtn, styles.bottomBtnSave, isSaveDisabled && styles.bottomBtnDisabled]} 
                                    onPress={handleSave}
                                    disabled={isSaveDisabled}
                                >
                                    <Text style={styles.bottomBtnSaveText}>Lưu thay đổi</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    root: { 
        flex: 1,
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheetContainer: {
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 20,
    },
    sheet: {
        backgroundColor: '#1C1C1E', // Standard iOS dark modal background
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    handleBar: {
        width: 36,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#545456',
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 6,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    formContainer: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 8,
    },
    inputField: {
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#FFFFFF',
    },
    actionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
    },
    bottomBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomBtnCancel: {
        backgroundColor: '#2C2C2E',
    },
    bottomBtnSave: {
        backgroundColor: '#0A84FF',
    },
    bottomBtnDisabled: {
        opacity: 0.5,
    },
    bottomBtnCancelText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomBtnSaveText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    }
});

export default EditWalletModal;
