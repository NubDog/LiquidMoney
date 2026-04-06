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
import { animateDialogOpen, animateDialogClose } from '../common/animations';
import { Colors, FontSizes, Radii, Spacing } from '../common/theme';
import LiquidCard from './LiquidCard';
import LiquidButton2 from './LiquidButton2';

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
                <Animated.View style={[styles.cardContainer, { transform: [{ scale: cardScale }] }]}>
                    <LiquidCard 
                        style={styles.card}
                        intensity="light"
                        
                        borderRadius={Radii.xxl}
                    >
                        <View style={styles.iconContainer}>
                            {type === 'success' ? (
                                <CheckCircle size={40} color={Colors.income} strokeWidth={2.5} />
                            ) : (
                                <AlertTriangle size={40} color={Colors.expense} strokeWidth={2.5} />
                            )}
                        </View>

                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>

                        <LiquidButton2
                            title="OK"
                            onPress={handleClose}
                            style={styles.okBtn}
                        />
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
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
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
    okBtn: {
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: Radii.md,
        backgroundColor: 'rgba(34, 211, 238, 0.25)',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.45)',
    },
    okBtnText: {
        fontSize: FontSizes.lg - 2,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default InfoDialog;
