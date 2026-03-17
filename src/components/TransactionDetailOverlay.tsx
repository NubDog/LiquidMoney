/**
 * TransactionDetailOverlay.tsx — Animated overlay for transaction detail view
 * Extracted from WalletDetailScreen.tsx (lines 390-452).
 * Slides in from right with spring animation.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, useWindowDimensions, Modal } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';
import type { Transaction } from '../common/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransactionDetailOverlayProps {
    transaction: Transaction;
    walletName: string;
    onGoBack: () => void;
    onEdit: (id: string, wId: string, type: 'IN' | 'OUT', amount: number, reason?: string | null, imageUri?: string | null) => void;
    onDelete: (id: string, wId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const TransactionDetailOverlay: React.FC<TransactionDetailOverlayProps> = ({
    transaction,
    walletName,
    onGoBack,
    onEdit,
    onDelete,
}) => {
    const { width } = useWindowDimensions();
    const translateX = useRef(new Animated.Value(width)).current;
    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
        // Slide in
        Animated.spring(translateX, {
            toValue: 0,
            damping: 18,
            stiffness: 100,
            overshootClamping: true,
            useNativeDriver: true,
        }).start();
    }, [translateX]);

    const handleClose = useCallback(() => {
        Animated.timing(translateX, {
            toValue: width,
            duration: 250,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                setShouldRender(false);
                onGoBack();
            }
        });
    }, [translateX, width, onGoBack]);

    if (!shouldRender) { return null; }

    return (
        <Modal
            visible={shouldRender}
            transparent
            statusBarTranslucent={true}
            animationType="none" // Handle sliding with our own Animated.View
            onRequestClose={handleClose}
        >
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    { transform: [{ translateX }], zIndex: 100, elevation: 100 },
                ]}>
                <BlurView
                    style={StyleSheet.absoluteFill}
                    blurType="dark"
                    blurAmount={50}
                    overlayColor="transparent"
                />
                <TransactionDetailScreen
                    transaction={transaction}
                    walletName={walletName}
                    onGoBack={handleClose}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            </Animated.View>
        </Modal>
    );
};

export default TransactionDetailOverlay;
