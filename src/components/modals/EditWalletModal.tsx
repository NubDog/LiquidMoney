import React, { useCallback, useEffect, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableWithoutFeedback,
    ScrollView,
    Image
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { launchImageLibrary } from 'react-native-image-picker';
import AppleButton from '../ui/AppleButton';
import AppleTextInput from '../ui/AppleTextInput';
import AppleAmountInput from '../ui/AppleAmountInput';

interface EditWalletModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (name: string, currentBalance: number, imageUri: string | null) => void;
    walletName: string;
    walletBalance: number;
    walletImageUri?: string | null;
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
    walletImageUri
}) => {
    const [name, setName] = useState(walletName);
    const [balanceStr, setBalanceStr] = useState(formatCurrency(walletBalance.toString()));
    const [imageUri, setImageUri] = useState<string | null>(walletImageUri || null);

    const sheetTranslateY = useSharedValue(600);
    const opacityAnim = useSharedValue(0);
    const [shouldRender, setShouldRender] = useState(false);

    // Native Keyboard Avoidance + ScrollView will handle everything smoothly.

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            setName(walletName);
            setBalanceStr(formatCurrency(walletBalance.toString()));
            setImageUri(walletImageUri || null);
            sheetTranslateY.value = withTiming(0, { duration: 400 });
            opacityAnim.value = withTiming(1, { duration: 400 });
        }
    }, [visible, sheetTranslateY, opacityAnim, walletName, walletBalance, walletImageUri]);

    const handleClose = useCallback(() => {
        Keyboard.dismiss();
        sheetTranslateY.value = withTiming(600, { duration: 400 });
        opacityAnim.value = withTiming(0, { duration: 400 }, (finished) => {
            if (finished) {
                runOnJS(setShouldRender)(false);
                runOnJS(onClose)();
            }
        });
    }, [sheetTranslateY, opacityAnim, onClose]);

    const handleSave = useCallback(() => {
        const trimmedName = name.trim();
        if (!trimmedName) { return; }
        const balance = parseInt(balanceStr.replace(/[^0-9-]/g, ''), 10) || 0;
        onSave(trimmedName, balance, imageUri);
        handleClose();
    }, [name, balanceStr, imageUri, onSave, handleClose]);

    const handlePickImage = useCallback(async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
            });
            if (result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                if (uri) {
                    setImageUri(uri);
                }
            }
        } catch (error) {
            console.error('Lỗi khi chọn ảnh:', error);
        }
    }, []);

    const handleBalanceChange = (text: string) => {
        setBalanceStr(formatCurrency(text));
    };

    const isSaveDisabled = !name.trim();

    const animatedOverlayStyle = useAnimatedStyle(() => ({
        opacity: opacityAnim.value
    }));

    const animatedSheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: sheetTranslateY.value }]
    }));

    if (!shouldRender && !visible) return null;

    return (
        <Modal
            visible={shouldRender}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}>
            <View style={styles.root}>
                <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, animatedOverlayStyle]}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => {
                        Keyboard.dismiss();
                        handleClose();
                    }} />
                </Animated.View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardView}
                    pointerEvents="box-none">
                    <Animated.View style={[styles.sheetContainer, { flexShrink: 1, maxHeight: '90%' }, animatedSheetStyle]}>
                        <ScrollView
                            bounces={false}
                            showsVerticalScrollIndicator={true}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{ flexGrow: 1 }}
                            // @ts-ignore: delaysContentTouches is a valid ScrollView prop but missing in FlatList/ScrollView types in some RN versions
                            delaysContentTouches={false}
                        >
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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

                                {/* Chọn ảnh nền */}
                                <View style={{ marginTop: 24, alignItems: 'center' }}>
                                    <Text style={{ color: 'rgba(235, 235, 245, 0.6)', marginBottom: 12, fontWeight: '500' }}>Ảnh nền ví</Text>
                                    <Pressable 
                                        style={{ 
                                            width: '85%', 
                                            aspectRatio: 2.2, 
                                            borderRadius: 16, 
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            borderWidth: 1,
                                            borderColor: 'rgba(255, 255, 255, 0.1)',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 8,
                                        }} 
                                        onPress={handlePickImage}
                                    >
                                        {imageUri ? (
                                            <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%', borderRadius: 15 }} resizeMode="cover" />
                                        ) : (
                                            <Text style={{ color: '#0A84FF', fontSize: 16, fontWeight: '600' }}>+ Đổi ảnh nền</Text>
                                        )}
                                    </Pressable>
                                    {imageUri && (
                                        <View style={{ marginTop: 16, width: '85%' }}>
                                            <AppleButton
                                                title="Xóa ảnh nền"
                                                variant="danger"
                                                onPress={() => setImageUri(null)}
                                            />
                                        </View>
                                    )}
                                </View>
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
                        </TouchableWithoutFeedback>
                        </ScrollView>
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
