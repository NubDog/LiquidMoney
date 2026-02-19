/**
 * WalletDetailScreen.tsx — Màn hình chi tiết ví + danh sách giao dịch
 * Placeholder cho Phase 6
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface WalletDetailScreenProps {
    walletId: string;
    onGoBack: () => void;
}

const WalletDetailScreen: React.FC<WalletDetailScreenProps> = ({ walletId }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
            <Text style={styles.title}>Chi tiết ví</Text>
            <Text style={styles.subtitle}>Wallet ID: {walletId}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 4,
    },
});

export default WalletDetailScreen;
