/**
 * InfoDialog.tsx — Info/success/error dialog component
 * Refactored to Volumetric Liquid Glass
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
import { animateDialogOpen, animateDialogClose } from '../../common/animations';
import { BlurView } from '@react-native-community/blur';
import { Colors, FontSizes, Spacing } from '../../common/theme';
import AppleButton from '../ui/AppleButton';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

interface InfoDialogProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type: 'success' | 'error';
}

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
                {/* Backdrop Layer */}
                <AnimatedBlurView
                    style={[StyleSheet.absoluteFill, { zIndex: 0, opacity: overlayOpacity }]}
                    blurType="dark"
                    blurAmount={15}
                    reducedTransparencyFallbackColor="rgba(0,0,0,0.85)"
                />
                <Animated.View 
                    style={[StyleSheet.absoluteFill, { zIndex: 0, backgroundColor: 'rgba(0, 0, 0, 0.45)', opacity: overlayOpacity }]} 
                    pointerEvents="none" 
                />
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={handleClose}
                />
                <Animated.View style={[styles.cardContainer, { transform: [{ scale: cardScale }] }]} pointerEvents="box-none">
                    <View style={styles.card}>
                        <View style={styles.iconContainer}>
                            {type === 'success' ? (
                                <CheckCircle size={40} color={Colors.income} strokeWidth={2.5} />
                            ) : (
                                <AlertTriangle size={40} color={Colors.expense} strokeWidth={2.5} />
                            )}
                        </View>

                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>

                        <View style={{ width: '100%' }}>
                            <AppleButton
                                title="OK"
                                onPress={handleClose}
                                variant="primary"
                            />
                        </View>
                    </View>
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
        // Removed, using AnimatedBlurView
    },
    cardContainer: {
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
});

export default InfoDialog;
