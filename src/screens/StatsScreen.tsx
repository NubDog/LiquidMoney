/**
 * StatsScreen.tsx — Màn hình thống kê thu/chi
 * Features:
 *  - Wallet filter: Tất cả ví hoặc chọn ví cụ thể
 *  - Time range selector: 3 / 6 / 12 tháng
 *  - Biểu đồ cột động (BarChart)
 *  - Tổng quan thu/chi (StatCard)
 *  - Danh sách giao dịch gần đây
 *  - Pull-to-refresh
 *  - Lottie empty state
 */

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

const FadeInView: React.FC<{
    delay?: number;
    duration?: number;
    initialTranslateY?: number;
    children: React.ReactNode;
}> = ({ delay = 0, duration = 400, initialTranslateY = 0, children }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(initialTranslateY)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, [opacity, translateY, delay, duration]);

    return (
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
            {children}
        </Animated.View>
    );
};
import { Pressable } from 'react-native';
import GlassCard from '../components/GlassCard';
import BarChart from '../components/BarChart';
import StatCard from '../components/StatCard';
import { isDatabaseAvailable } from '../database/db';
import type { MonthlyStat, OverallStat, Transaction, Wallet } from '../database/queries';
import {
    ArrowDownLeft,
    ArrowUpRight,
    TrendingUp,
    Clock,
    AlertTriangle,
    Wallet as WalletIcon,
} from 'lucide-react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeRange = 3 | 6 | 12;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(n: number): string {
    const abs = Math.abs(n);
    return abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₫';
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month} ${hours}:${mins}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Chip cho wallet filter */
const WalletChip: React.FC<{
    label: string;
    isActive: boolean;
    onPress: () => void;
}> = ({ label, isActive, onPress }) => (
    <Pressable
        onPress={onPress}
        style={[styles.chip, isActive && styles.chipActive]}>
        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
            {label}
        </Text>
    </Pressable>
);

/** Chip cho time range */
const RangeChip: React.FC<{
    label: string;
    isActive: boolean;
    onPress: () => void;
}> = ({ label, isActive, onPress }) => (
    <Pressable
        onPress={onPress}
        style={[styles.rangeChip, isActive && styles.rangeChipActive]}>
        <Text style={[styles.rangeChipText, isActive && styles.rangeChipTextActive]}>
            {label}
        </Text>
    </Pressable>
);

// ─── Component ────────────────────────────────────────────────────────────────

