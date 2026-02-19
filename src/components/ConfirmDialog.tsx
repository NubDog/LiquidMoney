/**
 * ConfirmDialog.tsx — Hộp thoại xác nhận tùy chỉnh, kiểu glassmorphism
 * Thay thế Alert.alert() mặc định của Android cho giao diện đẹp hơn
 */

import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

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
    confirmColor = '#f87171',
    onCancel,
    onConfirm,
}) => {
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.85)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 8,
                    tension: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(contentOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            overlayOpacity.setValue(0);
            scale.setValue(0.85);
            contentOpacity.setValue(0);
        }
    }, [visible, overlayOpacity, scale, contentOpacity]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onCancel}>
            <View style={styles.wrapper}>
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
                    onPress={onCancel}
                />

                {/* Dialog content */}
                <Animated.View
                    style={[
                        styles.dialog,
                        {
                            opacity: contentOpacity,
                            transform: [{ scale }],
                        },
                    ]}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <AlertTriangle size={36} color="#ef4444" strokeWidth={2} />
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.actions}>
                        {/* Cancel */}
                        <Pressable
                            style={styles.cancelBtn}
                            onPress={onCancel}>
                            <Text style={styles.cancelText}>
                                {cancelText}
                            </Text>
                        </Pressable>

                        {/* Confirm */}
                        <Pressable
                            style={[
                                styles.confirmBtn,
                                { backgroundColor: confirmColor },
                            ]}
                            onPress={onConfirm}>
                            <Text style={styles.confirmText}>
                                {confirmText}
                            </Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    dialog: {
        width: '100%',
        maxWidth: 320,
        backgroundColor: 'rgba(32, 32, 36, 0.98)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        padding: 28,
        alignItems: 'center',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(248, 113, 113, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    iconText: {
        fontSize: 28,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.55)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    confirmText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default ConfirmDialog;
