/**
 * StatsScreen.tsx — Statistics screen
 * Apple Liquid Glass inspired design
 *
 * Features:
 *  - Skeleton loader with pulse animation
 *  - Day view: 2 bars (total income vs expense for today)
 *  - Week view: 7 groups × 2 bars (Mon-Sun)
 *  - 20 most recent transactions
 *  - Value labels on top of each bar
 *
 * Fixed:
 *  - ScrollView replaces FlatList to prevent header remount jump
 *  - Grid lines removed, value labels shown on bar tops
 *  - Empty chart shows graceful message
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    InteractionManager,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { BlurView } from '@react-native-community/blur';
import AppleGlassBackground from '../components/ui/AppleGlassBackground';
import LiquidButton2 from '../components/buttons/LiquidButton2';
import LiquidSegmentedControl2 from '../components/inputs/LiquidSegmentedControl2';
import AppleTransactionRow from '../components/ui/AppleTransactionRow';
import EmptyState2 from '../components/layout/EmptyState2';
import TransactionDetailOverlay from '../components/overlays/TransactionDetailOverlay';
import TransactionModal from '../components/modals/TransactionModal';
import { useStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { isDatabaseAvailable } from '../database/db';
import type { DailyStat, OverallStat, Transaction, Wallet } from '../database/queries';
import { formatVND, formatVNDShort } from '../common/formatters';
import { Colors, FontSizes, Radii, Spacing } from '../common/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = 'day' | 'week';

interface ChartDataPoint {
    label: string;
    income: number;
    expense: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_SIDE_PAD = Spacing.md * 2 + Spacing.lg * 2;
const CHART_WIDTH = SCREEN_WIDTH - CHART_SIDE_PAD;
const CHART_HEIGHT = 200;
const VALUE_LABEL_HEIGHT = 22;
const X_LABEL_HEIGHT = 22;
const BAR_AREA_HEIGHT = CHART_HEIGHT - VALUE_LABEL_HEIGHT - X_LABEL_HEIGHT;

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

const PULSE_DURATION = 1200;

const usePulseAnimation = () => {
    const pulse = useRef(new Animated.Value(0.3)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 0.7,
                    duration: PULSE_DURATION,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulse, {
                    toValue: 0.3,
                    duration: PULSE_DURATION,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, [pulse]);
    return pulse;
};

const SkeletonBar: React.FC<{
    width: number | string;
    height: number;
    borderRadius?: number;
    style?: object;
}> = React.memo(({ width, height, borderRadius = 8, style }) => {
    const pulse = usePulseAnimation();
    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height,
                    borderRadius,
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    opacity: pulse,
                },
                style,
            ]}
        />
    );
});

const StatsSkeleton: React.FC = () => (
    <View style={skStyles.container}>
        {/* Period tabs */}
        <View style={skStyles.periodRow}>
            <SkeletonBar width="48%" height={44} borderRadius={14} />
            <SkeletonBar width="48%" height={44} borderRadius={14} />
        </View>

        {/* Summary card */}
        <View style={skStyles.summaryCard}>
            <View style={skStyles.summaryRow}>
                <View style={skStyles.summaryCol}>
                    <SkeletonBar width="50%" height={12} style={{ marginBottom: 8 }} />
                    <SkeletonBar width="80%" height={24} />
                </View>
                <View style={[skStyles.summaryCol, { alignItems: 'flex-end' }]}>
                    <SkeletonBar width="50%" height={12} style={{ marginBottom: 8 }} />
                    <SkeletonBar width="80%" height={24} />
                </View>
            </View>
            <View style={skStyles.divider} />
            <SkeletonBar width="40%" height={12} style={{ marginBottom: 6 }} />
            <SkeletonBar width="65%" height={20} />
        </View>

        {/* Chart */}
        <View style={skStyles.chartCard}>
            <SkeletonBar width="30%" height={14} style={{ marginBottom: 20 }} />
            <View style={skStyles.chartBars}>
                {[0.6, 0.4, 0.8, 0.3, 0.7, 0.5, 0.9].map((h, i) => (
                    <View key={i} style={{ alignItems: 'center', flex: 1, gap: 3 }}>
                        <SkeletonBar width={14} height={BAR_AREA_HEIGHT * h} borderRadius={7} />
                        <SkeletonBar width={14} height={BAR_AREA_HEIGHT * (1 - h) * 0.6 + 15} borderRadius={7} />
                    </View>
                ))}
            </View>
        </View>

        {/* Transaction list */}
        <SkeletonBar width="35%" height={13} style={{ marginBottom: 16 }} />
        {[1, 2, 3, 4, 5].map(i => (
            <View key={i} style={skStyles.txItem}>
                <View style={skStyles.txItemLeft}>
                    <SkeletonBar width="60%" height={14} />
                    <SkeletonBar width="40%" height={10} style={{ marginTop: 6 }} />
                </View>
                <SkeletonBar width={72} height={16} borderRadius={6} />
            </View>
        ))}
    </View>
);

