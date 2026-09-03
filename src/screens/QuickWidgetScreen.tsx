/**
 * QuickWidgetScreen.tsx — Entry point for Android Quick Transaction Widget Overlay
 * Opens on top of Android Home Screen as a transparent overlay.
 * Reuses 100% of app components (QuickTransactionModal, SQLite database, Zustand store).
 */

import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from '../store/useStore';
import QuickTransactionModal from '../components/modals/QuickTransactionModal';
import { closeOverlayActivity, updateWidget } from '../native/WidgetBridge';

function QuickWidgetContent(): React.JSX.Element {
    const isReady = useStore((state) => state.isReady);
    const wallets = useStore((state) => state.wallets);
    const addTransaction = useStore((state) => state.addTransaction);

    useEffect(() => {
        if (isReady && wallets.length === 0) {
            Alert.alert(
                'Chưa có ví',
                'Bạn chưa có ví nào trong ứng dụng. Vui lòng mở LiquidMoney để tạo ví trước.',
                [
                    {
                        text: 'Đóng',
                        onPress: () => closeOverlayActivity(),
                    },
                ]
            );
        }
    }, [isReady, wallets]);

    const handleSave = useCallback(
        async (
            walletId: string,
            type: 'IN' | 'OUT',
            amount: number,
            reason?: string
        ) => {
            addTransaction(walletId, type, amount, reason);
            updateWidget();
        },
        [addTransaction]
    );

    const handleClose = useCallback(() => {
        closeOverlayActivity();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                translucent
                backgroundColor="transparent"
            />
            <QuickTransactionModal
                visible={true}
                wallets={wallets}
                onClose={handleClose}
                onSave={handleSave}
                embedded={true}
            />
        </View>
    );
}

export default function QuickWidgetScreen(): React.JSX.Element {
    return (
        <SafeAreaProvider>
            <StoreProvider>
                <QuickWidgetContent />
            </StoreProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});
