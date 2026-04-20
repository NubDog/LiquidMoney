import React, { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, View, Text, Pressable, KeyboardAvoidingView, Platform, Animated, Easing } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { X } from 'lucide-react-native';

import BackgroundLiquidGlass from './BackgroundLiquidGlass';
import LiquidButton2 from './LiquidButton2';
import IconButton from './IconButton';
import { FontSizes, Spacing, Radii } from '../common/theme';

export interface ConfirmDialog2Props {
    visible: boolean;
    title: string;
    message: string;
    onCancel: () => void;
    onConfirm: () => void;
    cancelText?: string;
    confirmText?: string;
    isDestructive?: boolean;
}

const ConfirmDialog2: React.FC<ConfirmDialog2Props> = ({
    visible,
    title,
    message,
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
                        
                        {/* Header Row */}
                        <View style={styles.headerRow}>
                            <Text style={styles.title}>{title}</Text>
                            <IconButton 
                                icon={<X size={20} color="#FFFFFF" opacity={0.8} strokeWidth={2.5} />} 
                                size={36}
                                onPress={onCancel}
                                disableBlur
                            />
                        </View>

                        {/* Content Message */}
                        <Text style={styles.message}>{message}</Text>

                        {/* Actions Row */}
                        <View style={styles.actionsRow}>
                            <LiquidButton2 
                                title={cancelText} 
                                onPress={onCancel} 
                                style={styles.btn} 
                                disableBlur
                            />
                            <LiquidButton2 
                                title={confirmText} 
                                onPress={onConfirm} 
                                style={[styles.btn, isDestructive && styles.destructiveBtn]} 
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
        width: '90%',
        maxWidth: 400,
    },
    card: {
        padding: Spacing.xl,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    title: {
        color: '#FFFFFF',
        fontSize: FontSizes.xl,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    message: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: FontSizes.md,
        lineHeight: 24,
        marginBottom: Spacing.xl,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    btn: {
        flex: 1,
        width: 'auto' as any, // Prevent BackgroundLiquidGlass from stretching 100% over the sibling
    },
    destructiveBtn: {
        // TBD: Custom red glow for destructive actions using an external prop/style in the future
    }
});

export default ConfirmDialog2;
