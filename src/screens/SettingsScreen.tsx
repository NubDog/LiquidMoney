/**
 * SettingsScreen.tsx — Màn hình cài đặt
 * Placeholder cho Phase 6
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SettingsScreen: React.FC = () => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
            <Text style={styles.title}>Cài đặt</Text>
            <Text style={styles.subtitle}>Sao lưu & Phục hồi</Text>
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

export default SettingsScreen;
