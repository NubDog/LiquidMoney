/**
 * TransactionModal.tsx — Modal tạo / sửa giao dịch
 * Rebuilt with react-native-reanimated 4 + react-native-gesture-handler
 *
 * Fixes:
 *  - First-open flicker: uses onLayout measurement + starts off-screen
 *  - Close jerk: internal shouldRender state delays unmount until exit animation completes
 *  - Premium UX: swipe-down-to-close gesture via PanGestureHandler
 *
 * No longer uses RN <Modal> — renders as absolute overlay instead.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
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
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import GlassCard from './GlassCard';
import TransactionFilterBar from './TransactionFilterBar';
import { BlurView } from '@react-native-community/blur';
import { Pencil, FilePlus2, X, Camera, ImagePlus, Trash2 } from 'lucide-react-native';

// ─── Constants ────────────────────────────────────────────────────────────────

const SCREEN_HEIGHT = Dimensions.get('window').height;

// Spring config for sheet slide-up (bouncy, premium feel)
const SPRING_CONFIG = {
    damping: 22,
    stiffness: 180,
    mass: 0.8,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
};

// Timing config for fade/close
const FADE_IN_DURATION = 250;
const FADE_OUT_DURATION = 200;
const SLIDE_OUT_DURATION = 280;

// Swipe-to-close thresholds
const SWIPE_CLOSE_THRESHOLD_RATIO = 0.3; // 30% of sheet height
const SWIPE_VELOCITY_THRESHOLD = 500;     // px/s

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

    // ─── Internal render state ──────────────────────────────────────────────
    // Controls actual mounting. We keep the component rendered during exit animation.
    const [shouldRender, setShouldRender] = useState(false);

    // ─── Reanimated shared values ───────────────────────────────────────────
    const overlayOpacity = useSharedValue(0);
    const sheetTranslateY = useSharedValue(SCREEN_HEIGHT);

    // Measured sheet height for accurate animation & swipe threshold
    const sheetHeight = useSharedValue(0);
    const hasMeasured = useSharedValue(false);

    // ─── Animate open ───────────────────────────────────────────────────────
    const animateOpen = useCallback(() => {
        overlayOpacity.value = withTiming(1, {
            duration: FADE_IN_DURATION,
            easing: Easing.out(Easing.cubic),
        });
        sheetTranslateY.value = withSpring(0, SPRING_CONFIG);
    }, [overlayOpacity, sheetTranslateY]);

    // ─── Animate close ──────────────────────────────────────────────────────
    const animateClose = useCallback(() => {
        'worklet';
        // Not a worklet itself, but the callbacks inside are driven by JS
    }, []);

    const handleAnimateClose = useCallback(() => {
        overlayOpacity.value = withTiming(0, {
            duration: FADE_OUT_DURATION,
            easing: Easing.in(Easing.cubic),
        });
        sheetTranslateY.value = withTiming(
            sheetHeight.value > 0 ? sheetHeight.value + 50 : SCREEN_HEIGHT,
            {
                duration: SLIDE_OUT_DURATION,
                easing: Easing.in(Easing.cubic),
            },
            (finished) => {
                if (finished) {
                    runOnJS(setShouldRender)(false);
                    runOnJS(onClose)();
                }
            },
        );
    }, [overlayOpacity, sheetTranslateY, sheetHeight, onClose]);

    // ─── Lifecycle: visible prop controls mount/animation ────────────────────
    useEffect(() => {
        if (visible) {
            // Reset animation values BEFORE rendering to prevent flicker
            overlayOpacity.value = 0;
            sheetTranslateY.value = SCREEN_HEIGHT;
            hasMeasured.value = false;
            setShouldRender(true);
        } else if (shouldRender) {
            // visible went false but we're still rendered → animate out
            handleAnimateClose();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    // ─── onLayout: measure actual sheet height, then animate in ─────────────
    const handleSheetLayout = useCallback((event: { nativeEvent: { layout: { height: number } } }) => {
        const measuredHeight = event.nativeEvent.layout.height;
        if (measuredHeight > 0 && !hasMeasured.value) {
            sheetHeight.value = measuredHeight;
            hasMeasured.value = true;
            // Now that we know the height, ensure sheet starts from below and animate in
            sheetTranslateY.value = measuredHeight + 50;
            // Small delay to ensure the layout is committed before animating
            requestAnimationFrame(() => {
                animateOpen();
            });
        }
    }, [sheetHeight, sheetTranslateY, hasMeasured, animateOpen]);

    // ─── Gesture: Swipe down to close ───────────────────────────────────────
    const panGesture = useMemo(() =>
        Gesture.Pan()
            .onUpdate((event) => {
                // Only allow dragging downward (positive translationY)
                if (event.translationY > 0) {
                    sheetTranslateY.value = event.translationY;
                    // Fade overlay as sheet is dragged down
                    const progress = Math.min(event.translationY / (sheetHeight.value || SCREEN_HEIGHT), 1);
                    overlayOpacity.value = 1 - progress;
                }
            })
            .onEnd((event) => {
                const threshold = (sheetHeight.value || SCREEN_HEIGHT) * SWIPE_CLOSE_THRESHOLD_RATIO;
                const shouldClose =
                    event.translationY > threshold ||
                    event.velocityY > SWIPE_VELOCITY_THRESHOLD;

                if (shouldClose) {
                    // Animate to fully closed
                    overlayOpacity.value = withTiming(0, {
                        duration: FADE_OUT_DURATION,
                        easing: Easing.in(Easing.cubic),
                    });
                    sheetTranslateY.value = withTiming(
                        sheetHeight.value > 0 ? sheetHeight.value + 50 : SCREEN_HEIGHT,
                        {
                            duration: SLIDE_OUT_DURATION,
                            easing: Easing.in(Easing.cubic),
                        },
                        (finished) => {
                            if (finished) {
                                runOnJS(setShouldRender)(false);
                                runOnJS(onClose)();
                            }
                        },
                    );
                } else {
                    // Snap back to open position
                    overlayOpacity.value = withTiming(1, { duration: 200 });
                    sheetTranslateY.value = withSpring(0, SPRING_CONFIG);
                }
            })
            .activeOffsetY(10) // Require 10px vertical movement before activating
            .failOffsetX([-20, 20]), // Fail if horizontal movement detected (allow scrolling)
        [sheetTranslateY, overlayOpacity, sheetHeight, onClose],
    );

    // ─── Animated Styles ────────────────────────────────────────────────────
    const overlayAnimatedStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
    }));

    const sheetAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: sheetTranslateY.value }],
    }));

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

    const handleClose = useCallback(() => {
        Keyboard.dismiss();
        handleAnimateClose();
    }, [handleAnimateClose]);

    const handleSave = useCallback(() => {
        const amount = parseInt(amountText.replace(/\D/g, ''), 10) || 0;
        if (amount <= 0) {
            Alert.alert('Lỗi', 'Vui lòng nhập số tiền lớn hơn 0.');
            return;
        }

        const type = indexToType(selectedIndex);
        onSave(type, amount, reason.trim() || null, imageUri);
        handleAnimateClose();
    }, [amountText, selectedIndex, reason, imageUri, onSave, handleAnimateClose]);

    const handleDelete = useCallback(() => {
        onDelete?.();
        handleAnimateClose();
    }, [onDelete, handleAnimateClose]);

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

    // Don't render anything if not needed
    if (!shouldRender) { return null; }

    const currentType = indexToType(selectedIndex);
    const accentColor =
        currentType === 'IN' ? 'rgba(74, 222, 128, 0.5)' : 'rgba(248, 113, 113, 0.5)';
    const accentBorder =
        currentType === 'IN' ? 'rgba(74, 222, 128, 0.6)' : 'rgba(248, 113, 113, 0.6)';

    return (
        <View style={styles.root} pointerEvents="box-none">
            {/* Animated backdrop overlay */}
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    styles.overlay,
                    overlayAnimatedStyle,
                ]}
            >
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={handleClose}
                />
            </Animated.View>

            {/* Sheet container */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                pointerEvents="box-none">
                <GestureDetector gesture={panGesture}>
                    <Animated.View
                        onLayout={handleSheetLayout}
                        style={[
                            styles.modalContainer,
                            { paddingBottom: insets.bottom + 16 },
                            sheetAnimatedStyle,
                        ]}>
                        {/* Drag handle */}
                        <View style={styles.dragHandleContainer}>
                            <View style={styles.dragHandle} />
                        </View>

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
                                        <TransactionFilterBar
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
                                        <Pressable
                                            onPress={handleSave}
                                            style={({ pressed }) => [
                                                styles.liquidBtn,
                                                { transform: [{ scale: pressed ? 0.95 : 1 }] },
                                            ]}>
                                            <View style={[StyleSheet.absoluteFill, styles.liquidBtnOverflow]}>
                                                {Platform.OS === 'ios' ? (
                                                    <BlurView
                                                        style={StyleSheet.absoluteFill}
                                                        blurType="dark"
                                                        blurAmount={20}
                                                        reducedTransparencyFallbackColor="#111"
                                                    />
                                                ) : null}
                                                <View
                                                    style={[
                                                        StyleSheet.absoluteFill,
                                                        { backgroundColor: accentColor },
                                                    ]}
                                                />
                                                {/* Ánh sáng phản chiếu mặt trên (Glass shine) */}
                                                <View style={styles.liquidBtnShine} />
                                            </View>
                                            <View style={[styles.liquidBtnBorder, { borderColor: accentBorder }]} />
                                            <Text style={styles.liquidBtnText}>
                                                {isEdit ? 'Cập nhật' : 'Thêm giao dịch'}
                                            </Text>
                                        </Pressable>

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
                </GestureDetector>
            </KeyboardAvoidingView>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999,
        elevation: 999,
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
    dragHandleContainer: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
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
    liquidBtn: {
        height: 54,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18,
        position: 'relative',
    },
    liquidBtnOverflow: {
        borderRadius: 18,
        overflow: 'hidden',
    },
    liquidBtnBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 18,
        borderWidth: 1.5,
    },
    liquidBtnShine: {
        position: 'absolute',
        top: 0,
        left: '15%',
        right: '15%',
        height: '40%',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderBottomLeftRadius: 100,
        borderBottomRightRadius: 100,
    },
    liquidBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
        zIndex: 2,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
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
