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
import GlassCard from '../components/GlassCard';
import TransactionRow from '../components/TransactionRow';
import EmptyState from '../components/EmptyState';
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
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: Radii.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
    summaryCol: { flex: 1 },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        marginVertical: 16,
    },
    chartCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: Radii.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
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

// ─── Period Selector — Liquid Glass ───────────────────────────────────────────

const PERIODS: { key: Period; label: string }[] = [
    { key: 'day', label: 'Hôm nay' },
    { key: 'week', label: 'Tuần này' },
];

const PeriodSelector: React.FC<{
    selected: Period;
    onChange: (p: Period) => void;
}> = React.memo(({ selected, onChange }) => {
    const [containerWidth, setContainerWidth] = useState(0);
    const translateX = useRef(new Animated.Value(0)).current;

    const gap = 10;
    const tabWidth = containerWidth > 0 ? (containerWidth - gap) / 2 : 0;

    useEffect(() => {
        if (tabWidth <= 0) { return; }
        const idx = PERIODS.findIndex(p => p.key === selected);
        const toValue = idx === 0 ? 0 : tabWidth + gap;
        Animated.spring(translateX, {
            toValue,
            damping: 20,
            stiffness: 180,
            mass: 0.5,
            useNativeDriver: true,
        }).start();
    }, [selected, translateX, tabWidth]);

    return (
        <View
            style={ps.container}
            onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}>
            {containerWidth > 0 && (
                <Animated.View
                    style={[
                        ps.indicator,
                        {
                            width: tabWidth,
                            transform: [{ translateX }],
                        },
                    ]}
                />
            )}
            {PERIODS.map(p => (
                <Pressable
                    key={p.key}
                    style={[ps.tab, { width: tabWidth }]}
                    onPress={() => onChange(p.key)}>
                    <Text style={[
                        ps.text,
                        selected === p.key && ps.textActive,
                    ]}>
                        {p.label}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
});

const ps = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: Spacing.lg,
        position: 'relative',
    },
    tab: {
        paddingVertical: 13,
        alignItems: 'center',
        borderRadius: Radii.md,
        zIndex: 2,
    },
    text: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.35)',
    },
    textActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    indicator: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: Radii.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        zIndex: 1,
    },
});

// ─── Summary Section ──────────────────────────────────────────────────────────

const SummarySection: React.FC<{
    totalIn: number;
    totalOut: number;
}> = React.memo(({ totalIn, totalOut }) => {
    const balance = totalIn - totalOut;
    return (
        <GlassCard
            style={sumStyles.card}
            backgroundOpacity={0.05}
            borderOpacity={0.10}
            borderRadius={Radii.xl}>
            <View style={sumStyles.inner}>
                <View style={sumStyles.row}>
                    <View style={sumStyles.col}>
                        <View style={sumStyles.labelRow}>
                            <View style={[sumStyles.dot, { backgroundColor: Colors.income }]} />
                            <Text style={sumStyles.label}>Thu nhập</Text>
                        </View>
                        <Text style={[sumStyles.value, { color: Colors.income }]}>
                            +{formatVND(totalIn)}
                        </Text>
                    </View>
                    <View style={sumStyles.separator} />
                    <View style={[sumStyles.col, { alignItems: 'flex-end' }]}>
                        <View style={[sumStyles.labelRow, { justifyContent: 'flex-end' }]}>
                            <View style={[sumStyles.dot, { backgroundColor: Colors.expense }]} />
                            <Text style={sumStyles.label}>Chi tiêu</Text>
                        </View>
                        <Text style={[sumStyles.value, { color: Colors.expense }]}>
                            -{formatVND(totalOut)}
                        </Text>
                    </View>
                </View>
                <View style={sumStyles.divider} />
                <Text style={sumStyles.balanceLabel}>Chênh lệch</Text>
                <Text style={[
                    sumStyles.balanceValue,
                    { color: balance >= 0 ? Colors.income : Colors.expense },
                ]}>
                    {balance >= 0 ? '+' : '-'}{formatVND(Math.abs(balance))}
                </Text>
            </View>
        </GlassCard>
    );
});

