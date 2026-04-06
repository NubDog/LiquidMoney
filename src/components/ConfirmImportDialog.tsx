/**
 * ConfirmImportDialog.tsx — Confirmation dialog for data import
 * Refactored to Volumetric Liquid Glass (LiquidCard)
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
import LiquidButton2 from './LiquidButton2';

interface ConfirmImportDialogProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

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
                <Animated.View style={[styles.cardContainer, { transform: [{ scale: cardScale }] }]}>
                    <LiquidCard 
                        style={styles.card}
                        intensity="light"
                        
                        borderRadius={Radii.xxl}
                    >
                        <View style={styles.iconContainer}>
                            <AlertTriangle size={40} color={Colors.warning} strokeWidth={2.5} />
                        </View>

                        <Text style={styles.title}>Nhập dữ liệu</Text>
                        <Text style={styles.message}>
                            Dữ liệu hiện tại sẽ bị GHI ĐÈ bởi dữ liệu trong file backup. Bạn có chắc chắn muốn tiếp tục?
                        </Text>

                        <View style={styles.actions}>
                            <View style={{ flex: 1 }}>
                                <LiquidButton2 
                                    title="Hủy"
                                    onPress={() => animateClose(onCancel)}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <LiquidButton2 
                                    title="Nhập"
                                    onPress={() => animateClose(onConfirm)}
                                />
                            </View>
                        </View>
                    </LiquidCard>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        backgroundColor: Colors.overlayHeavy,
    },
    cardContainer: {
        width: '82%',
        maxWidth: 340,
    },
    card: {
        padding: Spacing.xxl - 4,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: Spacing.md,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(250, 204, 21, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(250, 204, 21, 0.3)',
    },
    title: {
        fontSize: FontSizes.lg + 2,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: Spacing.sm + 2,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    message: {
        fontSize: FontSizes.md - 1,
        color: 'rgba(255, 255, 255, 0.8)',
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
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    cancelText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: '#FFFFFF',
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
        color: '#FFFFFF',
    },
});

export default ConfirmImportDialog;
