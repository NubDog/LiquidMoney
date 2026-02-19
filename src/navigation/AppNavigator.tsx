/**
 * AppNavigator.tsx — Navigation chính của LiquidMoney
 * - Slide Transition giữa các tab
 * - Floating Glass Tab Bar (VisionOS style)
 * - Render đồng thời 3 màn hình để slide mượt mà
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MeshBackground from '../components/MeshBackground';
import GlassCard from '../components/GlassCard';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StatsScreen from '../screens/StatsScreen';
import WalletDetailScreen from '../screens/WalletDetailScreen';

// ─── Tab Config ───────────────────────────────────────────────────────────────

type TabName = 'home' | 'stats' | 'settings';

interface TabConfig {
    key: TabName;
    label: string;
    icon: string;
}

const TABS: TabConfig[] = [
    { key: 'home', label: 'Ví tiền', icon: '🏠' },
    { key: 'stats', label: 'Thống kê', icon: '📊' },
    { key: 'settings', label: 'Cài đặt', icon: '⚙️' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const AppNavigator: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();

    // ─── Navigation State ───────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<TabName>('home');
    const [activeWalletId, setActiveWalletId] = useState<string | null>(null);

    // Slide animation value
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Trigger slide animation when tab changes
    useEffect(() => {
        const targetIndex = TABS.findIndex(t => t.key === activeTab);
        Animated.spring(slideAnim, {
            toValue: -targetIndex * width,
            useNativeDriver: true,
            friction: 12,
            tension: 50,
        }).start();
    }, [activeTab, width, slideAnim]);

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const navigateToWallet = useCallback((walletId: string) => {
        setActiveWalletId(walletId);
    }, []);

    const goBackFromWallet = useCallback(() => {
        setActiveWalletId(null);
    }, []);

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <View style={styles.root}>
            <MeshBackground />

            {/* Wallet Detail Modal/Screen (Overlay) */}
            {activeWalletId ? (
                <View style={StyleSheet.absoluteFill}>
                    <WalletDetailScreen
                        walletId={activeWalletId}
                        onGoBack={goBackFromWallet}
                    />
                </View>
            ) : (
                <>
                    {/* Sliding Container */}
                    <Animated.View
                        style={[
                            styles.screensContainer,
                            {
                                width: width * 3,
                                transform: [{ translateX: slideAnim }],
                            },
                        ]}>
                        <View style={{ width, height: '100%' }}>
                            <HomeScreen onNavigateToWallet={navigateToWallet} />
                        </View>
                        <View style={{ width, height: '100%' }}>
                            <StatsScreen />
                        </View>
                        <View style={{ width, height: '100%' }}>
                            <SettingsScreen />
                        </View>
                    </Animated.View>

                    {/* Floating Glass Tab Bar */}
                    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom + 10 }]}>
                        <GlassCard
                            style={styles.floatingTabBar}
                            borderRadius={32}
                            backgroundOpacity={0.15}
                            borderOpacity={0.25}
                            intensity={40}>
                            <View style={styles.tabBarContent}>
                                {TABS.map(tab => {
                                    const isActive = activeTab === tab.key;
                                    return (
                                        <Pressable
                                            key={tab.key}
                                            onPress={() => setActiveTab(tab.key)}
                                            style={[
                                                styles.tabItem,
                                                isActive && styles.tabItemActive,
                                            ]}>
                                            <View
                                                style={[
                                                    styles.iconContainer,
                                                    isActive && styles.activeIconContainer,
                                                ]}>
                                                <Text style={styles.tabIcon}>{tab.icon}</Text>
                                            </View>
                                            {isActive && (
                                                <Text style={styles.tabLabel}>
                                                    {tab.label}
                                                </Text>
                                            )}
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </GlassCard>
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
        backgroundColor: '#000000',
    },
    screensContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    tabBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'box-none', // allow clicks pass through empty space? No, tabbar needs clicks
    },
    floatingTabBar: {
        width: '85%',
        maxWidth: 360,
        height: 64,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    tabBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 6,
        height: '100%',
    },
    tabItem: {
        height: 52,
        borderRadius: 26,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    tabItemActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
    },
    iconContainer: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18,
    },
    activeIconContainer: {
        // backgroundColor: 'rgba(255,255,255,0.1)', // optional highlight
    },
    tabIcon: {
        fontSize: 22,
    },
    tabLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 8,
    },
});

export default AppNavigator;
