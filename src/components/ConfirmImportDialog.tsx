/**
 * ConfirmImportDialog.tsx — Confirmation dialog for data import
 * Extracted from SettingsScreen.tsx (lines 213-349).
 * Uses shared animation helpers.
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface ConfirmImportDialogProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ConfirmImportDialog: React.FC<ConfirmImportDialogProps> = ({
    visible,
    onCancel,
    onConfirm,
}) => {
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const cardScale = useRef(new Animated.Value(0.85)).current;

    React.useEffect(() => {
        if (visible) {
            animateDialogOpen(overlayOpacity, cardScale);
        }
    }, [visible, overlayOpacity, cardScale]);

    const animateClose = useCallback(
        (callback: () => void) => {
            animateDialogClose(overlayOpacity, cardScale, callback);
        },
        [overlayOpacity, cardScale],
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onCancel}>
            <View style={styles.root}>
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        styles.overlay,
                        { opacity: overlayOpacity },
                    ]}
                />
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={onCancel}
                />
                <Animated.View
                    style={[
                        styles.card,
                        { transform: [{ scale: cardScale }] },
                    ]}>
                    <View style={styles.iconContainer}>
                        <AlertTriangle size={40} color={Colors.warning} strokeWidth={2} />
                    </View>

                    <Text style={styles.title}>Nhập dữ liệu</Text>
                    <Text style={styles.message}>
                        Dữ liệu hiện tại sẽ bị GHI ĐÈ bởi dữ liệu trong file backup. Bạn có chắc chắn muốn tiếp tục?
                    </Text>

                    <View style={styles.actions}>
                        <Pressable
                            onPress={() => animateClose(onCancel)}
                            style={({ pressed }) => [
                                styles.cancelBtn,
                                pressed && { opacity: 0.7 },
                            ]}>
                            <Text style={styles.cancelText}>Hủy</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => animateClose(onConfirm)}
                            style={({ pressed }) => [
                                styles.confirmBtn,
                                pressed && { opacity: 0.7 },
                            ]}>
                            <Text style={styles.confirmText}>Nhập</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        backgroundColor: Colors.overlayHeavy,
    },
    card: {
        width: '82%',
        maxWidth: 340,
        backgroundColor: Colors.dialogBg,
        borderRadius: Radii.xxl,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        padding: Spacing.xxl - 4,
        alignItems: 'center',
        ...Shadows.card,
    },
    iconContainer: {
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: FontSizes.lg + 2,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: Spacing.sm + 2,
        textAlign: 'center',
    },
    message: {
        fontSize: FontSizes.md - 1,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: Spacing.xl,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: Radii.md,
        alignItems: 'center',
        backgroundColor: Colors.cardHeavy,
        borderWidth: 1,
        borderColor: Colors.handleBar,
    },
    cancelText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.6)',
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: Radii.md,
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.35)',
    },
    confirmText: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: Colors.expense,
    },
});

export default ConfirmImportDialog;
