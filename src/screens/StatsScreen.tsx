/**
 * StatsScreen.tsx — Màn hình thống kê thu/chi
 * Biểu đồ cột + Tổng quan + Giao dịch gần đây
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../components/GlassCard';
import BarChart from '../components/BarChart';
import StatCard from '../components/StatCard';
import { isDatabaseAvailable } from '../database/db';
import type {
    MonthlyStat,
    OverallStat,
    Transaction,
} from '../database/queries';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(n: number): string {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₫';
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month} ${hours}:${mins}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const StatsScreen: React.FC = () => {
    const insets = useSafeAreaInsets();

    const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
    const [overallStats, setOverallStats] = useState<OverallStat>({
        totalIn: 0,
        totalOut: 0,
        txCount: 0,
    });
    const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);

    // ─── Load data ──────────────────────────────────────────────────────────

    const loadStats = useCallback(() => {
        if (!isDatabaseAvailable()) { return; }
        try {
            const {
                getMonthlyStats,
                getOverallStats,
                getRecentTransactions,
            } = require('../database/queries');

            setMonthlyStats(getMonthlyStats());
            setOverallStats(getOverallStats());
            setRecentTxns(getRecentTransactions(10));
        } catch (err) {
            console.warn('[Stats] Failed to load:', err);
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    // ─── Render items ───────────────────────────────────────────────────────

    const renderRecentItem = useCallback(
        ({ item }: { item: Transaction }) => {
            const isIn = item.type === 'IN';
            const amountColor = isIn ? '#4ade80' : '#f87171';

            return (
                <View style={styles.txRow}>
                    <Text style={styles.txEmoji}>{isIn ? '💰' : '💸'}</Text>
                    <View style={styles.txInfo}>
                        <Text style={styles.txReason} numberOfLines={1}>
                            {item.reason || (isIn ? 'Thu nhập' : 'Chi tiêu')}
                        </Text>
                        <Text style={styles.txDate}>
                            {formatDate(item.created_at)}
                        </Text>
                    </View>
                    <Text style={[styles.txAmount, { color: amountColor }]}>
                        {isIn ? '+' : '-'}
                        {formatVND(item.amount)}
                    </Text>
                </View>
            );
        },
        [],
    );

    const ListHeader = useCallback(
        () => (
            <View>
                {/* Overall Stats Card */}
                <StatCard
                    totalIn={overallStats.totalIn}
                    totalOut={overallStats.totalOut}
                    txCount={overallStats.txCount}
                />

                {/* Monthly Chart */}
                <GlassCard
                    style={styles.chartCard}
                    backgroundOpacity={0.1}
                    borderOpacity={0.15}
                    borderRadius={20}>
                    <View style={styles.chartInner}>
                        <Text style={styles.chartTitle}>
                            📈 Thu/Chi 6 tháng
                        </Text>
                        {monthlyStats.length > 0 ? (
                            <BarChart data={monthlyStats} />
                        ) : (
                            <Text style={styles.emptyChart}>
                                Chưa có dữ liệu
                            </Text>
                        )}
                    </View>
                </GlassCard>

                {/* Recent transactions header */}
                <Text style={styles.sectionTitle}>
                    🕐 Giao dịch gần đây
                </Text>
            </View>
        ),
        [overallStats, monthlyStats],
    );

    const ListEmpty = useCallback(
        () => (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>📋</Text>
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
                <Text style={styles.emptyEmoji}>⚠️</Text>
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
            style={[styles.container, { paddingTop: insets.top + 16 }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        />
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    content: {
        paddingBottom: 40,
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
        marginBottom: 24,
    },

    // ── Chart Card ──
    chartCard: {
        marginBottom: 24,
    },
    chartInner: {
        padding: 20,
    },
    chartTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    emptyChart: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 40,
    },

    // ── Section ──
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 14,
    },

    // ── Transaction row ──
    txRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    },
    txEmoji: {
        fontSize: 18,
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
        fontSize: 15,
        fontWeight: '700',
    },

    // ── Empty ──
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 40,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 17,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.6)',
    },
    emptySubtext: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.35)',
        marginTop: 6,
        textAlign: 'center',
    },
});

export default StatsScreen;
