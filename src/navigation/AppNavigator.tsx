/**
 * AppNavigator.tsx — Navigation chính của LiquidMoney
 * - Slide Transition giữa các tab
 * - Floating Glass Tab Bar (VisionOS style)
 * - Render đồng thời 3 màn hình để slide mượt mà
 * - Active Pill Animation + Icon Scaling (120FPS)
 * - No Labels (Icon Only)
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

import {
    BarChart2,
    House,
    Settings,
    type LucideIcon,
} from 'lucide-react-native';

// ─── Tab Config ───────────────────────────────────────────────────────────────

type TabName = 'home' | 'stats' | 'settings';

interface TabConfig {
    key: TabName;
    label: string;
    icon: LucideIcon;
}

const TABS: TabConfig[] = [
    { key: 'home', label: 'Ví tiền', icon: House },
    { key: 'stats', label: 'Thống kê', icon: BarChart2 },
    { key: 'settings', label: 'Cài đặt', icon: Settings },
];

// ─── Component ────────────────────────────────────────────────────────────────

const AppNavigator: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();

    // ─── Navigation State ───────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<TabName>('home');
    const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
    const [displayWalletId, setDisplayWalletId] = useState<string | null>(null);

    // Slide animation value (Tab Slide)
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Wallet Detail slide animation
    const walletSlideAnim = useRef(new Animated.Value(0)).current;
    const [walletDetailRendered, setWalletDetailRendered] = useState(false);

    // Trigger tab slide animation
    useEffect(() => {
        const targetIndex = TABS.findIndex(t => t.key === activeTab);
        Animated.spring(slideAnim, {
            toValue: -targetIndex * width,
            useNativeDriver: true,
            friction: 14,
            tension: 60,
        }).start();
    }, [activeTab, width, slideAnim]);

    // Trigger slide animation when wallet is selected/deselected
    useEffect(() => {
        if (activeWalletId) {
            // Animation values
            walletSlideAnim.setValue(0);
            Animated.spring(walletSlideAnim, {
                toValue: 1,
                useNativeDriver: true,
                friction: 12,
                tension: 65,
            }).start();
        } else if (walletDetailRendered) {
            Animated.timing(walletSlideAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start(() => {
                setWalletDetailRendered(false);
            });
        }
    }, [activeWalletId, walletSlideAnim, walletDetailRendered]);

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const navigateToWallet = useCallback((walletId: string) => {
        setDisplayWalletId(walletId);
        setActiveWalletId(walletId);
        setWalletDetailRendered(true);
    }, []);

    const goBackFromWallet = useCallback(() => {
        setActiveWalletId(null);
    }, []);

    // ─── Calculations for Navbar ──────────────────────────────────────────────

    // Navbar dimensions
    const NAVBAR_MAX_WIDTH = 280; // Compact width since no labels
    const navbarWidth = Math.min(width * 0.7, NAVBAR_MAX_WIDTH);
    const navbarPadding = 6;
    const availableWidth = navbarWidth - navbarPadding * 2;
    const tabWidth = availableWidth / 3;

    // Active Pill Translation
    const pillTranslateX = slideAnim.interpolate({
        inputRange: [-width * 2, 0],
        outputRange: [tabWidth * 2, 0],
    });

    // Wallet slide transforms
    const walletTranslateX = walletSlideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [width, 0],
    });

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <View style={styles.root}>
            <MeshBackground />

            {/* Sliding Container — always rendered */}
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

            {/* Floating Glass Tab Bar — stays behind Wallet Detail */}
            <View
                pointerEvents={activeWalletId ? 'none' : 'box-none'}
                style={[
                    styles.tabBarContainer,
                    { paddingBottom: insets.bottom + 20 },
                ]}>
                <GlassCard
                    style={[
                        styles.floatingTabBar,
                        { width: navbarWidth },
                    ]}
                    borderRadius={40}
                    backgroundOpacity={0.15}
                    borderOpacity={0.2}>

                    <View style={styles.tabBarContent}>
                        {/* Animated Active Pill Background */}
                        <Animated.View
                            style={[
                                styles.activePill,
                                {
                                    width: tabWidth,
                                    transform: [
                                        { translateX: pillTranslateX },
                                    ],
                                },
                            ]}
                        />

                        {TABS.map((tab, index) => {
                            const isActive = activeTab === tab.key;

                            // Interpolate Scale for Icon
                            const centerValue = index * -width;
                            const scale = slideAnim.interpolate({
                                inputRange: [
                                    centerValue - width,
                                    centerValue,
                                    centerValue + width,
                                ],
                                outputRange: [1, 1.4, 1], // Bigger scale (1.4) since no label
                                extrapolate: 'clamp',
                            });

                            const opacity = slideAnim.interpolate({
                                inputRange: [
                                    centerValue - width,
                                    centerValue,
                                    centerValue + width,
                                ],
                                outputRange: [0.5, 1, 0.5],
                                extrapolate: 'clamp',
                            });

                            const IconComponent = tab.icon;

                            return (
                                <Pressable
                                    key={tab.key}
                                    onPress={() => setActiveTab(tab.key)}
                                    style={[
                                        styles.tabItem,
                                        { width: tabWidth },
                                    ]}>
                                    <Animated.View
                                        style={{
                                            transform: [{ scale }],
                                            opacity,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                        <IconComponent
                                            size={28}
                                            color="#FFFFFF"
                                            strokeWidth={2}
                                        />
                                    </Animated.View>
                                </Pressable>
                            );
                        })}
                    </View>
                </GlassCard>
            </View>

            {/* Wallet Detail — slides in from right, overlaps Tab Bar */}
            {walletDetailRendered && displayWalletId && (
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            transform: [{ translateX: walletTranslateX }],
                            zIndex: 100, // Ensure it covers the tab bar
                            elevation: 100,
                            backgroundColor: '#000000', // Solid background instead of Mesh 
                        },
                    ]}>
                    <WalletDetailScreen
                        walletId={displayWalletId}
                        onGoBack={goBackFromWallet}
                    />
                </Animated.View>
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
        zIndex: 50,
        elevation: 50,
    },
    floatingTabBar: {
        height: 72, // Taller for bigger focus
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
        elevation: 12,
    },
    tabBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%',
        paddingHorizontal: 6,
    },
    activePill: {
        position: 'absolute',
        left: 6,
        top: 6,
        bottom: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    tabItem: {
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabIcon: {
        fontSize: 28, // Bigger icon
    },
});

export default AppNavigator;
