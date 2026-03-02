/**
 * StatsScreen.tsx — Statistics screen for income/expenses
 * Clean 4-color design, Daily/Weekly periods
 * SVG bar chart, summary cards, recent transactions
 *
 * Refactored: Uses shared formatters, theme tokens, TransactionRow, EmptyState.
 * Added React.memo to SummaryCard and PeriodTabs.
 * Removed unused MONTH_LABELS and getMonthLabel.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';
import GlassCard from '../components/GlassCard';
import TransactionRow from '../components/TransactionRow';
import EmptyState from '../components/EmptyState';
import { isDatabaseAvailable } from '../database/db';
import type { DailyStat, OverallStat, Transaction, Wallet } from '../database/queries';
import { formatVNDShort } from '../common/formatters';
import { Colors, FontSizes, Radii, Spacing } from '../common/theme';
import {
    ArrowDownLeft,
    ArrowUpRight,
    BarChart3,
    TrendingDown,
    TrendingUp,
    AlertTriangle,
    Wallet as WalletIcon,
} from 'lucide-react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = 'day' | 'week';

interface ChartDataPoint {
    label: string;
    income: number;
    expense: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDayLabel(dateStr: string): string {
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}`;
}

// ─── Period Tab ───────────────────────────────────────────────────────────────

const PERIODS: { key: Period; label: string }[] = [
    { key: 'day', label: 'Ngày' },
    { key: 'week', label: 'Tuần' },
];

const PeriodTabs: React.FC<{
    selected: Period;
    onChange: (p: Period) => void;
}> = React.memo(({ selected, onChange }) => {
    const initialIdx = PERIODS.findIndex(p => p.key === selected);
    const indicatorAnim = useRef(new Animated.Value(initialIdx >= 0 ? initialIdx : 0)).current;

    useEffect(() => {
        const idx = PERIODS.findIndex(p => p.key === selected);
        Animated.spring(indicatorAnim, {
            toValue: idx,
            damping: 20,
            stiffness: 200,
            useNativeDriver: false,
        }).start();
    }, [selected, indicatorAnim]);

    const tabCount = PERIODS.length;
    const widthPercent = 100 / tabCount;

    return (
        <View style={s.periodContainer}>
            <Animated.View
                style={[
                    s.periodIndicator,
                    {
                        width: `${widthPercent}%`,
                        left: indicatorAnim.interpolate({
                            inputRange: PERIODS.map((_, i) => i),
                            outputRange: PERIODS.map((_, i) => `${i * widthPercent}%`),
                        }),
                    },
                ]}
            />
            {PERIODS.map(p => (
                <Pressable
                    key={p.key}
                    style={s.periodTab}
                    onPress={() => onChange(p.key)}>
                    <Text style={[
                        s.periodText,
                        selected === p.key && s.periodTextActive,
                    ]}>
                        {p.label}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
});

// ─── Summary Card ─────────────────────────────────────────────────────────────

const SummaryCard: React.FC<{
    label: string;
    value: number;
    color: string;
    icon: React.ReactNode;
    prefix?: string;
}> = React.memo(({ label, value, color, icon, prefix = '' }) => (
    <View style={s.summaryCard}>
        <View style={[s.summaryIconBg, { backgroundColor: `${color}15` }]}>
            {icon}
        </View>
        <Text style={s.summaryLabel}>{label}</Text>
        <Text style={[s.summaryValue, { color }]} numberOfLines={1}>
            {prefix}{formatVNDShort(value)}
        </Text>
    </View>
));

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────

const CHART_HEIGHT = 160;
const BAR_GAP = 3;

const MiniBarChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => {
    const chartWidth = Math.max(data.length * 46, 200);
    const maxVal = Math.max(
        ...data.map(d => Math.max(d.income, d.expense)),
        1,
    );

    const barWidth = Math.max(
        Math.floor((chartWidth / data.length - BAR_GAP * 3) / 2),
        8,
    );

    return (
        <View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 4 }}>
                <Svg width={chartWidth} height={CHART_HEIGHT + 24}>
                    {data.map((d, i) => {
                        const groupX = i * (chartWidth / data.length);
                        const centerX = groupX + (chartWidth / data.length) / 2;
                        const inH = (d.income / maxVal) * CHART_HEIGHT;
                        const outH = (d.expense / maxVal) * CHART_HEIGHT;

                        return (
                            <React.Fragment key={i}>
                                <Rect
                                    x={centerX - barWidth - BAR_GAP / 2}
                                    y={CHART_HEIGHT - inH}
                                    width={barWidth}
                                    height={Math.max(inH, 2)}
                                    rx={4}
                                    fill={Colors.income}
                                    opacity={0.85}
                                />
                                <Rect
                                    x={centerX + BAR_GAP / 2}
                                    y={CHART_HEIGHT - outH}
                                    width={barWidth}
                                    height={Math.max(outH, 2)}
                                    rx={4}
                                    fill={Colors.expense}
                                    opacity={0.85}
                                />
                            </React.Fragment>
                        );
                    })}
                </Svg>
            </ScrollView>

            {/* X Axis Labels */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 4 }}>
                <View style={{ width: chartWidth, flexDirection: 'row' }}>
                    {data.map((d, i) => (
                        <View
                            key={i}
                            style={{
                                width: chartWidth / data.length,
                                alignItems: 'center',
                            }}>
                            <Text style={s.chartXLabel}>{d.label}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Legend */}
            <View style={s.chartLegend}>
                <View style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: Colors.income }]} />
                    <Text style={s.legendText}>Thu</Text>
                </View>
                <View style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: Colors.expense }]} />
                    <Text style={s.legendText}>Chi</Text>
                </View>
                <Text style={s.legendMax}>Max: {formatVNDShort(maxVal)}</Text>
            </View>
        </View>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const StatsScreen: React.FC = () => {
    const insets = useSafeAreaInsets();

    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>(undefined);
    const [period, setPeriod] = useState<Period>('day');
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [overallStats, setOverallStats] = useState<OverallStat>({
        totalIn: 0, totalOut: 0, txCount: 0,
    });
    const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = useCallback((wId?: string, p: Period = 'day') => {
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
            setRecentTxns(getRecentTransactions(15, wId));

            let points: ChartDataPoint[] = [];

            if (p === 'day') {
                const daily: DailyStat[] = getDailyStats(wId, 1);
                points = daily.map(d => ({
                    label: getDayLabel(d.date),
                    income: d.totalIn,
                    expense: d.totalOut,
                }));
            } else {
                const now = new Date();
                const todayDay = now.getDay();
                const diffToMonday = todayDay === 0 ? 6 : todayDay - 1;
                const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
                const daysToFetch = diffToMonday + 1;
                const allDays: DailyStat[] = getDailyStats(wId, daysToFetch);

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
                        label: `${DAY_NAMES[i]}\n${dd}/${mm}`,
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

    useEffect(() => {
        loadStats(selectedWalletId, period);
    }, [loadStats, selectedWalletId, period]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadStats(selectedWalletId, period);
        setRefreshing(false);
    }, [loadStats, selectedWalletId, period]);

    // ─── Derived ────────────────────────────────────────────────────────────
    const periodTotalIn = useMemo(() => chartData.reduce((sum, d) => sum + d.income, 0), [chartData]);
    const periodTotalOut = useMemo(() => chartData.reduce((sum, d) => sum + d.expense, 0), [chartData]);
    const balance = periodTotalIn - periodTotalOut;

    const selectedWalletName = useMemo(() => {
        if (!selectedWalletId) { return 'Tất cả ví'; }
        const w = wallets.find(x => x.id === selectedWalletId);
        return w?.name ?? 'Tất cả ví';
    }, [selectedWalletId, wallets]);

    // ─── Render items ───────────────────────────────────────────────────────
    const renderRecentItem = useCallback(
        ({ item }: { item: Transaction }) => (
            <TransactionRow item={item} variant="flat" />
        ),
        [],
    );

    const ListHeader = useCallback(
        () => (
            <View>
                {/* Page Title */}
                <View style={s.pageHeader}>
                    <BarChart3 size={22} color={Colors.cyan} strokeWidth={2} />
                    <Text style={s.pageTitle}>Thống kê</Text>
                </View>

                {/* Wallet Filter */}
                <View style={s.filterSection}>
                    <View style={s.filterLabelRow}>
                        <WalletIcon size={12} color={Colors.textSecondary} strokeWidth={2} />
                        <Text style={s.filterLabel}>Ví</Text>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={s.chipsRow}>
                        <Pressable
                            onPress={() => setSelectedWalletId(undefined)}
                            style={[s.chip, !selectedWalletId && s.chipActive]}>
                            <Text style={[s.chipText, !selectedWalletId && s.chipTextActive]}>
                                Tất cả
                            </Text>
                        </Pressable>
                        {wallets.map(w => (
                            <Pressable
                                key={w.id}
                                onPress={() => setSelectedWalletId(w.id)}
                                style={[s.chip, selectedWalletId === w.id && s.chipActive]}>
                                <Text style={[s.chipText, selectedWalletId === w.id && s.chipTextActive]}>
                                    {w.name}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* Period Tabs */}
                <PeriodTabs selected={period} onChange={setPeriod} />

                {/* Summary Cards */}
                <View style={s.summaryRow}>
                    <SummaryCard
                        label="Thu nhập"
                        value={periodTotalIn}
                        color={Colors.income}
                        icon={<ArrowDownLeft size={16} color={Colors.income} strokeWidth={2} />}
                        prefix="+"
                    />
                    <SummaryCard
                        label="Chi tiêu"
                        value={periodTotalOut}
                        color={Colors.expense}
                        icon={<ArrowUpRight size={16} color={Colors.expense} strokeWidth={2} />}
                        prefix="-"
                    />
                    <SummaryCard
                        label="Số dư"
                        value={balance}
                        color={balance >= 0 ? Colors.income : Colors.expense}
                        icon={balance >= 0
                            ? <TrendingUp size={16} color={Colors.income} strokeWidth={2} />
                            : <TrendingDown size={16} color={Colors.expense} strokeWidth={2} />}
                        prefix={balance >= 0 ? '+' : '-'}
                    />
                </View>

                {/* Chart */}
                {chartData.length > 0 && (
                    <GlassCard
                        style={s.chartCard}
                        backgroundOpacity={0.06}
                        borderOpacity={0.10}
                        borderRadius={Radii.xl}>
                        <View style={s.chartInner}>
                            <View style={s.chartTitleRow}>
                                <BarChart3 size={15} color={Colors.cyan} strokeWidth={2} />
                                <Text style={s.chartTitle}>Dòng tiền</Text>
                                <Text style={s.chartSubTitle}>{selectedWalletName}</Text>
                            </View>
                            <MiniBarChart data={chartData} />
                        </View>
                    </GlassCard>
                )}

                {/* Recent Transactions Section Header */}
                {recentTxns.length > 0 && (
                    <View style={s.sectionHeader}>
                        <Text style={s.sectionTitle}>Giao dịch gần đây</Text>
                        <Text style={s.sectionSub}>{recentTxns.length} giao dịch</Text>
                    </View>
                )}
            </View>
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [chartData, wallets, selectedWalletId, period, periodTotalIn, periodTotalOut, balance, selectedWalletName, recentTxns.length],
    );

    const ListEmpty = useMemo(
        () => (
            <EmptyState
                animation="nodata"
                title="Chưa có giao dịch nào"
                subtitle="Tạo giao dịch trong mục Ví tiền để xem thống kê"
            />
        ),
        [],
    );

    // ─── Render ─────────────────────────────────────────────────────────────

    if (!isDatabaseAvailable()) {
        return (
            <View style={[s.container, { paddingTop: insets.top + 16 }, s.centerContent]}>
                <AlertTriangle size={48} color={Colors.textMuted} strokeWidth={1} />
                <Text style={s.emptyText}>Database chưa sẵn sàng</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={recentTxns}
            keyExtractor={item => item.id}
            renderItem={renderRecentItem}
            ListHeaderComponent={ListHeader}
            ListEmptyComponent={ListEmpty}
            style={[s.container, { paddingTop: insets.top + 4 }]}
            contentContainerStyle={s.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={Colors.textSecondary}
                    colors={[Colors.cyan]}
                />
            }
        />
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: Spacing.md },
    content: { paddingBottom: 120 },
    centerContent: { alignItems: 'center', justifyContent: 'center' },

    // ── Header ──
    pageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.lg,
    },
    pageTitle: {
        fontSize: FontSizes.xxl,
        fontWeight: '800',
        color: Colors.text,
        letterSpacing: -0.5,
    },

    // ── Wallet Filter ──
    filterSection: { marginBottom: Spacing.md },
    filterLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: Spacing.sm,
    },
    filterLabel: {
        fontSize: FontSizes.xs,
        fontWeight: '600',
        color: Colors.textMuted,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    chipsRow: { gap: Spacing.sm },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: Radii.xl,
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    chipActive: {
        backgroundColor: `${Colors.cyan}20`,
        borderColor: `${Colors.cyan}80`,
    },
    chipText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    chipTextActive: { color: Colors.cyan },

    // ── Period Tabs ──
    periodContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.card,
        borderRadius: Radii.md,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        padding: 6,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
        position: 'relative',
    },
    periodTab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        zIndex: 2,
    },
    periodText: {
        fontSize: FontSizes.md - 1,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    periodTextActive: { color: Colors.text },
    periodIndicator: {
        position: 'absolute',
        top: 6,
        bottom: 6,
        backgroundColor: `${Colors.cyan}20`,
        borderRadius: Radii.sm + 1,
        borderWidth: 1,
        borderColor: `${Colors.cyan}50`,
        zIndex: 1,
    },

    // ── Summary Cards ──
    summaryRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: Spacing.md,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: Colors.card,
        borderRadius: Radii.lg,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        padding: 14,
        alignItems: 'center',
    },
    summaryIconBg: {
        width: 32,
        height: 32,
        borderRadius: Radii.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    summaryLabel: {
        fontSize: FontSizes.xs,
        fontWeight: '500',
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: FontSizes.md,
        fontWeight: '800',
    },

    // ── Chart ──
    chartCard: { marginBottom: Spacing.lg },
    chartInner: { padding: Spacing.md },
    chartTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    chartTitle: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: Colors.text,
    },
    chartSubTitle: {
        fontSize: FontSizes.xs + 1,
        color: Colors.textMuted,
        marginLeft: 'auto',
    },
    chartXLabel: {
        fontSize: 10,
        color: Colors.textMuted,
        fontWeight: '500',
        marginTop: 6,
    },
    chartLegend: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: Spacing.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: FontSizes.xs + 1,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    legendMax: {
        fontSize: FontSizes.xs,
        color: Colors.textMuted,
        marginLeft: 'auto',
    },

    // ── Section ──
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        fontSize: FontSizes.lg - 2,
        fontWeight: '700',
        color: Colors.textSecondary,
    },
    sectionSub: {
        fontSize: FontSizes.xs + 1,
        color: Colors.textMuted,
    },

    // ── Empty ──
    emptyText: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.textSecondary,
        marginTop: -8,
    },
});

export default StatsScreen;
