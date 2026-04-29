import React, { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, View, Text, Pressable, KeyboardAvoidingView, Platform, Animated, Easing } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { AlertTriangle } from 'lucide-react-native';

import AppleButton from '../ui/AppleButton';
import { FontSizes, Spacing, Radii, Colors } from '../../common/theme';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export interface ConfirmDialog2Props {
    visible: boolean;
    title?: string;
    message?: string;
    onCancel: () => void;
    onConfirm: () => void;
    cancelText?: string;
    confirmText?: string;
    isDestructive?: boolean;
}

const ConfirmDialog2: React.FC<ConfirmDialog2Props> = ({
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
    const animValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            setIsRendered(true);
            Animated.timing(animValue, {
                toValue: 1,
                duration: 250,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(animValue, {
                toValue: 0,
                duration: 200,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }).start(() => {
                setIsRendered(false);
                animValue.setValue(0); // reset for next open
            });
        }
    }, [visible, animValue]);

    const opacity = animValue;
    const scale = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1.15, 1],
    });

    if (!isRendered && !visible) return null;

    return (
        <Modal
            visible={isRendered}
            transparent
            statusBarTranslucent // Quan trọng: Đảm bảo phủ mờ cả thanh trạng thái (status bar)
            animationType="none"
            onRequestClose={onCancel}>
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Backdrop Layer - Đen tuyền mờ mờ ảo ảo (Dark Frosted Glass) */}
                <AnimatedBlurView
                    style={[StyleSheet.absoluteFill, { zIndex: 0, opacity }]}
                    blurType="dark"
                    blurAmount={15}
                    reducedTransparencyFallbackColor="rgba(0,0,0,0.85)"
                />
                {/* Lớp màu đen nhẹ kết hợp với blur tạo ra độ mờ ảo, không bị đen thui */}
                <Animated.View 
                    style={[StyleSheet.absoluteFill, { zIndex: 0, backgroundColor: 'rgba(0, 0, 0, 0.45)', opacity }]} 
                    pointerEvents="none" 
                />

                {/* Pressable Backdrop để đóng dialog khi nhấn ra ngoài */}
                <Pressable style={styles.backdropPressable} onPress={onCancel} />

                {/* Main Dialog UI */}
                <Animated.View style={[styles.contentWrapper, { opacity, transform: [{ scale }] }]} pointerEvents="box-none">
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
            </KeyboardAvoidingView>
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

export default ConfirmDialog2;
