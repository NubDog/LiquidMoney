/**
 * WalletModal.tsx — Modal tạo / sửa ví
 * Dùng RN core Modal, safe-require cho image picker
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    NativeModules,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';

// ─── Props ────────────────────────────────────────────────────────────────────

interface WalletModalProps {
    /** Hiện/ẩn modal */
    visible: boolean;
    /** Callback đóng modal */
    onClose: () => void;
    /** Callback khi lưu */
    onSave: (
        name: string,
        initialBalance: number,
        imageUri?: string | null,
    ) => void;
    /** Callback khi xóa (chỉ edit mode) */
    onDelete?: () => void;
    /** Dữ liệu ví để sửa (nếu edit mode) */
    editData?: {
        name: string;
        initialBalance: number;
        imageUri: string | null;
    } | null;
}

// ─── Kiểm tra Image Picker ───────────────────────────────────────────────────

function isImagePickerAvailable(): boolean {
    // react-native-image-picker đăng ký native module "ImagePickerManager"
    return (
        NativeModules.ImagePickerManager != null ||
        NativeModules.RNImagePicker != null
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

const WalletModal: React.FC<WalletModalProps> = ({
    visible,
    onClose,
    onSave,
    onDelete,
    editData,
}) => {
    const insets = useSafeAreaInsets();
    const isEdit = editData != null;

    // ─── Form State ─────────────────────────────────────────────────────────────
    const [name, setName] = useState('');
    const [balanceText, setBalanceText] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [hasImagePicker] = useState(isImagePickerAvailable);

    // Reset form khi mở modal
    useEffect(() => {
        if (visible) {
            if (editData) {
                setName(editData.name);
                setBalanceText(editData.initialBalance.toString());
                setImageUri(editData.imageUri);
            } else {
                setName('');
                setBalanceText('');
                setImageUri(null);
            }
        }
    }, [visible, editData]);

    // ─── Image Picker ───────────────────────────────────────────────────────────

    const pickImage = useCallback(() => {
        if (!hasImagePicker) {
            Alert.alert(
                'Không khả dụng',
                'Cần rebuild app để dùng tính năng chọn ảnh.',
            );
            return;
        }

        try {
            const { launchImageLibrary } = require('react-native-image-picker');
            launchImageLibrary(
                {
                    mediaType: 'photo',
                    quality: 0.8,
                    maxWidth: 800,
                    maxHeight: 800,
                },
                (response: any) => {
                    if (response.didCancel || response.errorCode) {
                        return;
                    }
                    if (response.assets && response.assets.length > 0) {
                        setImageUri(response.assets[0].uri || null);
                    }
                },
            );
        } catch (err) {
            console.warn('[WalletModal] Image picker lỗi:', err);
        }
    }, [hasImagePicker]);

    // ─── Save ───────────────────────────────────────────────────────────────────

    const handleSave = useCallback(() => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên ví.');
            return;
        }

        const balance = parseInt(balanceText.replace(/\D/g, ''), 10) || 0;
        onSave(trimmedName, balance, imageUri);
        onClose();
    }, [name, balanceText, imageUri, onSave, onClose]);

    // ─── Delete ─────────────────────────────────────────────────────────────────

    const handleDelete = useCallback(() => {
        Alert.alert('Xóa ví', `Bạn có chắc muốn xóa ví "${name}"?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: () => {
                    onDelete?.();
                    onClose();
                },
            },
        ]);
    }, [name, onDelete, onClose]);

    // ─── Format balance input ──────────────────────────────────────────────────

    const handleBalanceChange = useCallback((text: string) => {
        // Chỉ giữ số
        const numbersOnly = text.replace(/\D/g, '');
        setBalanceText(numbersOnly);
    }, []);

    // Format hiển thị số dư
    const displayBalance = balanceText
        ? parseInt(balanceText, 10)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        : '';

    // ─── Render ─────────────────────────────────────────────────────────────────

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            statusBarTranslucent
            onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}>
                        <View
                            style={[
                                styles.modalContainer,
                                { paddingBottom: insets.bottom + 16 },
                            ]}>
                            <GlassCard
                                style={styles.modalCard}
                                backgroundOpacity={0.95}
                                borderOpacity={0.25}
                                borderRadius={28}>
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled">
                                    {/* Header */}
                                    <View style={styles.header}>
                                        <Text style={styles.headerTitle}>
                                            {isEdit ? '✏️ Sửa ví' : '✨ Tạo ví mới'}
                                        </Text>
                                        <Pressable onPress={onClose} style={styles.closeBtn}>
                                            <Text style={styles.closeBtnText}>✕</Text>
                                        </Pressable>
                                    </View>

                                    {/* Ảnh bìa */}
                                    <Pressable
                                        onPress={pickImage}
                                        style={styles.imagePickerArea}>
                                        {imageUri ? (
                                            <Image
                                                source={{ uri: imageUri }}
                                                style={styles.previewImage}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View style={styles.imagePlaceholder}>
                                                <Text style={styles.imagePlaceholderEmoji}>🖼️</Text>
                                                <Text style={styles.imagePlaceholderText}>
                                                    {hasImagePicker
                                                        ? 'Nhấn để chọn ảnh bìa'
                                                        : 'Chọn ảnh (cần rebuild app)'}
                                                </Text>
                                            </View>
                                        )}
                                    </Pressable>

                                    {/* Input tên ví */}
                                    <Text style={styles.label}>Tên ví</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="VD: Tiền mặt, Ngân hàng..."
                                        placeholderTextColor="rgba(255, 255, 255, 0.25)"
                                        value={name}
                                        onChangeText={setName}
                                        maxLength={50}
                                        returnKeyType="next"
                                    />

                                    {/* Input số dư ban đầu */}
                                    <Text style={styles.label}>Số dư ban đầu (₫)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        placeholderTextColor="rgba(255, 255, 255, 0.25)"
                                        value={displayBalance}
                                        onChangeText={handleBalanceChange}
                                        keyboardType="numeric"
                                        returnKeyType="done"
                                    />

                                    {/* Nút hành động */}
                                    <View style={styles.actions}>
                                        <GlassButton
                                            title={isEdit ? 'Cập nhật' : 'Tạo ví'}
                                            onPress={handleSave}
                                            style={styles.saveBtn}
                                        />

                                        {isEdit && onDelete && (
                                            <GlassButton
                                                title="Xóa ví"
                                                onPress={handleDelete}
                                                variant="outline"
                                                style={styles.deleteBtn}
                                            />
                                        )}
                                    </View>
                                </ScrollView>
                            </GlassCard>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        paddingHorizontal: 12,
    },
    modalCard: {
        backgroundColor: 'rgba(15, 5, 35, 0.95)',
        maxHeight: '85%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 16,
        fontWeight: '600',
    },
    imagePickerArea: {
        marginHorizontal: 20,
        marginTop: 12,
        height: 140,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderStyle: 'dashed',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
    },
    imagePlaceholderEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    imagePlaceholderText: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.35)',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.6)',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 8,
    },
    input: {
        marginHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    actions: {
        padding: 20,
        gap: 12,
    },
    saveBtn: {
        backgroundColor: 'rgba(74, 0, 224, 0.5)',
        borderColor: 'rgba(123, 47, 255, 0.6)',
    },
    deleteBtn: {
        borderColor: 'rgba(248, 113, 113, 0.4)',
    },
});

export default WalletModal;
