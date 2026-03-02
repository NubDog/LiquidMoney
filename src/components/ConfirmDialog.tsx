/**
 * ConfirmDialog.tsx — Custom glassmorphism confirmation dialog
 * Replaces default Android Alert.alert() with better styling
 *
 * Refactored: Uses shared animation helpers and theme tokens.
 * Removed dead `iconText` style.
 */

import React, { useCallback, useRef } from 'react';
import {
    Animated,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { animateDialogOpen, animateDialogClose } from '../common/animations';
import { Colors, FontSizes, Radii, Shadows, Spacing } from '../common/theme';

interface ConfirmDialogProps {
    visible: boolean;
    title: string;
    message: string;
    cancelText?: string;
    confirmText?: string;
    confirmColor?: string;
    onCancel: () => void;
    onConfirm: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    visible,
    title,
    message,
    cancelText = 'Hủy',
    confirmText = 'Xóa',
    confirmColor = Colors.expense,
    onCancel,
    onConfirm,
}) => {
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.85)).current;

    React.useEffect(() => {
        if (visible) {
            animateDialogOpen(overlayOpacity, scale);
        }
    }, [visible, overlayOpacity, scale]);

    const handleCancel = useCallback(() => {
        animateDialogClose(overlayOpacity, scale, onCancel);
    }, [overlayOpacity, scale, onCancel]);

    const handleConfirm = useCallback(() => {
        animateDialogClose(overlayOpacity, scale, onConfirm);
    }, [overlayOpacity, scale, onConfirm]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleCancel}>
            <View style={styles.wrapper}>
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        styles.overlay,
                        { opacity: overlayOpacity },
                    ]}
                />
                <Pressable style={StyleSheet.absoluteFill} onPress={handleCancel} />

                <Animated.View
                    style={[
                        styles.dialog,
                        { transform: [{ scale }] },
                    ]}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <AlertTriangle size={36} color={Colors.danger} strokeWidth={2} />
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.actions}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.cancelBtn,
                                pressed && { opacity: 0.7 },
                            ]}
                            onPress={handleCancel}>
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [
                                styles.confirmBtn,
                                { backgroundColor: confirmColor },
                                pressed && { opacity: 0.7 },
                            ]}
                            onPress={handleConfirm}>
                            <Text style={styles.confirmText}>{confirmText}</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    overlay: {
        backgroundColor: Colors.overlayHeavy,
    },
    dialog: {
        width: '100%',
        maxWidth: 320,
        backgroundColor: Colors.dialogBg,
        borderRadius: Radii.xxl,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        padding: Spacing.xxl - 4,
        alignItems: 'center',
        ...Shadows.card,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.expenseBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: FontSizes.lg + 2,
        fontWeight: '700',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    message: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.xxl - 4,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: Radii.md,
        borderWidth: 1,
        borderColor: Colors.handleBar,
        backgroundColor: Colors.card,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: FontSizes.lg - 2,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: Radii.md,
        alignItems: 'center',
    },
    confirmText: {
        fontSize: FontSizes.lg - 2,
        fontWeight: '700',
        color: Colors.text,
    },
});

export default ConfirmDialog;
