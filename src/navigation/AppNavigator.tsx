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
    BackHandler,
    PanResponder,
    Pressable,
    StyleSheet,
    View,
    useWindowDimensions,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, interpolate, Extrapolation, runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';


import LiquidBackground from '../components/layout/LiquidBackground';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StatsScreen from '../screens/StatsScreen';
import WalletDetailScreen from '../screens/WalletDetailScreen';
import DeveloperScreen from '../screens/DeveloperScreen';
import FPSMonitor from '../components/ui/FPSMonitor';

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
const ALL_TABS = [...BASE_TABS, DEV_TAB];

const TAB_UNIT_WIDTH = 70;
const NAVBAR_PADDING = 6;

// ─── Component ────────────────────────────────────────────────────────────────

const TabItemComponent = React.memo(({ 
    tab, 
    index, 
    width, 
    slideAnim, 
    devExpansionAnim, 
    isDevTab, 
    animatedBaseTabStyle, 
    animatedDevTabStyle, 
    setActiveTab 
}: any) => {
    const animatedIconWrapperStyle = useAnimatedStyle(() => {
        const centerValue = index * -width;
        const scale = interpolate(
            slideAnim.value,
            [centerValue - width, centerValue, centerValue + width],
            [1, 1.4, 1],
            Extrapolation.CLAMP
        );
        const opacity = interpolate(
            slideAnim.value,
            [centerValue - width, centerValue, centerValue + width],
            [0.5, 1, 0.5],
            Extrapolation.CLAMP
        );
        
        return {
            transform: [{ scale: isDevTab ? scale * devExpansionAnim.value : scale }],
            opacity: isDevTab ? opacity * devExpansionAnim.value : opacity,
        };
    });

    const IconComponent = tab.icon;

    return (
        <Pressable onPress={() => setActiveTab(tab.key)}>
            <Animated.View style={[styles.tabItem, isDevTab ? animatedDevTabStyle : animatedBaseTabStyle]}>
                <Animated.View style={[
                    { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
                    animatedIconWrapperStyle
                ]}>
                    <IconComponent size={28} color="#FFFFFF" strokeWidth={2} />
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
});

const AppNavigator: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const isDeveloperMode = useStore(state => state.isDeveloperMode);
    const isFPSMonitorEnabled = useStore(state => state.isFPSMonitorEnabled);

    // ─── Navigation State ───────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<TabName>('home');
    const [visitedTabs, setVisitedTabs] = useState<Record<string, boolean>>({ home: true });
    const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
    const [displayWalletId, setDisplayWalletId] = useState<string | null>(null);

    // Slide animation value (Tab Slide)
    const slideAnim = useSharedValue(0);

    // Wallet Detail slide animation
    const walletSlideAnim = useSharedValue(0);
    const [walletDetailRendered, setWalletDetailRendered] = useState(false);

    // Dev tab expansion (0 to 1)
    const devExpansionAnim = useSharedValue(isDeveloperMode ? 1 : 0);

    // Synchronization of Developer Mode logic
    useEffect(() => {
        if (!isDeveloperMode && activeTab === 'dev') {
            setActiveTab('home');
        }

        devExpansionAnim.value = withTiming(isDeveloperMode ? 1 : 0, {
            duration: 400,
            easing: Easing.out(Easing.cubic)
        });
    }, [isDeveloperMode, devExpansionAnim, activeTab]);

    // Trigger tab slide animation
    useEffect(() => {
        setVisitedTabs(prev => {
            if (prev[activeTab]) return prev;
            return { ...prev, [activeTab]: true };
        });

        const targetIndex = ALL_TABS.findIndex(t => t.key === activeTab);
        const idx = targetIndex === -1 ? 0 : targetIndex;

        slideAnim.value = withTiming(-idx * width, {
            duration: 400,
            easing: Easing.out(Easing.cubic)
        });
    }, [activeTab, width, slideAnim]);

    // Trigger slide animation when wallet is selected/deselected
    useEffect(() => {
        if (activeWalletId) {
            walletSlideAnim.value = 0;
            walletSlideAnim.value = withTiming(1, {
                duration: 400,
                easing: Easing.out(Easing.cubic)
            });
        } else if (walletDetailRendered) {
            walletSlideAnim.value = withTiming(0, {
                duration: 400,
                easing: Easing.out(Easing.cubic)
            }, (finished) => {
                if (finished) {
                    runOnJS(setWalletDetailRendered)(false);
                }
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

    // ─── Swipe Navigation ─────────────────────────────────────────────────────

    const activeTabRef = useRef(activeTab);
    activeTabRef.current = activeTab;

    const activeWalletIdRef = useRef(activeWalletId);
    activeWalletIdRef.current = activeWalletId;

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
                    if (activeWalletIdRef.current) return false;
                    const isHorizontalSwipe = Math.abs(gestureState.dx) > 25 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
                    return isHorizontalSwipe;
                },
                onPanResponderRelease: (evt, gestureState) => {
                    const SWIPE_THRESHOLD = 90;
                    if (gestureState.dx > SWIPE_THRESHOLD) {
                        const idx = ALL_TABS.findIndex(t => t.key === activeTabRef.current);
                        if (idx > 0) setActiveTab(ALL_TABS[idx - 1].key);
                    } else if (gestureState.dx < -SWIPE_THRESHOLD) {
                        const idx = ALL_TABS.findIndex(t => t.key === activeTabRef.current);
                        const maxIdx = isDeveloperMode ? 3 : 2;
                        if (idx < maxIdx) setActiveTab(ALL_TABS[idx + 1].key);
                    }
                },
                onPanResponderTerminate: () => {},
            }),
        [isDeveloperMode]
    );

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

    // ─── Calculations for Navbar (Mathematical Animation) ─────────────────────

    const navWidthStart = Math.min(width * 0.8, TAB_UNIT_WIDTH * 3 + 40);
    const tabWidthStart = (navWidthStart - NAVBAR_PADDING * 2) / 3;

    const navWidthEnd = Math.min(width * 0.8, TAB_UNIT_WIDTH * 4 + 40);
    const tabWidthEnd = (navWidthEnd - NAVBAR_PADDING * 2) / 4;

    const animatedFloatingTabBarStyle = useAnimatedStyle(() => ({
        width: interpolate(devExpansionAnim.value, [0, 1], [navWidthStart, navWidthEnd], Extrapolation.CLAMP)
    }));

    const animatedBaseTabStyle = useAnimatedStyle(() => ({
        width: interpolate(devExpansionAnim.value, [0, 1], [tabWidthStart, tabWidthEnd], Extrapolation.CLAMP)
    }));

    const animatedDevTabStyle = useAnimatedStyle(() => ({
        width: interpolate(devExpansionAnim.value, [0, 1], [0, tabWidthEnd], Extrapolation.CLAMP)
    }));

    const animatedPillStyle = useAnimatedStyle(() => {
        const normalizedSlide = width > 0 ? slideAnim.value / -width : 0;
        const currentTabWidth = interpolate(devExpansionAnim.value, [0, 1], [tabWidthStart, tabWidthEnd], Extrapolation.CLAMP);
        return {
            transform: [{ translateX: normalizedSlide * currentTabWidth }]
        };
    });

    const animatedScreensContainerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: slideAnim.value }],
        opacity: interpolate(walletSlideAnim.value, [0, 1], [1, 0])
    }));

    const animatedTabBarContainerStyle = useAnimatedStyle(() => ({
        opacity: interpolate(walletSlideAnim.value, [0, 1], [1, 0])
    }));

    const animatedWalletDetailStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: interpolate(walletSlideAnim.value, [0, 1], [width, 0]) }]
    }));

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <View style={styles.root} {...panResponder.panHandlers}>
            <LiquidBackground />

            {/* Sliding Container — lazy loads screens to save memory and layout calculation time */}
            <Animated.View
                style={[
                    styles.screensContainer,
                    {
                        width: width * ALL_TABS.length,
                    },
                    animatedScreensContainerStyle
                ]}>
                <View style={{ width, height: '100%' }}>
                    {visitedTabs['home'] && <HomeScreen onNavigateToWallet={navigateToWallet} />}
                </View>
                <View style={{ width, height: '100%' }}>
                    {visitedTabs['stats'] && <StatsScreen />}
                </View>
                <View style={{ width, height: '100%' }}>
                    {visitedTabs['settings'] && <SettingsScreen />}
                </View>
                <View style={{ width, height: '100%' }}>
                    {visitedTabs['dev'] && <DeveloperScreen />}
                </View>
            </Animated.View>

            {/* Floating Glass Tab Bar — stays behind Wallet Detail */}
            <Animated.View
                pointerEvents={activeWalletId ? 'none' : 'box-none'}
                style={[
                    styles.tabBarContainer,
                    { 
                        paddingBottom: insets.bottom + 20,
                    },
                    animatedTabBarContainerStyle
                ]}>
                <Animated.View
                    style={[
                        styles.floatingTabBar,
                        animatedFloatingTabBarStyle
                    ]}>
                    <BlurView
                        style={styles.blurBackground}
                        blurType="dark"
                        overlayColor="transparent"
                        blurAmount={25}
                        reducedTransparencyFallbackColor="transparent"
                        {...{ experimentalBlurMethod: 'dimezisBlurView' } as any}
                    />

                    <View style={styles.tabBarContent}>
                        {/* Animated Active Pill Background (Decoupled JS Width and Native TranslateX) */}
                        <Animated.View
                            style={[
                                { position: 'absolute', left: 6, top: 6, bottom: 6 },
                                animatedBaseTabStyle
                            ]}>
                            <Animated.View
                                style={[
                                    styles.activePill,
                                    {
                                        position: 'relative',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: '100%',
                                        height: '100%',
                                    },
                                    animatedPillStyle
                                ]}
                            />
                        </Animated.View>

                        {ALL_TABS.map((tab, index) => {
                            const isDevTab = tab.key === 'dev';
                            return (
                                <TabItemComponent 
                                    key={tab.key}
                                    tab={tab}
                                    index={index}
                                    width={width}
                                    slideAnim={slideAnim}
                                    devExpansionAnim={devExpansionAnim}
                                    isDevTab={isDevTab}
                                    animatedBaseTabStyle={animatedBaseTabStyle}
                                    animatedDevTabStyle={animatedDevTabStyle}
                                    setActiveTab={setActiveTab}
                                />
                            );
                        })}
                    </View>
                </Animated.View>
            </Animated.View>

            {/* Wallet Detail — slides in from right using RN Core Animated */}
            <Animated.View
                pointerEvents={activeWalletId ? 'auto' : 'none'}
                style={[
                    StyleSheet.absoluteFill,
                    {
                        zIndex: 100, // Ensure it covers the tab bar
                        elevation: 100,
                    },
                    animatedWalletDetailStyle
                ]}>
                {walletDetailRendered && displayWalletId && (
                    <WalletDetailScreen
                        walletId={displayWalletId}
                        onGoBack={goBackFromWallet}
                    />
                )}
            </Animated.View>

            {/* Hardware UI Thread FPS Monitor */}
            {isFPSMonitorEnabled && <FPSMonitor />}
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
        borderRadius: 36,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)', // Edge light scattering effect
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
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 30,
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
