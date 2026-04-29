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
import { SpringConfigs } from '../../common/animations';
import AppleButton from '../ui/AppleButton';
import AppleTextInput from '../ui/AppleTextInput';
import AppleAmountInput from '../ui/AppleAmountInput';

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
                                <AppleTextInput
                                    label="Tên ví"
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Nhập tên ví..."
                                    autoCapitalize="sentences"
                                />

                                <AppleAmountInput
                                    label="Số dư hiện tại (₫)"
                                    value={balanceStr}
                                    onChangeText={handleBalanceChange}
                                    placeholder="0"
                                />
                            </View>
                            
                            {/* Actions (Bottom) */}
                            <View style={styles.actionsContainer}>
                                <AppleButton
                                    title="Hủy"
                                    onPress={handleClose}
                                    variant="secondary"
                                    style={{ flex: 1 }}
                                />
                                <AppleButton
                                    title="Lưu thay đổi"
                                    onPress={handleSave}
                                    variant="primary"
                                    disabled={isSaveDisabled}
                                    style={{ flex: 1 }}
                                />
                            </View>

                            {/* Bottom padding to push up content from the screen edge / home indicator */}
                            <View style={styles.bottomSpace} />
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
        backgroundColor: '#1C1C1E', // Apple iOS Dark Mode elevated background
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        marginBottom: -20, // Hides the bottom curved corners off-screen
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
        marginBottom: 16,
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
    actionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
    },
    bottomSpace: {
        height: (Platform.OS === 'ios' ? 40 : 32) + 20, // Compensate for the -20 marginBottom
    }
});

export default EditWalletModal;
