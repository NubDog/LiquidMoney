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
    PanResponder,
    Pressable,
    StyleSheet,
    View,
    useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';

import BackgroundLiquidGlass from '../components/layout/BackgroundLiquidGlass';
import LiquidBackground from '../components/layout/LiquidBackground';
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
const ALL_TABS = [...BASE_TABS, DEV_TAB];

const TAB_UNIT_WIDTH = 70;
const NAVBAR_PADDING = 6;

// ─── Component ────────────────────────────────────────────────────────────────

const AppNavigator: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const isDeveloperMode = useStore(state => state.isDeveloperMode);

    // ─── Navigation State ───────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<TabName>('home');
    const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
    const [displayWalletId, setDisplayWalletId] = useState<string | null>(null);

    // Slide animation value (Tab Slide)
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Wallet Detail slide animation
    const walletSlideAnim = useRef(new Animated.Value(0)).current;
    const [walletDetailRendered, setWalletDetailRendered] = useState(false);

    // Dev tab expansion (0 to 1)
    const devExpansionAnim = useRef(new Animated.Value(isDeveloperMode ? 1 : 0)).current; // JS Thread (for width)
    const devExpansionAnimNative = useRef(new Animated.Value(isDeveloperMode ? 1 : 0)).current; // Native Thread (for transforms)

    // Synchronization of Developer Mode logic
    useEffect(() => {
        if (!isDeveloperMode && activeTab === 'dev') {
            setActiveTab('home');
        }

        Animated.spring(devExpansionAnim, {
            toValue: isDeveloperMode ? 1 : 0,
            damping: 18,
            stiffness: 200, // 120FPS snappy spring
            useNativeDriver: false, // Animating width
        }).start();

        Animated.spring(devExpansionAnimNative, {
            toValue: isDeveloperMode ? 1 : 0,
            damping: 18,
            stiffness: 200, 
            useNativeDriver: true, // Animating transforms natively
        }).start();
    }, [isDeveloperMode, devExpansionAnim, devExpansionAnimNative, activeTab]);

    // Trigger tab slide animation
    useEffect(() => {
        const targetIndex = ALL_TABS.findIndex(t => t.key === activeTab);
        const idx = targetIndex === -1 ? 0 : targetIndex;

        Animated.spring(slideAnim, {
            toValue: -idx * width,
            useNativeDriver: true,
            damping: 22,
            stiffness: 180,
            mass: 0.8,
            restDisplacementThreshold: 0.001,
            restSpeedThreshold: 0.001,
        }).start();
    }, [activeTab, width, slideAnim]);

    // Trigger slide animation when wallet is selected/deselected
    useEffect(() => {
        if (activeWalletId) {
            walletSlideAnim.setValue(0);
            requestAnimationFrame(() => {
                Animated.spring(walletSlideAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    damping: 22,
                    stiffness: 140,
                    mass: 0.8,
                    restDisplacementThreshold: 0.001,
                    restSpeedThreshold: 0.001,
                }).start();
            });
        } else if (walletDetailRendered) {
            requestAnimationFrame(() => {
                Animated.spring(walletSlideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 22,
                    stiffness: 140,
                    mass: 0.8,
                    restDisplacementThreshold: 0.001,
                    restSpeedThreshold: 0.001,
                }).start(({ finished }) => {
                    if (finished) {
                        setWalletDetailRendered(false);
                    }
                });
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

    const navWidthAnim = devExpansionAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [navWidthStart, navWidthEnd]
    });

    const baseTabWidthAnim = devExpansionAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [tabWidthStart, tabWidthEnd]
    });

    const devTabWidthAnim = devExpansionAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, tabWidthEnd]
    });
    
    // NATIVE interpolations for transforms
    const baseTabWidthAnimNative = devExpansionAnimNative.interpolate({
        inputRange: [0, 1],
        outputRange: [tabWidthStart, tabWidthEnd]
    });

    // To prevent Animated.divide by 0 during initialization
    const minusWidth = useRef(new Animated.Value(-width || -1)).current;
    useEffect(() => {
        if (width > 0) {
            minusWidth.setValue(-width);
        }
    }, [width, minusWidth]);

    // Math for active pill translation seamlessly reacting to tab width changes
    // slideAnim: 0 to -3*width
    // normalizedSlide: 0 to 3
    const normalizedSlide = Animated.divide(slideAnim, minusWidth);
    const pillTranslateX = Animated.multiply(normalizedSlide, baseTabWidthAnimNative);

    // Wallet slide transforms
    const walletTranslateX = walletSlideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [width, 0],
    });

    const mainOpacity = walletSlideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
    });

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <View style={styles.root} {...panResponder.panHandlers}>
            <LiquidBackground />

            {/* Sliding Container — always rendered all 4 screens for flawless memory allocation */}
            <Animated.View
                style={[
                    styles.screensContainer,
                    {
                        width: width * ALL_TABS.length,
                        transform: [{ translateX: slideAnim }],
                        opacity: mainOpacity,
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
                <View style={{ width, height: '100%' }}>
                    <DeveloperScreen />
                </View>
            </Animated.View>

            {/* Floating Glass Tab Bar — stays behind Wallet Detail */}
            <Animated.View
                pointerEvents={activeWalletId ? 'none' : 'box-none'}
                style={[
                    styles.tabBarContainer,
                    { 
                        paddingBottom: insets.bottom + 20,
                        opacity: mainOpacity 
                    },
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
                        blurAmount={25}
                        reducedTransparencyFallbackColor="transparent"
                        {...{ experimentalBlurMethod: 'dimezisBlurView' } as any}
                    />

                    <View style={styles.tabBarContent}>
                        {/* Animated Active Pill Background (Decoupled JS Width and Native TranslateX) */}
                        <Animated.View
                            style={{
                                position: 'absolute',
                                left: 6,
                                top: 6,
                                bottom: 6,
                                width: baseTabWidthAnim, // JS Animation
                            }}>
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
                                        transform: [
                                            { translateX: pillTranslateX }, // Native Animation
                                        ],
                                    },
                                ]}
                            />
                        </Animated.View>

                        {ALL_TABS.map((tab, index) => {
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
                                    onPress={() => setActiveTab(tab.key)}>
                                    <Animated.View
                                        style={[
                                            styles.tabItem,
                                            { width: isDevTab ? devTabWidthAnim : baseTabWidthAnim } // JS Animation
                                        ]}>
                                        <Animated.View
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transform: [
                                                    {
                                                        scale: isDevTab
                                                            ? Animated.multiply(scale, devExpansionAnimNative) as any // Native
                                                            : scale
                                                    },
                                                ],
                                                opacity: isDevTab 
                                                    ? Animated.multiply(opacity, devExpansionAnimNative) as any // Native
                                                    : opacity,
                                            }}>
                                            <IconComponent
                                                size={28}
                                                color="#FFFFFF"
                                                strokeWidth={2}
                                            />
                                        </Animated.View>
                                    </Animated.View>
                                </Pressable>
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
                        transform: [{ translateX: walletTranslateX }],
                        zIndex: 100, // Ensure it covers the tab bar
                        elevation: 100,
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
