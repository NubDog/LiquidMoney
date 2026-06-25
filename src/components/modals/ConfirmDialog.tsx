import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS, interpolate, useAnimatedKeyboard } from 'react-native-reanimated';
import { BlurView } from '@react-native-community/blur';
import { AlertTriangle } from 'lucide-react-native';

import AppleButton from '../ui/AppleButton';
import { FontSizes, Spacing, Radii, Colors } from '../../common/theme';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export interface ConfirmDialogProps {
    visible: boolean;
    title?: string;
    message?: string;
    onCancel: () => void;
    onConfirm: () => void;
    cancelText?: string;
    confirmText?: string;
    isDestructive?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    visible,
    title = 'Xác nhận',
    message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
    onCancel,
    onConfirm,
    cancelText = 'Hủy',
    confirmText = 'Xác nhận',
    isDestructive = false,
}) => {
    const [isRendered, setIsRendered] = useState(visible);
    const animValue = useSharedValue(0);

    const finishClose = () => {
        setIsRendered(false);
        animValue.value = 0; // reset for next open
    };

    useEffect(() => {
        if (visible) {
            setIsRendered(true);
            animValue.value = withTiming(1, {
                duration: 400,
                easing: Easing.out(Easing.cubic),
            });
        } else {
            animValue.value = withTiming(0, {
                duration: 400,
                easing: Easing.in(Easing.cubic),
            }, (finished) => {
                if (finished) {
                    runOnJS(finishClose)();
                }
            });
        }
    }, [visible, animValue]);

    const keyboard = useAnimatedKeyboard({ isStatusBarTranslucentAndroid: true });

    const animatedOpacityStyle = useAnimatedStyle(() => ({
        opacity: animValue.value,
    }));

    const animatedContentStyle = useAnimatedStyle(() => ({
        opacity: animValue.value,
        transform: [
            { scale: interpolate(animValue.value, [0, 1], [1.15, 1]) },
            { translateY: -keyboard.height.value / 2 }
        ],
    }));

    if (!isRendered && !visible) return null;

    return (
        <Modal
            visible={isRendered}
            transparent
            statusBarTranslucent // Quan trọng: Đảm bảo phủ mờ cả thanh trạng thái (status bar)
            animationType="none"
            onRequestClose={onCancel}>
            <View style={styles.container}>
                {/* Backdrop Layer - Đen tuyền mờ mờ ảo ảo (Dark Frosted Glass) */}
                <AnimatedBlurView
                    style={[StyleSheet.absoluteFill, { zIndex: 0 }, animatedOpacityStyle]}
                    blurType="dark"
                    blurAmount={15}
                />
                {/* Lớp màu đen nhẹ kết hợp với blur tạo ra độ mờ ảo, không bị đen thui */}
                <Animated.View 
                    style={[StyleSheet.absoluteFill, { zIndex: 0, backgroundColor: 'rgba(0, 0, 0, 0.45)' }, animatedOpacityStyle]} 
                    pointerEvents="none" 
                />

                {/* Pressable Backdrop để đóng dialog khi nhấn ra ngoài */}
                <Pressable style={styles.backdropPressable} onPress={onCancel} />

                {/* Main Dialog UI */}
                <Animated.View style={[styles.contentWrapper, animatedContentStyle]} pointerEvents="box-none">
                    <View style={styles.card}>
                        
                        {/* Icon */}
                        <View style={styles.iconContainer}>
                            <AlertTriangle size={36} color={isDestructive ? Colors.danger : Colors.warning} strokeWidth={2.5} />
                        </View>

                        {/* Title & Message */}
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>

                        {/* Actions Row */}
                        <View style={styles.actionsRow}>
                            <AppleButton 
                                title={cancelText} 
                                onPress={onCancel} 
                                variant="secondary"
                                style={styles.btn} 
                            />
                            <View style={{ width: Spacing.sm }} />
                            <AppleButton 
                                title={confirmText} 
                                onPress={onConfirm} 
                                variant={isDestructive ? 'danger' : 'primary'}
                                style={styles.btn} 
                            />
                        </View>

                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdropPressable: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    contentWrapper: {
        zIndex: 2,
        width: '85%',
        maxWidth: 360,
    },
    card: {
        backgroundColor: '#1C1C1E', // iOS Dark Mode Elevated
        borderRadius: 24,
        padding: Spacing.xl,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    iconContainer: {
        marginBottom: Spacing.md,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: Spacing.sm,
        textAlign: 'center',
        letterSpacing: -0.3,
    },
    message: {
        fontSize: FontSizes.md,
        color: 'rgba(235, 235, 245, 0.6)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.xl,
    },
    actionsRow: {
        flexDirection: 'row',
        width: '100%',
    },
    btn: {
        flex: 1,
    },
});

export default ConfirmDialog;