const StatsScreen: React.FC = () => {
    const insets = useSafeAreaInsets();

    // ─── State ──────────────────────────────────────────────────────────────
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>(undefined);
    const [timeRange, setTimeRange] = useState<TimeRange>(6);
    const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
    const [overallStats, setOverallStats] = useState<OverallStat>({
        totalIn: 0,
        totalOut: 0,
        txCount: 0,
    });
    const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    // ─── Load data ──────────────────────────────────────────────────────────

    const loadStats = useCallback((wId?: string, months: number = 6) => {
        if (!isDatabaseAvailable()) { return; }
        try {
            const {
                getAllWallets,
                getMonthlyStats,
                getOverallStats,
                getRecentTransactions,
            } = require('../database/queries');

            setWallets(getAllWallets());
            setMonthlyStats(getMonthlyStats(wId, months));
            setOverallStats(getOverallStats(wId));
            setRecentTxns(getRecentTransactions(20, wId));
        } catch (err) {
            console.warn('[Stats] Failed to load:', err);
        }
    }, []);

    useEffect(() => {
        loadStats(selectedWalletId, timeRange);
    }, [loadStats, selectedWalletId, timeRange]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadStats(selectedWalletId, timeRange);
        setRefreshing(false);
    }, [loadStats, selectedWalletId, timeRange]);

    // ─── Selected wallet label ───────────────────────────────────────────────
    const selectedWalletName = useMemo(() => {
        if (!selectedWalletId) { return 'Tất cả ví'; }
        const w = wallets.find(x => x.id === selectedWalletId);
        return w?.name ?? 'Tất cả ví';
    }, [selectedWalletId, wallets]);

    // ─── Derived stats ───────────────────────────────────────────────────────
    const savings = overallStats.totalIn - overallStats.totalOut;

    // ─── Render items ────────────────────────────────────────────────────────

    const renderRecentItem = useCallback(
        ({ item, index }: { item: Transaction; index: number }) => {
            const isIn = item.type === 'IN';
            const amountColor = isIn ? '#4ade80' : '#f87171';
            return (
                <FadeInView delay={index * 40} duration={350} initialTranslateY={20}>
                    <View style={styles.txRow}>
                        <View style={[styles.txIconBg, { backgroundColor: isIn ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)' }]}>
                            {isIn
                                ? <ArrowDownLeft size={16} color="#4ade80" strokeWidth={2} />
                                : <ArrowUpRight size={16} color="#f87171" strokeWidth={2} />}
                        </View>
                        <View style={styles.txInfo}>
                            <Text style={styles.txReason} numberOfLines={1}>
                                {item.reason || (isIn ? 'Thu nhập' : 'Chi tiêu')}
                            </Text>
                            <Text style={styles.txDate}>
                                {formatDate(item.created_at)}
                            </Text>
                        </View>
                        <Text style={[styles.txAmount, { color: amountColor }]}>
                            {isIn ? '+' : '-'}{formatVND(item.amount)}
                        </Text>
                    </View>
                </FadeInView>
            );
        },
        [],
    );

    const ListHeader = useCallback(
        () => (
            <View>
                {/* Page Title */}
                <FadeInView delay={0} duration={400} initialTranslateY={20}>
                    <View style={styles.pageHeader}>
                        <TrendingUp size={22} color="#22d3ee" strokeWidth={2} />
                        <Text style={styles.pageTitle}>Thống kê</Text>
                    </View>
                </FadeInView>

                {/* Wallet Filter */}
                <FadeInView delay={60} duration={400} initialTranslateY={20}>
                    <View style={styles.filterSection}>
                        <View style={styles.filterLabelRow}>
                            <WalletIcon size={13} color="rgba(255,255,255,0.4)" strokeWidth={2} />
                            <Text style={styles.filterLabel}>Ví</Text>
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.chipsRow}>
                            <WalletChip
                                label="Tất cả"
                                isActive={selectedWalletId === undefined}
                                onPress={() => setSelectedWalletId(undefined)}
                            />
                            {wallets.map(w => (
                                <WalletChip
                                    key={w.id}
                                    label={w.name}
                                    isActive={selectedWalletId === w.id}
                                    onPress={() => setSelectedWalletId(w.id)}
                                />
                            ))}
                        </ScrollView>
                    </View>
                </FadeInView>

                {/* Time range selector */}
                <FadeInView delay={100} duration={400} initialTranslateY={20}>
                    <View style={styles.rangeRow}>
                        {([3, 6, 12] as TimeRange[]).map(r => (
                            <RangeChip
                                key={r}
                                label={`${r} tháng`}
                                isActive={timeRange === r}
                                onPress={() => setTimeRange(r)}
                            />
                        ))}
                    </View>
                </FadeInView>

                {/* Overall Stats Card */}
                <FadeInView delay={140} duration={400} initialTranslateY={-20}>
                    <StatCard
                        totalIn={overallStats.totalIn}
                        totalOut={overallStats.totalOut}
                        txCount={overallStats.txCount}
                    />
                </FadeInView>

                {/* Savings pill */}
                <FadeInView delay={180} duration={400} initialTranslateY={-20}>
                    <View style={[styles.savingsPill, {
                        backgroundColor: savings >= 0
                            ? 'rgba(74, 222, 128, 0.08)'
                            : 'rgba(248, 113, 113, 0.08)',
                        borderColor: savings >= 0
                            ? 'rgba(74, 222, 128, 0.25)'
                            : 'rgba(248, 113, 113, 0.25)',
                    }]}>
                        <Text style={styles.savingsLabel}>Tiết kiệm tháng này</Text>
                        <Text style={[styles.savingsValue, {
                            color: savings >= 0 ? '#4ade80' : '#f87171',
                        }]}>
                            {savings >= 0 ? '+' : ''}{formatVND(savings)}
                        </Text>
                    </View>
                </FadeInView>

                {/* Monthly Chart */}
                <FadeInView delay={220} duration={400} initialTranslateY={-20}>
                    <GlassCard
                        style={styles.chartCard}
                        backgroundOpacity={0.1}
                        borderOpacity={0.15}
                        borderRadius={20}>
                        <View style={styles.chartInner}>
                            <View style={styles.chartTitleRow}>
                                <TrendingUp size={16} color="#22d3ee" strokeWidth={2} />
                                <Text style={styles.chartTitle}>
                                    Thu/Chi {timeRange} tháng
                                </Text>
                                <Text style={styles.chartSubTitle}>
                                    {selectedWalletName}
                                </Text>
                            </View>
                            {monthlyStats.length > 0 ? (
                                <BarChart data={monthlyStats} />
                            ) : (
                                <Text style={styles.emptyChart}>
                                    Chưa có dữ liệu
                                </Text>
                            )}
                        </View>
                    </GlassCard>
                </FadeInView>

                {/* Recent transactions header */}
                {recentTxns.length > 0 && (
                    <FadeInView delay={260} duration={400} initialTranslateY={20}>
                        <View style={styles.sectionHeader}>
                            <Clock size={15} color="rgba(255,255,255,0.45)" strokeWidth={2} />
                            <Text style={styles.sectionTitle}>
                                Giao dịch gần đây
                            </Text>
                            <Text style={styles.sectionSub}>
                                {recentTxns.length} giao dịch
                            </Text>
                        </View>
                        <GlassCard
                            backgroundOpacity={0.08}
                            borderOpacity={0.12}
                            borderRadius={18}
                            style={styles.txCard}>
                            <View />
                        </GlassCard>
                    </FadeInView>
                )}
            </View>
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [overallStats, monthlyStats, wallets, selectedWalletId, selectedWalletName, timeRange, savings, recentTxns.length],
    );

    const ListEmpty = useCallback(
        () => (
            <View style={styles.emptyContainer}>
                <LottieView
                    source={require('../assets/Lottie Animation/nodata.json')}
                    autoPlay
                    loop
                    style={styles.emptyLottie}
                />
                <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
                <Text style={styles.emptySubtext}>
                    Tạo giao dịch trong mục Ví tiền để xem thống kê
                </Text>
            </View>
        ),
        [],
    );

    // ─── Render ─────────────────────────────────────────────────────────────

    if (!isDatabaseAvailable()) {
        return (
            <View
                style={[
                    styles.container,
                    { paddingTop: insets.top + 16 },
                    styles.centerContent,
                ]}>
                <AlertTriangle size={48} color="rgba(255,255,255,0.2)" strokeWidth={1} />
                <Text style={styles.emptyText}>Database chưa sẵn sàng</Text>
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
            style={[styles.container, { paddingTop: insets.top + 4 }]}
            contentContainerStyle={[styles.content]}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="rgba(255,255,255,0.4)"
                    colors={['#22d3ee']}
                />
            }
        />
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    content: {
        paddingBottom: 120,
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Page Header ──
    pageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingTop: 8,
        paddingBottom: 20,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },

    // ── Wallet Filter ──
    filterSection: {
        marginBottom: 12,
    },
    filterLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 8,
    },
    filterLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    chipsRow: {
        gap: 8,
        paddingRight: 16,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    chipActive: {
        backgroundColor: 'rgba(34, 211, 238, 0.15)',
        borderColor: 'rgba(34, 211, 238, 0.5)',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.45)',
    },
    chipTextActive: {
        color: '#22d3ee',
    },

    // ── Time Range ──
    rangeRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    rangeChip: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
    },
    rangeChipActive: {
        backgroundColor: 'rgba(192, 132, 252, 0.15)',
        borderColor: 'rgba(192, 132, 252, 0.45)',
    },
    rangeChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.4)',
    },
    rangeChipTextActive: {
        color: '#c084fc',
    },

    // ── Savings Pill ──
    savingsPill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
    },
    savingsLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.5)',
    },
    savingsValue: {
        fontSize: 16,
        fontWeight: '800',
    },

    // ── Chart Card ──
    chartCard: {
        marginBottom: 24,
    },
    chartInner: {
        padding: 20,
    },
    chartTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    chartSubTitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.35)',
        marginLeft: 'auto',
    },
    emptyChart: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 40,
    },

    // ── Section ──
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.7)',
    },
    sectionSub: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.3)',
        marginLeft: 'auto',
    },
    txCard: {
        overflow: 'hidden',
    },

    // ── Transaction row ──
    txRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    },
    txIconBg: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    txInfo: {
        flex: 1,
        marginRight: 8,
    },
    txReason: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    txDate: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.35)',
        marginTop: 2,
    },
    txAmount: {
        fontSize: 14,
        fontWeight: '700',
    },

    // ── Empty ──
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 40,
    },
    emptyLottie: {
        width: 180,
        height: 180,
    },
    emptyText: {
        fontSize: 17,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: -8,
    },
    emptySubtext: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.35)',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default StatsScreen;
