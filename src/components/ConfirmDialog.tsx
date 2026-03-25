/**
 * ConfirmDialog.tsx — Custom glassmorphism confirmation dialog
 * Refactored to use Volumetric Liquid Glass (LiquidCard)
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
import { Colors, FontSizes, Radii, Spacing } from '../common/theme';
import LiquidCard from './LiquidCard';
import LiquidButton from './LiquidButton';
import AnimatedOverlay from './AnimatedOverlay';

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
                <AnimatedOverlay visible={visible} onPress={handleCancel} />

                <Animated.View style={[styles.dialogContainer, { transform: [{ scale }] }]}>
                    <LiquidCard 
                        style={styles.dialog}
                        intensity="light"
                        
                        borderRadius={Radii.xxl}
                    >
                        {/* Icon */}
                        <View style={styles.iconContainer}>
                            <AlertTriangle size={36} color={Colors.danger} strokeWidth={2.5} />
                        </View>

                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>

                        <View style={styles.actions}>
                            <LiquidButton
                                variant="outline"
                                style={{ flex: 1 }}
                                onPress={handleCancel}>
                                <Text style={styles.cancelText}>{cancelText}</Text>
                            </LiquidButton>

                            <LiquidButton
                                variant="filled"
                                style={{ flex: 1 }} // Note: LiquidButton doesn't support backgroundColor injection simply without style merging on root container. We just rely on standard glass for consistency.
                                onPress={handleConfirm}>
                                <Text style={[styles.confirmText, { color: confirmColor }]}>{confirmText}</Text>
                            </LiquidButton>
                        </View>
                    </LiquidCard>
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
    dialogContainer: {
        width: '100%',
        maxWidth: 320,
    },
    dialog: {
        padding: Spacing.xxl - 4,
        alignItems: 'center',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    title: {
        fontSize: FontSizes.lg + 2,
        fontWeight: '700',
        color: '#FFFFFF', // High contrast
        textAlign: 'center',
        marginBottom: Spacing.sm,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    message: {
        fontSize: FontSizes.md,
        color: 'rgba(255, 255, 255, 0.8)', // High contrast
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
        borderColor: 'rgba(255, 255, 255, 0.2)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
    },
    cancelText: {
        fontSize: FontSizes.lg - 2,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: Radii.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    confirmText: {
        fontSize: FontSizes.lg - 2,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default ConfirmDialog;