const sumStyles = StyleSheet.create({
    card: { marginBottom: Spacing.lg },
    inner: { padding: Spacing.lg },
    row: { flexDirection: 'row', alignItems: 'flex-start' },
    col: { flex: 1 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    label: { fontSize: FontSizes.sm, fontWeight: '500', color: 'rgba(255, 255, 255, 0.45)' },
    separator: {
        width: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        alignSelf: 'stretch',
        marginHorizontal: Spacing.md,
    },
    value: { fontSize: FontSizes.lg + 2, fontWeight: '800', letterSpacing: -0.5 },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        marginVertical: Spacing.md,
    },
    balanceLabel: {
        fontSize: FontSizes.xs + 1,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.35)',
        marginBottom: 4,
    },
    balanceValue: { fontSize: FontSizes.xl, fontWeight: '800', letterSpacing: -0.5 },
});

// ─── Bar Chart — Values on top, no grid lines ─────────────────────────────────

const BarChart: React.FC<{
    data: ChartDataPoint[];
    period: Period;
}> = React.memo(({ data, period }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [data, fadeAnim]);

    const maxVal = Math.max(
        ...data.map(d => Math.max(d.income, d.expense)),
        1,
    );

    const hasData = data.some(d => d.income > 0 || d.expense > 0);

    const groupCount = data.length;
    const groupWidth = CHART_WIDTH / groupCount;
    const barGap = period === 'day' ? 16 : 4;
    const maxBarWidth = period === 'day' ? 60 : 18;
    const barWidth = Math.min(
        Math.max(Math.floor((groupWidth - barGap * 3) / 2), 10),
        maxBarWidth,
    );
    const barRadius = Math.min(barWidth / 2, 8);

    return (
        <GlassCard
            style={chStyles.card}
            backgroundOpacity={0.04}
            borderOpacity={0.08}
            borderRadius={Radii.xl}>
            <View style={chStyles.inner}>
                <Text style={chStyles.title}>Dòng tiền</Text>

                {!hasData ? (
                    <View style={chStyles.emptyChart}>
                        <Text style={chStyles.emptyText}>Chưa có dữ liệu</Text>
                    </View>
                ) : (
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
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

                            {data.map((d, i) => {
                                const cx = i * groupWidth + groupWidth / 2;
                                const rawInH = (d.income / maxVal) * BAR_AREA_HEIGHT;
                                const rawOutH = (d.expense / maxVal) * BAR_AREA_HEIGHT;
                                const inH = d.income > 0 ? Math.max(rawInH, 6) : 0;
                                const outH = d.expense > 0 ? Math.max(rawOutH, 6) : 0;

                                // Single-bar group: center the bar under the label
                                const isSingleBar = (inH > 0 && outH === 0) || (outH > 0 && inH === 0);

                                // Position bars: centered for single, paired for dual
                                const inBarX = isSingleBar
                                    ? cx - barWidth / 2
                                    : cx - barWidth - barGap / 2;
                                const outBarX = isSingleBar
                                    ? cx - barWidth / 2
                                    : cx + barGap / 2;
                                const inBarY = VALUE_LABEL_HEIGHT + BAR_AREA_HEIGHT - inH;
                                const outBarY = VALUE_LABEL_HEIGHT + BAR_AREA_HEIGHT - outH;

                                return (
                                    <React.Fragment key={i}>
                                        {/* Income bar + value label */}
                                        {inH > 0 && (
                                            <>
                                                <SvgText
                                                    x={inBarX + barWidth / 2}
                                                    y={inBarY - 6}
                                                    fontSize={10}
                                                    fill={Colors.income}
                                                    fontWeight="700"
                                                    textAnchor="middle"
                                                    opacity={0.9}>
                                                    {formatVNDShort(d.income)}
                                                </SvgText>
                                                <Rect
                                                    x={inBarX}
                                                    y={inBarY}
                                                    width={barWidth}
                                                    height={inH}
                                                    rx={barRadius}
                                                    fill="url(#incG)"
                                                />
                                            </>
                                        )}
                                        {/* Expense bar + value label */}
                                        {outH > 0 && (
                                            <>
                                                <SvgText
                                                    x={outBarX + barWidth / 2}
                                                    y={outBarY - 6}
                                                    fontSize={10}
                                                    fill={Colors.expense}
                                                    fontWeight="700"
                                                    textAnchor="middle"
                                                    opacity={0.8}>
                                                    {formatVNDShort(d.expense)}
                                                </SvgText>
                                                <Rect
                                                    x={outBarX}
                                                    y={outBarY}
                                                    width={barWidth}
                                                    height={outH}
                                                    rx={barRadius}
                                                    fill="url(#expG)"
                                                />
                                            </>
                                        )}

                                        {/* X-axis label */}
                                        <SvgText
                                            x={cx}
                                            y={CHART_HEIGHT - 4}
                                            fontSize={11}
                                            fill="rgba(255,255,255,0.40)"
                                            fontWeight="600"
                                            textAnchor="middle">
                                            {d.label}
                                        </SvgText>
                                    </React.Fragment>
                                );
                            })}
                        </Svg>
                    </Animated.View>
                )}

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
        </GlassCard>
    );
});

