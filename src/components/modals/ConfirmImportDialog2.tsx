import React, { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, View, Text, Pressable, KeyboardAvoidingView, Platform, Animated, Easing } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

import BackgroundLiquidGlass from '../layout/BackgroundLiquidGlass';
import LiquidButton2 from '../buttons/LiquidButton2';
import { FontSizes, Spacing, Radii, Colors } from '../../common/theme';

export interface ConfirmImportDialog2Props {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

const ConfirmImportDialog2: React.FC<ConfirmImportDialog2Props> = ({
    visible,
    onCancel,
    onConfirm,
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
            animationType="none"
            onRequestClose={onCancel}>
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Backdrop Layer */}
                <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', opacity }]} />

                {/* Pressable Backdrop to dismiss the dialog */}
                <Pressable style={styles.backdropPressable} onPress={onCancel} />

                {/* Main Dialog UI */}
                <Animated.View style={[styles.contentWrapper, { opacity, transform: [{ scale }] }]}>
                    <BackgroundLiquidGlass borderRadius={Radii.xxl} contentContainerStyle={styles.card}>
                        
                        {/* Icon */}
                        <View style={styles.iconContainer}>
                            <AlertTriangle size={36} color={Colors.warning} strokeWidth={2.5} />
                        </View>

                        {/* Title & Message */}
                        <Text style={styles.title}>Nhập dữ liệu</Text>
                        <Text style={styles.message}>
                            Dữ liệu hiện tại sẽ bị GHI ĐÈ bởi dữ liệu trong file backup. Bạn có chắc chắn muốn tiếp tục?
                        </Text>

                        {/* Actions Row */}
                        <View style={styles.actionsRow}>
                            <LiquidButton2 
                                title="Hủy" 
                                onPress={onCancel} 
                                style={styles.btn} 
                                disableBlur
                            />
                            <LiquidButton2 
                                title="Nhập" 
                                onPress={onConfirm} 
                                style={[styles.btn, styles.destructiveBtn]} 
                                disableBlur
                            />
                        </View>

                    </BackgroundLiquidGlass>
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
        padding: Spacing.xl,
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
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: Spacing.sm,
        textAlign: 'center',
        letterSpacing: -0.3,
    },
    message: {
        fontSize: FontSizes.md,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.xl,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        width: '100%',
    },
    btn: {
        flex: 1,
    },
    destructiveBtn: {
        // Red hue applied dynamically via LiquidButton2's isDestructive prop now
    },
});

export default ConfirmImportDialog2;
