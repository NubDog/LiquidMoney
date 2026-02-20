/**
 * TransactionModal.tsx — Modal tạo / sửa giao dịch
 * Dùng RN core Modal + SegmentedControl cho toggle IN/OUT
 * Hỗ trợ gắn ảnh (camera / thư viện)
 * Animated overlay (fade in/out) + sheet (slide up/down)
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import SegmentedControl from './SegmentedControl';
import { Pencil, FilePlus2, X, Camera, ImagePlus, Trash2 } from 'lucide-react-native';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransactionModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (
        type: 'IN' | 'OUT',
        amount: number,
        reason?: string | null,
        imageUri?: string | null,
    ) => void;
    onDelete?: () => void;
    editData?: {
        type: 'IN' | 'OUT';
        amount: number;
        reason: string | null;
        image_uri: string | null;
    } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEGMENTS = ['Thu', 'Chi'];

function typeToIndex(type: 'IN' | 'OUT'): number {
    return type === 'IN' ? 0 : 1;
}

function indexToType(index: number): 'IN' | 'OUT' {
    return index === 0 ? 'IN' : 'OUT';
}

// ─── Component ────────────────────────────────────────────────────────────────

const TransactionModal: React.FC<TransactionModalProps> = ({
    visible,
    onClose,
    onSave,
    onDelete,
    editData,
}) => {
    const insets = useSafeAreaInsets();
    const isEdit = editData != null;

    // ─── Animation ──────────────────────────────────────────────────────────
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const sheetTranslateY = useRef(new Animated.Value(400)).current;

    useEffect(() => {
        if (visible) {
            overlayOpacity.setValue(0);
            sheetTranslateY.setValue(400);
            Animated.parallel([
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(sheetTranslateY, {
                    toValue: 0,
                    friction: 10,
                    tension: 65,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, overlayOpacity, sheetTranslateY]);

    const handleClose = useCallback(() => {
        Animated.parallel([
            Animated.timing(overlayOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(sheetTranslateY, {
                toValue: 400,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => onClose());
    }, [overlayOpacity, sheetTranslateY, onClose]);

    // ─── Form State ─────────────────────────────────────────────────────────
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [amountText, setAmountText] = useState('');
    const [reason, setReason] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            if (editData) {
                setSelectedIndex(typeToIndex(editData.type));
                setAmountText(editData.amount.toString());
                setReason(editData.reason || '');
                setImageUri(editData.image_uri || null);
            } else {
                setSelectedIndex(0);
                setAmountText('');
                setReason('');
                setImageUri(null);
            }
        }
    }, [visible, editData]);

    // ─── Handlers ───────────────────────────────────────────────────────────

    const handleAmountChange = useCallback((text: string) => {
        const numbersOnly = text.replace(/\D/g, '');
        setAmountText(numbersOnly);
    }, []);

    const displayAmount = amountText
        ? parseInt(amountText, 10)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        : '';

    const handleSave = useCallback(() => {
        const amount = parseInt(amountText.replace(/\D/g, ''), 10) || 0;
        if (amount <= 0) {
            Alert.alert('Lỗi', 'Vui lòng nhập số tiền lớn hơn 0.');
            return;
        }

        const type = indexToType(selectedIndex);
        onSave(type, amount, reason.trim() || null, imageUri);
        handleClose();
    }, [amountText, selectedIndex, reason, imageUri, onSave, handleClose]);

    const handleDelete = useCallback(() => {
        onDelete?.();
        handleClose();
    }, [onDelete, handleClose]);

    // ─── Image Picker ───────────────────────────────────────────────────────

    const handlePickFromGallery = useCallback(() => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 1200,
                maxHeight: 1200,
            },
            response => {
                if (!response.didCancel && response.assets?.[0]?.uri) {
                    setImageUri(response.assets[0].uri);
                }
            },
        );
    }, []);

    const handlePickFromCamera = useCallback(() => {
        launchCamera(
            {
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 1200,
                maxHeight: 1200,
                cameraType: 'back',
            },
            response => {
                if (!response.didCancel && response.assets?.[0]?.uri) {
                    setImageUri(response.assets[0].uri);
                }
            },
        );
    }, []);

    const handleRemoveImage = useCallback(() => {
        setImageUri(null);
    }, []);

    // ─── Render ─────────────────────────────────────────────────────────────

    const currentType = indexToType(selectedIndex);
    const accentColor =
        currentType === 'IN' ? 'rgba(74, 222, 128, 0.5)' : 'rgba(248, 113, 113, 0.5)';
    const accentBorder =
        currentType === 'IN' ? 'rgba(74, 222, 128, 0.6)' : 'rgba(248, 113, 113, 0.6)';

    return (
        <Modal
            visible={visible}
            animationType="none"
            transparent
            statusBarTranslucent
            onRequestClose={handleClose}>
            <View style={styles.root}>
                {/* Animated overlay */}
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        styles.overlay,
                        { opacity: overlayOpacity },
                    ]}
                />
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => {
                        Keyboard.dismiss();
                        handleClose();
                    }}
                />

                {/* Sheet */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                    pointerEvents="box-none">
                    <Animated.View
                        style={[
                            styles.modalContainer,
                            { paddingBottom: insets.bottom + 16 },
                            { transform: [{ translateY: sheetTranslateY }] },
                        ]}>
                        <Pressable onPress={Keyboard.dismiss}>
                            <GlassCard
                                style={styles.modalCard}
                                backgroundOpacity={0.95}
                                borderOpacity={0.2}
                                borderRadius={28}>
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled">
                                    {/* Header */}
                                    <View style={styles.header}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            {isEdit ? (
                                                <Pencil size={20} color="#22d3ee" strokeWidth={2} />
                                            ) : (
                                                <FilePlus2 size={20} color="#22d3ee" strokeWidth={2} />
                                            )}
                                            <Text style={styles.headerTitle}>
                                                {isEdit
                                                    ? 'Sửa giao dịch'
                                                    : 'Giao dịch mới'}
                                            </Text>
                                        </View>
                                        <Pressable
                                            onPress={handleClose}
                                            style={styles.closeBtn}>
                                            <X size={18} color="rgba(255,255,255,0.5)" strokeWidth={2} />
                                        </Pressable>
                                    </View>

                                    {/* Toggle IN / OUT */}
                                    <View style={styles.segmentWrapper}>
                                        <SegmentedControl
                                            segments={SEGMENTS}
                                            selectedIndex={selectedIndex}
                                            onChange={setSelectedIndex}
                                        />
                                    </View>

                                    {/* Số tiền */}
                                    <Text style={styles.label}>
                                        Số tiền (₫)
                                    </Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            styles.amountInput,
                                        ]}
                                        placeholder="0"
                                        placeholderTextColor="rgba(255, 255, 255, 0.25)"
                                        value={displayAmount}
                                        onChangeText={handleAmountChange}
                                        keyboardType="numeric"
                                        returnKeyType="next"
                                    />

                                    {/* Lý do */}
                                    <Text style={styles.label}>Lý do</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            styles.reasonInput,
                                        ]}
                                        placeholder="VD: Ăn trưa, Lương tháng..."
                                        placeholderTextColor="rgba(255, 255, 255, 0.25)"
                                        value={reason}
                                        onChangeText={setReason}
                                        maxLength={200}
                                        multiline
                                        numberOfLines={3}
                                        returnKeyType="done"
                                    />

                                    {/* Hình ảnh */}
                                    <Text style={styles.label}>Hình ảnh</Text>
                                    {imageUri ? (
                                        <View style={styles.imagePreviewContainer}>
                                            <Image
                                                source={{ uri: imageUri }}
                                                style={styles.imagePreview}
                                                resizeMode="cover"
                                            />
                                            <Pressable
                                                onPress={handleRemoveImage}
                                                style={styles.removeImageBtn}>
                                                <X size={14} color="#fff" strokeWidth={2.5} />
                                            </Pressable>
                                        </View>
                                    ) : (
                                        <View style={styles.imagePickerRow}>
                                            <Pressable
                                                onPress={handlePickFromCamera}
                                                style={styles.imagePickerBtn}>
                                                <Camera size={20} color="#22d3ee" strokeWidth={2} />
                                                <Text style={styles.imagePickerText}>Chụp ảnh</Text>
                                            </Pressable>
                                            <Pressable
                                                onPress={handlePickFromGallery}
                                                style={styles.imagePickerBtn}>
                                                <ImagePlus size={20} color="#c084fc" strokeWidth={2} />
                                                <Text style={styles.imagePickerText}>Thư viện</Text>
                                            </Pressable>
                                        </View>
                                    )}

                                    {/* Nút hành động */}
                                    <View style={styles.actions}>
                                        <GlassButton
                                            title={
                                                isEdit ? 'Cập nhật' : 'Thêm giao dịch'
                                            }
                                            onPress={handleSave}
                                            style={{
                                                backgroundColor: accentColor,
                                                borderColor: accentBorder,
                                            }}
                                        />

                                        {isEdit && onDelete && (
                                            <Pressable
                                                onPress={handleDelete}
                                                style={({ pressed }) => [
                                                    styles.deleteBtn,
                                                    pressed && { opacity: 0.7 },
                                                ]}>
                                                <Trash2 size={16} color="#f87171" strokeWidth={2} />
                                                <Text style={styles.deleteBtnText}>
                                                    Xóa giao dịch
                                                </Text>
                                            </Pressable>
                                        )}
                                    </View>
                                </ScrollView>
                            </GlassCard>
                        </Pressable>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        paddingHorizontal: 12,
    },
    modalCard: {
        backgroundColor: 'rgba(18, 18, 22, 0.97)',
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
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    segmentWrapper: {
        paddingHorizontal: 20,
        marginTop: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 8,
    },
    input: {
        marginHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    amountInput: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
    reasonInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },

    // ── Image Picker ──
    imagePickerRow: {
        flexDirection: 'row',
        gap: 12,
        marginHorizontal: 20,
    },
    imagePickerBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    imagePickerText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
    },
    imagePreviewContainer: {
        marginHorizontal: 20,
        borderRadius: 14,
        overflow: 'hidden',
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: 180,
        borderRadius: 14,
    },
    removeImageBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Actions ──
    actions: {
        padding: 20,
        gap: 12,
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    deleteBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#f87171',
    },
});

export default TransactionModal;
