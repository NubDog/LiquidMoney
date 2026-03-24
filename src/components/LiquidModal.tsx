import React from 'react';
import { Modal, StyleSheet, View, Pressable, type ViewStyle, KeyboardAvoidingView, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LiquidCard from './LiquidCard';

interface LiquidModalProps {
    visible: boolean;
    onClose?: () => void;
    children: React.ReactNode;
    contentStyle?: ViewStyle;
}

const LiquidModal: React.FC<LiquidModalProps> = ({ visible, onClose, children, contentStyle }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}>
            
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={[StyleSheet.absoluteFill, { zIndex: 0 }]}>
                    <BlurView 
                        style={StyleSheet.absoluteFill} 
                        blurType="dark"
                        blurAmount={20}
                        overlayColor="rgba(11, 15, 25, 0.6)"
                    />
                </View>

                {onClose && (
                    <Pressable style={styles.backdropPressable} onPress={onClose} />
                )}

                <View style={styles.contentWrapper}>
                    <LiquidCard style={[styles.card, contentStyle]} intensity="heavy">
                        {children}
                    </LiquidCard>
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
        padding: 24,
    },
});

export default LiquidModal;
