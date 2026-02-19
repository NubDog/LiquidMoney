/**
 * AppNavigator.tsx — Navigation chính của LiquidMoney
 * Custom Tab Bar + Manual Stack — KHÔNG dùng react-navigation
 * (Vì react-native-screens native module chưa được build)
 *
 * Phong cách kính mờ (Glassmorphism) cho Tab Bar
 */

import React, { useCallback, useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MeshBackground from '../components/MeshBackground';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WalletDetailScreen from '../screens/WalletDetailScreen';

// ─── Tab Type ─────────────────────────────────────────────────────────────────

type TabName = 'home' | 'settings';

interface TabConfig {
    key: TabName;
    label: string;
    emoji: string;
}

const TABS: TabConfig[] = [
    { key: 'home', label: 'Ví tiền', emoji: '🏠' },
    { key: 'settings', label: 'Cài đặt', emoji: '⚙️' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const AppNavigator: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    // ─── Tab State ──────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<TabName>('home');

    // ─── Manual Stack State ─────────────────────────────────────────────────────
    const [activeWalletId, setActiveWalletId] = useState<string | null>(null);

    const navigateToWallet = useCallback((walletId: string) => {
        setActiveWalletId(walletId);
    }, []);

    const goBackFromWallet = useCallback(() => {
        setActiveWalletId(null);
    }, []);

    // Tab bar height
    const tabBarHeight = 65 + insets.bottom;

    // ─── Render ─────────────────────────────────────────────────────────────────

    return (
        <View style={styles.root}>
            {/* Background gradient */}
            <MeshBackground />

            {/* Nếu đang xem chi tiết ví → ẩn tabs, hiện WalletDetail */}
            {activeWalletId ? (
                <WalletDetailScreen
                    walletId={activeWalletId}
                    onGoBack={goBackFromWallet}
                />
            ) : (
                <>
                    {/* Screen content */}
                    <View style={[styles.screenContainer, { paddingBottom: tabBarHeight }]}>
                        {activeTab === 'home' && (
                            <HomeScreen onNavigateToWallet={navigateToWallet} />
                        )}
                        {activeTab === 'settings' && <SettingsScreen />}
                    </View>

                    {/* Custom Glass Tab Bar */}
                    <View
                        style={[
                            styles.tabBar,
                            {
                                paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
                                width,
                            },
                        ]}>
                        {TABS.map(tab => {
                            const isActive = activeTab === tab.key;
                            const color = isActive
                                ? '#FFFFFF'
                                : 'rgba(255, 255, 255, 0.4)';

                            return (
                                <Pressable
                                    key={tab.key}
                                    onPress={() => setActiveTab(tab.key)}
                                    style={styles.tabItem}>
                                    <Text style={{ fontSize: 20 }}>{tab.emoji}</Text>
                                    <Text
                                        style={[
                                            styles.tabLabel,
                                            { color },
                                            isActive && styles.tabLabelActive,
                                        ]}>
                                        {tab.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </>
            )}
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    screenContainer: {
        flex: 1,
    },
    tabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        flexDirection: 'row',
        backgroundColor: 'rgba(10, 0, 30, 0.75)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.12)',
        paddingTop: 10,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    tabLabelActive: {
        fontWeight: '700',
    },
});

export default AppNavigator;
