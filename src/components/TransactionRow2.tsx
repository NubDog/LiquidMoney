/**
 * TransactionRow2.tsx — Item Row displaying individual transactions using Liquid Glass
 * Features 10-layer exponential blur for Android artifact prevention.
 */

import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, Animated, LayoutChangeEvent, Pressable } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { Svg, Rect, Defs, RadialGradient, Stop, LinearGradient } from 'react-native-svg';
import { ArrowDownRight, ArrowUpRight, Repeat } from 'lucide-react-native';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FontSizes, Radii, Spacing } from '../common/theme';
import type { Transaction } from '../common/types';

interface TransactionRowProps {
    item: Transaction;
    onPress?: (transaction: Transaction) => void;
}

const TransactionRow2: React.FC<TransactionRowProps> = ({
    item,
    onPress,
}) => {
    const isIncome = item.type === 'IN';
    const isTransfer = false; // Placeholder for Future 'transfer' tag

    const scale = useRef(new Animated.Value(1)).current;
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const hasDimensions = dimensions.width > 0 && dimensions.height > 0;
    const cardRadius = Radii.lg;

    // --- Interaction Animations ---
    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    // --- Helpers ---
    const getIcon = () => {
        if (isTransfer) return <Repeat size={24} color={'#FFFFFF'} />;
        return isIncome ? (
            <ArrowDownRight size={24} color={'#32D74B'} /> // Green for income
        ) : (
            <ArrowUpRight size={24} color={'#FF453A'} /> // Red for expense
        );
    };

    const formatCurrency = (amount: number) => {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // --- Render Content ---
    const renderContentBody = () => (
        <View style={styles.textContent}>
            <View style={styles.iconBox}>
                {getIcon()}
            </View>
            
            <View style={styles.infoBox}>
                <Text style={styles.description} numberOfLines={1}>
                    {item.reason || (isIncome ? 'Thu Nhập' : 'Chi Tiêu')}
                </Text>
                <Text style={styles.date}>
                    {format(new Date(item.created_at), 'dd MMM yyyy, HH:mm', { locale: vi })}
                </Text>
            </View>
            
            <View style={styles.amountBox}>
                <Text style={[styles.amount, { color: isIncome ? '#32D74B' : '#FFFFFF' }]} numberOfLines={1}>
                    {(isIncome ? '+' : '-') + formatCurrency(item.amount) + ' ₫'}
                </Text>
            </View>
        </View>
    );

    // Xử lý kích thước component
    const onLayoutContainer = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setDimensions({ width, height });
    };

    const borderRadius = 24; // Tăng bo góc cho giống Card xịn
    const BLUR_STEPS = [
        { w: 40, o: "0.02" },
        { w: 32, o: "0.02" },
        { w: 26, o: "0.03" },
        { w: 20, o: "0.04" },
        { w: 15, o: "0.06" },
        { w: 11, o: "0.08" },
        { w: 8,  o: "0.12" },
        { w: 5,  o: "0.18" },
        { w: 3,  o: "0.25" },
        { w: 1,  o: "0.80" },
    ];

    return (
        <Animated.View style={[{ transform: [{ scale }], marginBottom: Spacing.sm }]}>
            <Pressable
                onPress={() => onPress?.(item)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    styles.container,
                    { aspectRatio: 4.236 }
                ]}
            >
                <View style={[styles.glassWrapper, { borderRadius: borderRadius, height: '100%' }]} onLayout={onLayoutContainer}>
                    {/* @ts-ignore */}
                    <BlurView
                        blurType="light"
                        blurAmount={10}
                        overlayColor="transparent"
                        reducedTransparencyFallbackColor="transparent"
                        style={{ height: '100%' }}
                    >
                        {hasDimensions && (
                            <Svg width={dimensions.width} height={dimensions.height} style={StyleSheet.absoluteFill}>
                                <Defs>
                                    <RadialGradient id="glassBodyTL" cx="0%" cy="0%" rx="100%" ry="100%">
                                        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.15" />
                                        <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                                    </RadialGradient>
                                    <RadialGradient id="glassBodyBR" cx="100%" cy="100%" rx="100%" ry="100%">
                                        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.08" />
                                        <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                                    </RadialGradient>

                                    {/* Ánh sáng glow 2 trục */}
                                    <RadialGradient id="tlGlow" cx="0%" cy="0%" rx="61.8%" ry="38.2%">
                                        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1.0" />
                                        <Stop offset="0.08" stopColor="#FFFFFF" stopOpacity="0.8" />
                                        <Stop offset="0.25" stopColor="#FFFFFF" stopOpacity="0.35" />
                                        <Stop offset="0.618" stopColor="#FFFFFF" stopOpacity="0.1" />
                                        <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                                    </RadialGradient>

                                    <RadialGradient id="brGlow" cx="100%" cy="100%" rx="61.8%" ry="38.2%">
                                        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1.0" />
                                        <Stop offset="0.08" stopColor="#FFFFFF" stopOpacity="0.8" />
                                        <Stop offset="0.25" stopColor="#FFFFFF" stopOpacity="0.35" />
                                        <Stop offset="0.618" stopColor="#FFFFFF" stopOpacity="0.1" />
                                        <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                                    </RadialGradient>
                                    
                                    <LinearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
                                       <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.15" />
                                       <Stop offset="0.3" stopColor="#FFFFFF" stopOpacity="0.0" />
                                       <Stop offset="0.7" stopColor="#FFFFFF" stopOpacity="0.0" />
                                       <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.05" />
                                    </LinearGradient>
                                </Defs>

                                <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="url(#glassBodyTL)" rx={borderRadius} />
                                <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="url(#glassBodyBR)" rx={borderRadius} />
                                <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="url(#shine)" rx={borderRadius} />

                                {/* 10 Layers Alpha Smooth Gaussian Blur */}
                                {BLUR_STEPS.map((step, idx) => (
                                    <React.Fragment key={idx}>
                                        <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="none" stroke="url(#tlGlow)" strokeWidth={step.w} opacity={step.o} rx={borderRadius} />
                                        <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="none" stroke="url(#brGlow)" strokeWidth={step.w} opacity={step.o} rx={borderRadius} />
                                    </React.Fragment>
                                ))}
                            </Svg>
                        )}

                        <View style={[styles.contentContainer, { height: '100%' }]} collapsable={false}>
                            {renderContentBody()}
                        </View>
                    </BlurView>
                </View>
            </Pressable>
        </Animated.View>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    glassWrapper: {
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    contentContainer: {
        width: '100%',
    },
    textContent: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: Radii.pill,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    infoBox: {
        flex: 1,
        justifyContent: 'center',
        marginRight: Spacing.xs,
    },
    description: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    date: {
        fontSize: FontSizes.sm,
        color: 'rgba(255, 255, 255, 0.55)',
    },
    amountBox: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: FontSizes.md,
        fontWeight: '700',
    },
});

export default React.memo(TransactionRow2);
