/**
 * SegmentedControl.tsx — Liquid Glass Tabs wrapper
 * Uses LiquidCard to wrap tabs with a frosted container
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    LayoutChangeEvent,
    Pressable,
    StyleSheet,
    Text,
    View,
    Animated,
} from 'react-native';
import { Colors, FontSizes, Radii, Shadows } from '../common/theme';
import LiquidCard from './LiquidCard';

interface SegmentedControlProps {
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    counts?: Record<string, number>;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
    tabs,
    activeTab,
    onTabChange,
    counts,
}) => {
    const [tabWidth, setTabWidth] = useState(0);
    const translateX = useRef(new Animated.Value(0)).current;

    const activeIndex = tabs.indexOf(activeTab);

    useEffect(() => {
        if (tabWidth > 0 && activeIndex !== -1) {
            Animated.spring(translateX, {
                toValue: activeIndex * tabWidth,
                damping: 20,
                stiffness: 200,
                mass: 0.5,
                useNativeDriver: true,
            }).start();
        }
    }, [activeIndex, tabWidth, translateX]);

    const handleLayout = (event: LayoutChangeEvent) => {
        const { width } = event.nativeEvent.layout;
        setTabWidth(width / tabs.length);
    };

    return (
        <LiquidCard 
            style={styles.container} 
            intensity="light" 
             
            borderRadius={Radii.lg}
        >
            <View style={styles.innerLayout} onLayout={handleLayout}>
                {tabWidth > 0 && (
                    <Animated.View style={[styles.indicator, { width: tabWidth, transform: [{ translateX }] }]} />
                )}
                
                {tabs.map(tab => {
                    const isActive = activeTab === tab;
                    const count = counts?.[tab];

                    return (
                        <Pressable
                            key={tab}
                            style={styles.tab}
                            onPress={() => onTabChange(tab)}
                            accessible={true}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: isActive }}>
                            <View style={styles.tabContent}>
                                <Text
                                    style={[
                                        styles.tabText,
                                        isActive && styles.activeTabText,
                                    ]}>
                                    {tab}
                                </Text>
                                {count !== undefined && count > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{count}</Text>
                                    </View>
                                )}
                            </View>
                        </Pressable>
                    );
                })}
            </View>
        </LiquidCard>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        padding: 4,
    },
    innerLayout: {
        flexDirection: 'row',
        position: 'relative',
    },
    indicator: {
        position: 'absolute',
        top: 2,
        bottom: 2,
        left: 0,
        backgroundColor: 'rgba(255,255,255,0.15)', // Glass selection highlight
        borderRadius: Radii.md - 2,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)', // Solid edge for selection
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    tabText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    activeTabText: {
        color: '#FFFFFF',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    badge: {
        backgroundColor: Colors.accent,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
    },
    badgeText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: '800',
    },
});

export default SegmentedControl;
