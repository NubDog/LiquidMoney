import React from 'react';
import { Modal, StyleSheet, View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
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
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}>
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Backdrop Layer */}
                <View style={[StyleSheet.absoluteFill, { zIndex: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)' }]} />

                {/* Pressable Backdrop to dismiss the dialog */}
                <Pressable style={styles.backdropPressable} onPress={onCancel} />

                {/* Main Dialog UI */}
                <View style={styles.contentWrapper}>
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
                </View>
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
