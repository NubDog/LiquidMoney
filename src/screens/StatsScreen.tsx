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
import { Colors, FontSizes, Radii, Spacing } from '../common/theme';
import AppleStatsSummaryCard from '../components/ui/AppleStatsSummaryCard';
import AppleBarChart, { ChartDataPoint } from '../components/ui/AppleBarChart';
import AppleWalletChips from '../components/ui/AppleWalletChips';
import AppleSegmentedControl from '../components/ui/AppleSegmentedControl';
import AppleEmptyState from '../components/ui/AppleEmptyState';
import AppleTransactionRow from '../components/ui/AppleTransactionRow';
import TransactionDetailOverlay from '../components/overlays/TransactionDetailOverlay';
import TransactionModal from '../components/modals/TransactionModal';
import { useStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { isDatabaseAvailable } from '../database/db';
import type { DailyStat, OverallStat, Transaction, Wallet } from '../database/queries';
import { formatVND, formatVNDShort } from '../common/formatters';

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = 'day' | 'week';

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
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.1)',
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
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.1)',
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

// (Components extracted to src/components/ui/)

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
                            duration: 400,
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
            <View style={[s.container, s.center]}>
                <Text style={s.dbError}>Database chưa sẵn sàng</Text>
            </View>
        );
    }

    return (
        <View style={s.container}>
            {!isReady ? (
                <View style={{ paddingTop: insets.top + 8 }}>
                    <StatsSkeleton />
                </View>
            ) : (
                <>
                    <Animated.View style={{ flex: 1, opacity: showContent ? contentOpacity : 0 }}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[s.content, { paddingTop: insets.top + 8 }]}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        delaysContentTouches={false}
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
                        <AppleWalletChips
                            wallets={wallets}
                            selectedId={selectedWalletId}
                            onSelect={setSelectedWalletId}
                        />

                        {/* Period Selector */}
                        <AppleSegmentedControl 
                            options={[
                                { key: 'day', label: 'Hôm nay' },
                                { key: 'week', label: 'Tuần này' },
                            ]}
                            selected={period} 
                            onChange={(key) => setPeriod(key as Period)}
                            style={{ marginBottom: Spacing.lg }}
                        />

                        {/* Summary */}
                        <AppleStatsSummaryCard
                            totalIn={periodTotalIn}
                            totalOut={periodTotalOut}
                        />

                        {/* Chart */}
                        <AppleBarChart data={chartData} period={period} />

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
                            <AppleEmptyState
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
