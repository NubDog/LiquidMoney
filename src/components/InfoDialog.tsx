/**
 * InfoDialog.tsx — Info/success/error dialog component
 * Extracted from SettingsScreen.tsx (lines 53-203).
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
import { CheckCircle, AlertTriangle } from 'lucide-react-native';
import { animateDialogOpen, animateDialogClose } from '../common/animations';
import { Colors, FontSizes, Radii, Shadows, Spacing } from '../common/theme';

// ─── Props ────────────────────────────────────────────────────────────────────

interface InfoDialogProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type: 'success' | 'error';
}

// ─── Component ────────────────────────────────────────────────────────────────

const InfoDialog: React.FC<InfoDialogProps> = ({
    visible,
    onClose,
    title,
    message,
    type,
}) => {
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const cardScale = useRef(new Animated.Value(0.85)).current;

    React.useEffect(() => {
        if (visible) {
            animateDialogOpen(overlayOpacity, cardScale);
        }
    }, [visible, overlayOpacity, cardScale]);

    const handleClose = useCallback(() => {
        animateDialogClose(overlayOpacity, cardScale, onClose);
    }, [overlayOpacity, cardScale, onClose]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}>
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
                    onPress={handleClose}
                />
                <Animated.View
                    style={[
                        styles.card,
                        { transform: [{ scale: cardScale }] },
                    ]}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        {type === 'success' ? (
                            <CheckCircle size={40} color={Colors.income} strokeWidth={2} />
                        ) : (
                            <AlertTriangle size={40} color={Colors.expense} strokeWidth={2} />
                        )}
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    {/* OK Button */}
                    <Pressable
                        onPress={handleClose}
                        style={({ pressed }) => [
                            styles.okBtn,
                            pressed && { opacity: 0.7 },
                        ]}>
                        <Text style={styles.okBtnText}>OK</Text>
                    </Pressable>
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
    okBtn: {
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: Radii.md,
        backgroundColor: 'rgba(34, 211, 238, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.35)',
    },
    okBtnText: {
        fontSize: FontSizes.lg - 2,
        fontWeight: '700',
        color: Colors.cyan,
    },
});

export default InfoDialog;
