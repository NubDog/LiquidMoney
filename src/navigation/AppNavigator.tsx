/**
 * AppNavigator.tsx — Navigation chính của LiquidMoney
 * - Slide Transition giữa các tab
 * - Floating Glass Tab Bar (VisionOS style)
 * - Render đồng thời 3 màn hình để slide mượt mà
 * - Active Pill Animation + Icon Scaling (120FPS)
 * - No Labels (Icon Only)
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    BackHandler,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';

import LiquidBackground from '../components/LiquidBackground';
import LiquidCard from '../components/LiquidCard';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StatsScreen from '../screens/StatsScreen';
import WalletDetailScreen from '../screens/WalletDetailScreen';
import DeveloperScreen from '../screens/DeveloperScreen';

import {
    BarChart2,
    Code,
    House,
    Settings,
    type LucideIcon,
} from 'lucide-react-native';
import { useStore } from '../store/useStore';

// ─── Tab Config ───────────────────────────────────────────────────────────────

type TabName = 'home' | 'stats' | 'settings' | 'dev';

interface TabConfig {
    key: TabName;
    label: string;
    icon: LucideIcon;
}

const BASE_TABS: TabConfig[] = [
    { key: 'home', label: 'Ví tiền', icon: House },
    { key: 'stats', label: 'Thống kê', icon: BarChart2 },
    { key: 'settings', label: 'Cài đặt', icon: Settings },
];

const DEV_TAB: TabConfig = { key: 'dev', label: 'Dev', icon: Code };

// ─── Component ────────────────────────────────────────────────────────────────

const AppNavigator: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const { isDeveloperMode } = useStore();

    // ─── Dynamic Tabs ─────────────────────────────────────────────────────────
    const [showDevScreen, setShowDevScreen] = useState(isDeveloperMode);
    const tabs = useMemo(() => {
        return (isDeveloperMode || showDevScreen) ? [...BASE_TABS, DEV_TAB] : BASE_TABS;
    }, [isDeveloperMode, showDevScreen]);
    const tabCount = tabs.length;

    // ─── Navigation State ───────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<TabName>('home');
    const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
    const [displayWalletId, setDisplayWalletId] = useState<string | null>(null);

    // Slide animation value (Tab Slide)
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Wallet Detail slide animation
    const walletSlideAnim = useRef(new Animated.Value(0)).current;
    const [walletDetailRendered, setWalletDetailRendered] = useState(false);

    // Dev tab animations
    const devIconScale = useRef(new Animated.Value(isDeveloperMode ? 1 : 0)).current;
    const navWidthAnim = useRef(new Animated.Value(0)).current; // will be set in layout

    // Safety: if dev mode disabled while on Dev tab, go home
    useEffect(() => {
        if (isDeveloperMode) {
            setShowDevScreen(true);
            // Pop-in the dev icon
            devIconScale.setValue(0);
            Animated.spring(devIconScale, {
                toValue: 1,
                damping: 10,
                stiffness: 200,
                useNativeDriver: true,
            }).start();
        } else {
            if (activeTab === 'dev') {
                setActiveTab('home');
            }
            // Shrink dev icon, then unmount
            Animated.spring(devIconScale, {
                toValue: 0,
                damping: 14,
                stiffness: 200,
                useNativeDriver: true,
            }).start(() => {
                setShowDevScreen(false);
            });
        }
    }, [isDeveloperMode, devIconScale]);

    // Trigger tab slide animation
    useEffect(() => {
        const targetIndex = tabs.findIndex(t => t.key === activeTab);
        Animated.spring(slideAnim, {
            toValue: -targetIndex * width,
            useNativeDriver: true,
            friction: 14,
            tension: 60,
        }).start();
    }, [activeTab, width, slideAnim, tabs]);

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

    // ─── Android Back Button ─────────────────────────────────────────────────
    useEffect(() => {
        const onBackPress = () => {
            if (activeWalletId) {
                goBackFromWallet();
                return true;
            }
            if (activeTab !== 'home') {
                setActiveTab('home');
                return true;
            }
            return false;
        };

        const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => sub.remove();
    }, [activeWalletId, activeTab, goBackFromWallet]);

    // ─── Calculations for Navbar ──────────────────────────────────────────────

    // Navbar dimensions
    // Navbar dimensions
    const TAB_UNIT_WIDTH = 70;
    const NAVBAR_MAX_WIDTH = TAB_UNIT_WIDTH * tabCount + 40;
    const navbarWidth = Math.min(width * 0.75, NAVBAR_MAX_WIDTH);
    const navbarPadding = 6;
    const availableWidth = navbarWidth - navbarPadding * 2;
    const tabWidth = availableWidth / tabCount;

    // Active Pill Translation
    const pillTranslateX = slideAnim.interpolate({
        inputRange: Array.from({ length: tabCount }, (_, i) => -width * (tabCount - 1 - i)),
        outputRange: Array.from({ length: tabCount }, (_, i) => tabWidth * (tabCount - 1 - i)),
    });

    // Animate navbar width when tabCount changes
    useEffect(() => {
        Animated.spring(navWidthAnim, {
            toValue: navbarWidth,
            damping: 16,
            stiffness: 180,
            useNativeDriver: false, // width can't use native driver
        }).start();
    }, [navbarWidth, navWidthAnim]);

    // Wallet slide transforms
    const walletTranslateX = walletSlideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [width, 0],
    });

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <View style={styles.root}>
            <LiquidBackground />

            {/* Sliding Container — always rendered */}
            <Animated.View
                style={[
                    styles.screensContainer,
                    {
                        width: width * tabCount,
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
                {(isDeveloperMode || showDevScreen) && (
                    <View style={{ width, height: '100%' }}>
                        <DeveloperScreen />
                    </View>
                )}
            </Animated.View>

            {/* Floating Glass Tab Bar — stays behind Wallet Detail */}
            <View
                pointerEvents={activeWalletId ? 'none' : 'box-none'}
                style={[
                    styles.tabBarContainer,
                    { paddingBottom: insets.bottom + 20 },
                ]}>
                <Animated.View
                    style={[
                        styles.floatingTabBar,
                        { width: navWidthAnim },
                    ]}>
                    <BlurView
                        style={styles.blurBackground}
                        blurType="dark"
                        overlayColor="transparent"
                        blurAmount={50}
                        reducedTransparencyFallbackColor="#000000"
                    />

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

                        {tabs.map((tab, index) => {
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
                            const isDevTab = tab.key === 'dev';

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
                                            transform: [
                                                {
                                                    scale: isDevTab
                                                        ? Animated.multiply(scale, devIconScale) as any
                                                        : scale
                                                },
                                            ],
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
                </Animated.View>
            </View>

            {/* Wallet Detail — slides in from right using RN Core Animated */}
            <Animated.View
                pointerEvents={activeWalletId ? 'auto' : 'none'}
                style={[
                    StyleSheet.absoluteFill,
                    {
                        transform: [{ translateX: walletTranslateX }],
                        zIndex: 100, // Ensure it covers the tab bar
                        elevation: 100,
                        backgroundColor: '#000000', // Solid background instead of Mesh 
                    },
                ]}>
                {walletDetailRendered && displayWalletId && (
                    <WalletDetailScreen
                        walletId={displayWalletId}
                        onGoBack={goBackFromWallet}
                    />
                )}
            </Animated.View>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#000', // Fallback
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
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.4, // Softer shadow for clear glass, but deep enough to float
        shadowRadius: 36,
        elevation: 12,
        borderRadius: 36,
        // Volumetric RIM Lighting for Clear Glass Water Drop
        borderTopWidth: 1.5,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.5)',
        borderBottomColor: 'rgba(0, 0, 0, 0.2)', // Create depth underneath
        borderLeftColor: 'rgba(255, 255, 255, 0.1)',
        borderRightColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    blurBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.03)', // Barely visible tint to give the "water" volume
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
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Brightly separate from dark background
        borderRadius: 30,
        // Volumetric bubble inside that pops OUT
        borderTopWidth: 1.5,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.8)', // Super bright top reflection
        borderBottomColor: 'rgba(0, 0, 0, 0.3)', // Deep shadow bottom edge to lift it
        borderLeftColor: 'rgba(255, 255, 255, 0.15)',
        borderRightColor: 'rgba(255, 255, 255, 0.15)',
        // Shadow projecting onto the blur behind it
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
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