const skStyles = StyleSheet.create({
    container: { paddingHorizontal: Spacing.md, paddingTop: 12 },
    periodRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.lg },
    summaryCard: {
        backgroundColor: '#1C1C1E',
        borderRadius: 24,
        padding: Spacing.lg,
        paddingTop: Spacing.xl,
        marginBottom: Spacing.lg,
        alignItems: 'center',
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    summaryCol: { flex: 1 },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        marginVertical: 16,
    },
    chartCard: {
        backgroundColor: '#1C1C1E',
        borderRadius: 24,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    chartBars: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: BAR_AREA_HEIGHT,
    },
    txItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    },
    txItemLeft: { flex: 1, marginRight: 12 },
});

// (PeriodSelector removed in favor of LiquidSegmentedControl)

// ─── Summary Section ──────────────────────────────────────────────────────────

const AnimatedSlidingText: React.FC<{
    text: string;
    style: any;
    adjustsFontSizeToFit?: boolean;
    numberOfLines?: number;
}> = React.memo(({ text, style, adjustsFontSizeToFit, numberOfLines }) => {
    const [displayText, setDisplayText] = useState(text);
    const animX = useRef(new Animated.Value(0)).current;
    const animOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (text === displayText) return;

        Animated.parallel([
            Animated.timing(animX, {
                toValue: -20,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(animOpacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setDisplayText(text);
            animX.setValue(-20);
            
            Animated.parallel([
                Animated.timing(animX, {
                    toValue: 0,
                    duration: 300,
                    easing: Easing.out(Easing.back(1.5)),
                    useNativeDriver: true,
                }),
                Animated.timing(animOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    }, [text, displayText, animX, animOpacity]);

    return (
        <Animated.Text 
            style={[style, { opacity: animOpacity, transform: [{ translateX: animX }] }]}
            adjustsFontSizeToFit={adjustsFontSizeToFit}
            numberOfLines={numberOfLines}
        >
            {displayText}
        </Animated.Text>
    );
});

const SummarySection: React.FC<{
    totalIn: number;
    totalOut: number;
}> = React.memo(({ totalIn, totalOut }) => {
    const balance = totalIn - totalOut;
    return (
        <AppleGlassBackground style={sumStyles.card} borderRadius={24} variant="chromeMaterial">
            <View style={sumStyles.inner}>
                {/* Main Metric - Chênh lệch */}
                <View style={{ alignItems: 'center', marginBottom: Spacing.md }}>
                    <Text style={sumStyles.balanceLabel}>Chênh lệch</Text>
                    <AnimatedSlidingText
                        text={`${balance >= 0 ? '+' : '-'}${formatVND(Math.abs(balance))}`}
                        style={[
                            sumStyles.balanceValue,
                            { color: balance >= 0 ? Colors.income : Colors.expense },
                        ]}
                        adjustsFontSizeToFit={true}
                        numberOfLines={1}
                    />
                </View>

                <View style={sumStyles.divider} />

                {/* Secondary Metrics - Thu / Chi */}
                <View style={sumStyles.row}>
                    <View style={sumStyles.col}>
                        <View style={sumStyles.labelRow}>
                            <View style={[sumStyles.dot, { backgroundColor: Colors.income }]} />
                            <Text style={sumStyles.label} adjustsFontSizeToFit numberOfLines={1}>Thu nhập</Text>
                        </View>
                        <AnimatedSlidingText
                            text={`+${formatVND(totalIn)}`}
                            style={[sumStyles.value, { color: Colors.income }]}
                            adjustsFontSizeToFit={true}
                            numberOfLines={1}
                        />
                    </View>
                    <View style={sumStyles.separator} />
                    <View style={[sumStyles.col, { alignItems: 'flex-end' }]}>
                        <View style={[sumStyles.labelRow, { justifyContent: 'flex-end' }]}>
                            <View style={[sumStyles.dot, { backgroundColor: Colors.expense }]} />
                            <Text style={sumStyles.label} adjustsFontSizeToFit numberOfLines={1}>Chi tiêu</Text>
                        </View>
                        <AnimatedSlidingText
                            text={`-${formatVND(totalOut)}`}
                            style={[sumStyles.value, { color: Colors.expense }]}
                            adjustsFontSizeToFit={true}
                            numberOfLines={1}
                        />
                    </View>
                </View>
            </View>
        </AppleGlassBackground>
    );
});

const sumStyles = StyleSheet.create({
    card: { 
        marginBottom: Spacing.lg,
        borderRadius: 24,
    },
    inner: { padding: Spacing.lg, paddingTop: Spacing.xl },
    row: { flexDirection: 'row', alignItems: 'flex-start' },
    col: { flex: 1 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    label: { fontSize: FontSizes.sm, fontWeight: '500', color: 'rgba(255, 255, 255, 0.6)' },
    separator: {
        width: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        alignSelf: 'stretch',
        marginHorizontal: Spacing.md,
    },
    value: { fontSize: FontSizes.lg + 2, fontWeight: '700', letterSpacing: -0.5 },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginVertical: Spacing.md,
    },
    balanceLabel: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
        marginBottom: 8,
    },
    balanceValue: { fontSize: 40, fontWeight: '800', letterSpacing: -1 },
});

// ─── Bar Chart — Values on top, no grid lines ─────────────────────────────────

const BarChart: React.FC<{
    data: ChartDataPoint[];
    period: Period;
}> = React.memo(({ data, period }) => {
    // Hold displayed data to animate old data OUT before swapping to new data IN
    const [displayData, setDisplayData] = useState(data);

    // Scale animation for bars dropping and growing
    const barScale = useRef(new Animated.Value(0)).current;
    
    // Fade animation for X-axis labels to transition smoothly
    const labelsFade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Run initial mount animation
        Animated.parallel([
            Animated.spring(barScale, {
                toValue: 1,
                damping: 14,
                stiffness: 120,
                useNativeDriver: true,
            }),
            Animated.timing(labelsFade, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    useEffect(() => {
        if (data === displayData) return;

        // Sequence: Drop down -> Swap -> Grow up
        Animated.parallel([
            Animated.timing(barScale, {
                toValue: 0,
                duration: 250,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(labelsFade, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            })
        ]).start(() => {
            // Swap data
            setDisplayData(data);
            
            // Wait a tiny bit to ensure JS paints the swap, then grow up gracefully
            setTimeout(() => {
                Animated.parallel([
                    Animated.spring(barScale, {
                        toValue: 1,
                        damping: 14,
                        stiffness: 110,
                        useNativeDriver: true,
                    }),
                    Animated.timing(labelsFade, {
                        toValue: 1,
                        duration: 350,
                        useNativeDriver: true,
                    })
                ]).start();
            }, 50);
        });
    }, [data, barScale, labelsFade]);

    const maxVal = Math.max(
        ...displayData.map(d => Math.max(d.income, d.expense)),
        1,
    );

    const hasData = displayData.some(d => d.income > 0 || d.expense > 0);

    const groupCount = displayData.length;
    const groupWidth = CHART_WIDTH / groupCount;
    // Derive period from data length (2 for day, 7 for week)
    const isDayView = groupCount <= 2;
    const barGap = isDayView ? 16 : 4;
    const maxBarWidth = isDayView ? 60 : 18;
    const barWidth = Math.min(
        Math.max(Math.floor((groupWidth - barGap * 3) / 2), 10),
        maxBarWidth,
    );
    const barRadius = Math.min(barWidth / 2, 8);

    return (
        <AppleGlassBackground style={chStyles.card} borderRadius={24} variant="chromeMaterial">
            <View style={chStyles.inner}>
                <Text style={chStyles.title}>Dòng tiền</Text>

                <View style={{ height: CHART_HEIGHT, position: 'relative' }}>
                    {!hasData ? (
                        <Animated.View style={[chStyles.emptyChart, { opacity: labelsFade }]}>
                            <Text style={chStyles.emptyText}>Chưa có dữ liệu</Text>
                        </Animated.View>
                    ) : (
                        <>
                            {/* BARS STATIC SVG BACKGROUND DEFINITIONS & X-AXIS LABELS */}
                            <Animated.View style={{ position: 'absolute', top: 0, left: 0, opacity: labelsFade }}>
                                <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                                    {/* Only Render X-Axis Labels Here to Prevent Distortion */}
                                    {displayData.map((d, i) => {
                                        const cx = i * groupWidth + groupWidth / 2;
                                        return (
                                            <SvgText
                                                key={`lbl-${i}`}
                                                x={cx}
                                                y={CHART_HEIGHT - 4}
                                                fontSize={11}
                                                fill="rgba(255,255,255,0.40)"
                                                fontWeight="600"
                                                textAnchor="middle">
                                                {d.label}
                                            </SvgText>
                                        );
                                    })}
                                </Svg>
                            </Animated.View>

                            {/* BARS & VALUE LABELS (SCALING LAYER) */}
                            <Animated.View style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                transform: [{ scaleY: barScale }],
                                transformOrigin: 'bottom',
                            }}>
                                <Svg width={CHART_WIDTH} height={CHART_HEIGHT - X_LABEL_HEIGHT}>
                                    <Defs>
                                        <LinearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                                            <Stop offset="0" stopColor={Colors.income} stopOpacity="1" />
                                            <Stop offset="1" stopColor={Colors.income} stopOpacity="0.3" />
                                        </LinearGradient>
                                        <LinearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                                            <Stop offset="0" stopColor={Colors.expense} stopOpacity="1" />
                                            <Stop offset="1" stopColor={Colors.expense} stopOpacity="0.3" />
                                        </LinearGradient>
                                    </Defs>

                                    {displayData.map((d, i) => {
                                        const cx = i * groupWidth + groupWidth / 2;
                                        
                                        // For Day view, group 0 is 'Thu', group 1 is 'Chi'.
                                        // For Week view, each group is a day and has BOTH.
                                        const shouldRenderIn = isDayView ? d.label === 'Thu' : true;
                                        const shouldRenderOut = isDayView ? d.label === 'Chi' : true;

                                        const rawInH = maxVal > 0 ? (d.income / maxVal) * BAR_AREA_HEIGHT : 0;
                                        const rawOutH = maxVal > 0 ? (d.expense / maxVal) * BAR_AREA_HEIGHT : 0;
                                        
                                        // Always render a minimum 4px bar if it should exist, even for 0 values.
                                        const inH = shouldRenderIn ? Math.max(rawInH, 4) : 0;
                                        const outH = shouldRenderOut ? Math.max(rawOutH, 4) : 0;

                                        // In Day view, since there's only 1 bar per group, center it.
                                        // In Week view, always keep Income left and Expense right.
                                        const inBarX = isDayView ? cx - barWidth / 2 : cx - barWidth - barGap / 2;
                                        const outBarX = isDayView ? cx - barWidth / 2 : cx + barGap / 2;
                                        
                                        // Ensure labels and bars exist rigidly inside the frame
                                        const inBarY = VALUE_LABEL_HEIGHT + BAR_AREA_HEIGHT - inH;
                                        const outBarY = VALUE_LABEL_HEIGHT + BAR_AREA_HEIGHT - outH;

                                        return (
                                            <React.Fragment key={`bar-${i}`}>
                                                {shouldRenderIn && (
                                                    <>
                                                        <SvgText
                                                            x={inBarX + barWidth / 2}
                                                            y={inBarY - 6}
                                                            fontSize={10}
                                                            fill={Colors.income}
                                                            fontWeight="700"
                                                            textAnchor="middle"
                                                            opacity={d.income === 0 ? 0.3 : 0.9}>
                                                            {formatVNDShort(d.income)}
                                                        </SvgText>
                                                        <Rect
                                                            x={inBarX}
                                                            y={inBarY}
                                                            width={barWidth}
                                                            height={inH}
                                                            rx={barRadius}
                                                            fill="url(#incG)"
                                                            opacity={d.income === 0 ? 0.2 : 1}
                                                        />
                                                    </>
                                                )}
                                                {shouldRenderOut && (
                                                    <>
                                                        <SvgText
                                                            x={outBarX + barWidth / 2}
                                                            y={outBarY - 6}
                                                            fontSize={10}
                                                            fill={Colors.expense}
                                                            fontWeight="700"
                                                            textAnchor="middle"
                                                            opacity={d.expense === 0 ? 0.3 : 0.8}>
                                                            {formatVNDShort(d.expense)}
                                                        </SvgText>
                                                        <Rect
                                                            x={outBarX}
                                                            y={outBarY}
                                                            width={barWidth}
                                                            height={outH}
                                                            rx={barRadius}
                                                            fill="url(#expG)"
                                                            opacity={d.expense === 0 ? 0.2 : 1}
                                                        />
                                                    </>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </Svg>
                            </Animated.View>
                        </>
                    )}
                </View>

                {/* Legend */}
                <View style={chStyles.legend}>
                    <View style={chStyles.legendItem}>
                        <View style={[chStyles.legendDot, { backgroundColor: Colors.income }]} />
                        <Text style={chStyles.legendText}>Thu</Text>
                    </View>
                    <View style={chStyles.legendItem}>
                        <View style={[chStyles.legendDot, { backgroundColor: Colors.expense }]} />
                        <Text style={chStyles.legendText}>Chi</Text>
                    </View>
                </View>
            </View>
        </AppleGlassBackground>
    );
});

const chStyles = StyleSheet.create({
    card: { 
        marginBottom: Spacing.lg,
        borderRadius: 24,
    },
    inner: { padding: Spacing.lg },
    title: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: Spacing.md,
    },
    emptyChart: {
        height: CHART_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        width: '100%',
        top: 0,
    },
    emptyText: {
        fontSize: FontSizes.sm,
        color: 'rgba(255, 255, 255, 0.20)',
        fontWeight: '500',
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.lg,
        marginTop: Spacing.md,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: {
        fontSize: FontSizes.xs + 1,
        color: 'rgba(255, 255, 255, 0.40)',
        fontWeight: '500',
    },
});

// ─── Wallet Filter Chips ──────────────────────────────────────────────────────

const WalletChips: React.FC<{
    wallets: Wallet[];
    selectedId?: string;
    onSelect: (id?: string) => void;
}> = React.memo(({ wallets, selectedId, onSelect }) => {

    const activeId = selectedId || 'ALL';
    const items = useMemo(() => {
        return [{ id: 'ALL', name: 'Tất cả' }, ...wallets];
    }, [wallets]);

    const [layouts, setLayouts] = useState<Record<string, { x: number, width: number }>>({});
    const animX = useRef(new Animated.Value(0)).current;
    const animW = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const layout = layouts[activeId];
        if (layout) {
            Animated.spring(animX, {
                toValue: layout.x,
                useNativeDriver: false,
                friction: 12,
                tension: 100,
            }).start();
            Animated.spring(animW, {
                toValue: layout.width,
                useNativeDriver: false,
                friction: 12,
                tension: 100,
            }).start();
        }
    }, [activeId, layouts, animX, animW]);

    if (wallets.length <= 1) { return null; }

    return (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={wcStyles.scrollWrapper} 
            contentContainerStyle={wcStyles.container}
        >
            <View style={{ flexDirection: 'row', gap: 8 }}>
                {items.map(w => {
                    const isSelected = activeId === w.id;
                    return (
                        <Pressable 
                            key={w.id} 
                            onPress={() => onSelect(w.id === 'ALL' ? undefined : w.id)}
                            style={[
                                wcStyles.chip,
                                { backgroundColor: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)' }
                            ]}
                        >
                            <Text style={[
                                wcStyles.chipText,
                                { color: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }
                            ]}>
                                {w.name}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </ScrollView>
    );
});

const wcStyles = StyleSheet.create({
    scrollWrapper: { flexGrow: 0, marginBottom: Spacing.lg },
    container: { },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    chipText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
});

// ─── Main Component ───────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

const StatsScreen: React.FC = () => {
    const insets = useSafeAreaInsets();

    // ── Loading state ──────────────────────────────────────────────────────
    const [isReady, setIsReady] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const contentOpacity = useRef(new Animated.Value(0)).current;

    // ── Data state ─────────────────────────────────────────────────────────
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>(undefined);
    const [period, setPeriod] = useState<Period>('day');
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [overallStats, setOverallStats] = useState<OverallStat>({
        totalIn: 0, totalOut: 0, txCount: 0,
    });
    const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
    
    // Pagination states
    const [txOffset, setTxOffset] = useState(0);
    const [hasMoreTx, setHasMoreTx] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [refreshing, setRefreshing] = useState(false);
    const [viewingTx, setViewingTx] = useState<Transaction | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);

    const { editTransaction, removeTransaction } = useStore(useShallow(state => ({
        editTransaction: state.editTransaction,
        removeTransaction: state.removeTransaction
    })));

    // ── Load data ──────────────────────────────────────────────────────────
    const loadData = useCallback((wId?: string, p: Period = 'day') => {
        if (!isDatabaseAvailable()) { return; }
        try {
            const {
                getAllWallets,
                getDailyStats,
                getOverallStats: getOvr,
                getRecentTransactions,
            } = require('../database/queries');

            setWallets(getAllWallets());
            setOverallStats(getOvr(wId));
            
            setTxOffset(0);
            const newTxns = getRecentTransactions(12, 0, wId);
            setRecentTxns(newTxns);
            setHasMoreTx(newTxns.length === 12);

            let points: ChartDataPoint[] = [];

            if (p === 'day') {
                // Day view: 1 day → 2 bar groups (Thu and Chi)
                const daily: DailyStat[] = getDailyStats(wId, 1);
                const today = daily.length > 0 ? daily[daily.length - 1] : null;
                points = [
                    { label: 'Thu', income: today?.totalIn ?? 0, expense: 0 },
                    { label: 'Chi', income: 0, expense: today?.totalOut ?? 0 },
                ];
            } else {
                // Week view: Mon-Sun
                const now = new Date();
                const todayDay = now.getDay();
                const diffToMonday = todayDay === 0 ? 6 : todayDay - 1;
                const monday = new Date(
                    now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday,
                );
                const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
                const allDays: DailyStat[] = getDailyStats(wId, 7, sunday);
                const dayMap = new Map<string, DailyStat>();
                for (const d of allDays) { dayMap.set(d.date, d); }

                const DAY_NAMES = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
                for (let i = 0; i < 7; i++) {
                    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const dd = String(d.getDate()).padStart(2, '0');
                    const dateStr = `${d.getFullYear()}-${mm}-${dd}`;
                    const stat = dayMap.get(dateStr);
                    points.push({
                        label: DAY_NAMES[i],
                        income: stat?.totalIn ?? 0,
                        expense: stat?.totalOut ?? 0,
                    });
                }
            }

            setChartData(points);
        } catch (err) {
            console.warn('[Stats] Failed to load:', err);
        }
    }, []);

    // ── Initial load with skeleton ─────────────────────────────────────────
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            await new Promise<void>(resolve => {
                InteractionManager.runAfterInteractions(() => resolve());
            });

            loadData(selectedWalletId, period);
            await delay(500);

            if (mounted) {
                setIsReady(true);
                setTimeout(() => {
                    if (mounted) {
                        setShowContent(true);
                        Animated.timing(contentOpacity, {
                            toValue: 1,
                            duration: 300,
                            useNativeDriver: true,
                        }).start();
                    }
                }, 50);
            }
        };

        init();
        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Reload on filter/period change — no re-mount, no jump ──────────────
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        // Delay loadData by 50ms so user touches and animations (e.g. LiquidButton ripple) process first
        const t = setTimeout(() => {
            loadData(selectedWalletId, period);
        }, 50);
        return () => clearTimeout(t);
    }, [loadData, selectedWalletId, period]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData(selectedWalletId, period);
        setRefreshing(false);
    }, [loadData, selectedWalletId, period]);

    // ── Pagination Handlers ────────────────────────────────────────────────
    const loadMoreTxns = useCallback(() => {
        if (!hasMoreTx || isLoadingMore || !isDatabaseAvailable()) return;
        setIsLoadingMore(true);
        
        // Defer load block logic
        setTimeout(() => {
            try {
                const { getRecentTransactions } = require('../database/queries');
                const nextOffset = txOffset + 12;
                const newTxns = getRecentTransactions(12, nextOffset, selectedWalletId);
                
                if (newTxns.length > 0) {
                    setRecentTxns(prev => {
                        const existingIds = new Set(prev.map(t => t.id));
                        const uniqueNew = newTxns.filter((t: Transaction) => !existingIds.has(t.id));
                        return [...prev, ...uniqueNew];
                    });
                    setTxOffset(nextOffset);
                }
                
                if (newTxns.length < 12) {
                    setHasMoreTx(false);
                }
            } catch (err) {
                console.warn('[Stats] Failed to load more txns:', err);
            } finally {
                setIsLoadingMore(false);
            }
        }, 50);
    }, [hasMoreTx, isLoadingMore, txOffset, selectedWalletId]);

    const handleScroll = useCallback((event: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 100;
        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            loadMoreTxns();
        }
    }, [loadMoreTxns]);

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleViewTransaction = useCallback((tx: Transaction) => {
        setViewingTx(tx);
    }, []);

    const handleGoBackFromDetail = useCallback(() => {
        setViewingTx(null);
    }, []);

    const handleOpenEditTransaction = useCallback(() => {
        if (viewingTx) {
            setEditingTx(viewingTx);
            setViewingTx(null); // Close detail overlay
            setModalVisible(true); // Open edit modal
        }
    }, [viewingTx]);

    const handleSaveTransaction = useCallback(
        (type: 'IN' | 'OUT', amount: number, reason?: string | null, imageUri?: string | null) => {
            if (editingTx) {
                editTransaction(editingTx.id, editingTx.wallet_id, type, amount, reason, imageUri);
                setModalVisible(false);
                setEditingTx(null);
                loadData(selectedWalletId, period);
            }
        },
        [editingTx, editTransaction, loadData, selectedWalletId, period],
    );

    const handleDeleteFromDetail = useCallback(
        (id: string, wId: string) => {
            removeTransaction(id, wId);
            setViewingTx(null);
            loadData(selectedWalletId, period);
        },
        [removeTransaction, loadData, selectedWalletId, period],
    );
    const periodTotalIn = useMemo(() => chartData.reduce((sum, d) => sum + d.income, 0), [chartData]);
    const periodTotalOut = useMemo(() => chartData.reduce((sum, d) => sum + d.expense, 0), [chartData]);

    // ── Render ─────────────────────────────────────────────────────────────

    if (!isDatabaseAvailable()) {
        return (
            <View style={[s.container, { paddingTop: insets.top + 16 }, s.center]}>
                <Text style={s.dbError}>Database chưa sẵn sàng</Text>
            </View>
        );
    }

    return (
        <View style={[s.container, { paddingTop: insets.top + 8 }]}>
            {!isReady ? (
                <StatsSkeleton />
            ) : (
                <>
                    <Animated.View style={{ flex: 1, opacity: showContent ? contentOpacity : 0 }}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={s.content}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="rgba(255,255,255,0.3)"
                                colors={[Colors.cyan]}
                            />
                        }>
                        {/* Page Title */}
                        <Text style={s.pageTitle}>Thống kê</Text>

                        {/* Wallet Filter */}
                        <WalletChips
                            wallets={wallets}
                            selectedId={selectedWalletId}
                            onSelect={setSelectedWalletId}
                        />

                        {/* Period Selector */}
                        <LiquidSegmentedControl2 
                            options={[
                                { key: 'day', label: 'Hôm nay' },
                                { key: 'week', label: 'Tuần này' },
                            ]}
                            selected={period} 
                            onChange={(key) => setPeriod(key as Period)}
                            style={{ marginBottom: Spacing.lg }}
                        />

                        {/* Summary */}
                        <SummarySection
                            totalIn={periodTotalIn}
                            totalOut={periodTotalOut}
                        />

                        {/* Chart */}
                        <BarChart data={chartData} period={period} />

                        {/* Recent Transactions */}
                        {recentTxns.length > 0 ? (
                            <>
                                <View style={s.txHeader}>
                                    <Text style={s.txHeaderTitle}>Gần đây</Text>
                                    <Text style={s.txHeaderCount}>
                                        {recentTxns.length} giao dịch
                                    </Text>
                                </View>
                                <View style={{ marginTop: Spacing.xs }}>
                                    {recentTxns.map((item, index) => (
                                        <AppleTransactionRow
                                            key={item.id || index}
                                            item={{
                                                ...item,
                                                id: item.id || `stats-tx-${index}`, // Ensure id is defined
                                            }}
                                            onPress={() => handleViewTransaction(item)}
                                        />
                                    ))}
                                </View>
                            </>
                        ) : (
                            <EmptyState2
                                animation="nodata"
                                title="Chưa có giao dịch"
                                subtitle="Tạo giao dịch trong mục Ví tiền để xem thống kê"
                            />
                        )}
                    </ScrollView>
                </Animated.View>
                <TransactionDetailOverlay
                    visible={!!viewingTx}
                    transaction={viewingTx}
                    walletName="Tài khoản" // Adjust if mapping wallet ids
                    onGoBack={() => setViewingTx(null)}
                    onClose={() => setViewingTx(null)}
                    onEditRequest={handleOpenEditTransaction}
                    onDelete={handleDeleteFromDetail}
                />
                <TransactionModal
                    visible={modalVisible}
                    onClose={() => {
                        setModalVisible(false);
                        setEditingTx(null);
                    }}
                    onSave={handleSaveTransaction}
                    editData={
                        editingTx
                            ? {
                                type: editingTx.type,
                                amount: editingTx.amount,
                                reason: editingTx.reason,
                                image_uri: editingTx.image_uri,
                                date: editingTx.created_at,
                            }
                            : null
                    }
                />
                </>
            )}
        </View>
    );
};

// ─── Root Styles ──────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: Spacing.md },
    content: { paddingBottom: 120 },
    center: { alignItems: 'center', justifyContent: 'center' },
    pageTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -1,
        marginBottom: Spacing.lg,
        paddingTop: Spacing.sm,
    },
    txHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    txHeaderTitle: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.50)',
    },
    txHeaderCount: {
        fontSize: FontSizes.xs + 1,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.25)',
    },
    dbError: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.35)',
    },
});

export default StatsScreen;
