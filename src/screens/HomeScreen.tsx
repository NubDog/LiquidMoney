/**
 * HomeScreen.tsx — Màn hình chính hiển thị danh sách ví
 * Placeholder cho Phase 5
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HomeScreenProps {
    onNavigateToWallet?: (walletId: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = () => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
            <Text style={styles.title}>LiquidMoney</Text>
            <Text style={styles.subtitle}>Quản lý tài chính cá nhân</Text>
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

export default HomeScreen;
