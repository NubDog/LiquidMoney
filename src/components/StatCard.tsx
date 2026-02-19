/**
 * StatCard.tsx — Card thống kê tổng quan thu/chi
 * Glassmorphism style, hiển thị tổng thu, tổng chi, số giao dịch
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import GlassCard from './GlassCard';

// ─── Props ────────────────────────────────────────────────────────────────────

interface StatCardProps {
    totalIn: number;
    totalOut: number;
    txCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(n: number): string {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₫';
}

// ─── Component ────────────────────────────────────────────────────────────────

const StatCard: React.FC<StatCardProps> = ({ totalIn, totalOut, txCount }) => {
    const net = totalIn - totalOut;
    const netColor = net >= 0 ? '#4ade80' : '#f87171';

    return (
        <GlassCard
            style={styles.card}
            backgroundOpacity={0.12}
            borderOpacity={0.18}
            borderRadius={22}>
            <View style={styles.inner}>
                {/* Row 1: Thu / Chi */}
                <View style={styles.row}>
                    <View style={styles.statCol}>
                        <View style={styles.iconRow}>
                            <Text style={styles.emoji}>💰</Text>
                            <Text style={styles.label}>Tổng thu</Text>
                        </View>
                        <Text style={[styles.value, { color: '#4ade80' }]}>
                            +{formatVND(totalIn)}
                        </Text>
                    </View>

                    <View style={styles.verticalDivider} />

                    <View style={styles.statCol}>
                        <View style={styles.iconRow}>
                            <Text style={styles.emoji}>💸</Text>
                            <Text style={styles.label}>Tổng chi</Text>
                        </View>
                        <Text style={[styles.value, { color: '#f87171' }]}>
                            -{formatVND(totalOut)}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Row 2: Net + Count */}
                <View style={styles.row}>
                    <View style={styles.statCol}>
                        <Text style={styles.label}>Chênh lệch</Text>
                        <Text style={[styles.netValue, { color: netColor }]}>
                            {net >= 0 ? '+' : ''}
                            {formatVND(net)}
                        </Text>
                    </View>

                    <View style={styles.verticalDivider} />

                    <View style={styles.statCol}>
                        <Text style={styles.label}>Giao dịch</Text>
                        <Text style={styles.countValue}>{txCount}</Text>
                    </View>
                </View>
            </View>
        </GlassCard>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
    },
    inner: {
        padding: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statCol: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    emoji: {
        fontSize: 16,
    },
    label: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.45)',
        fontWeight: '500',
    },
    value: {
        fontSize: 16,
        fontWeight: '700',
    },
    netValue: {
        fontSize: 18,
        fontWeight: '800',
        marginTop: 4,
    },
    countValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#c084fc',
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        marginVertical: 8,
    },
    verticalDivider: {
        width: 1,
        height: '70%',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
});

export default StatCard;