const chStyles = StyleSheet.create({
    card: { marginBottom: Spacing.lg },
    inner: { padding: Spacing.lg },
    title: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: Spacing.md,
    },
    emptyChart: {
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
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
    if (wallets.length <= 1) { return null; }

    return (
        <View style={wcStyles.container}>
            <Pressable
                onPress={() => onSelect(undefined)}
                style={[wcStyles.chip, !selectedId && wcStyles.chipActive]}>
                <Text style={[wcStyles.text, !selectedId && wcStyles.textActive]}>Tất cả</Text>
            </Pressable>
            {wallets.map(w => (
                <Pressable
                    key={w.id}
                    onPress={() => onSelect(w.id)}
                    style={[wcStyles.chip, selectedId === w.id && wcStyles.chipActive]}>
                    <Text style={[wcStyles.text, selectedId === w.id && wcStyles.textActive]}>
                        {w.name}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
});

const wcStyles = StyleSheet.create({
    container: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    chipActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.10)',
        borderColor: 'rgba(255, 255, 255, 0.20)',
    },
    text: { fontSize: FontSizes.sm, fontWeight: '600', color: 'rgba(255, 255, 255, 0.35)' },
    textActive: { color: '#FFFFFF' },
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
    const [refreshing, setRefreshing] = useState(false);

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
            setRecentTxns(getRecentTransactions(20, wId));

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
                const allDays: DailyStat[] = getDailyStats(wId, 7);
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
        loadData(selectedWalletId, period);
    }, [loadData, selectedWalletId, period]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData(selectedWalletId, period);
        setRefreshing(false);
    }, [loadData, selectedWalletId, period]);

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
                <Animated.View style={{ flex: 1, opacity: showContent ? contentOpacity : 0 }}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={s.content}
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
                        <PeriodSelector selected={period} onChange={setPeriod} />

                        {/* Summary */}
                        <SummarySection
                            totalIn={overallStats.totalIn}
                            totalOut={overallStats.totalOut}
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
                                {recentTxns.map(tx => (
                                    <TransactionRow key={tx.id} item={tx} variant="flat" />
                                ))}
                            </>
                        ) : (
                            <EmptyState
                                animation="nodata"
                                title="Chưa có giao dịch"
                                subtitle="Tạo giao dịch trong mục Ví tiền để xem thống kê"
                            />
                        )}
                    </ScrollView>
                </Animated.View>
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
