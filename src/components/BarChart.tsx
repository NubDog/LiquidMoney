/**
 * BarChart.tsx — Biểu đồ cột thu/chi 6 tháng
 * Dùng RN core View (không cần thư viện chart)
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { MonthlyStat } from '../database/queries';

// ─── Props ────────────────────────────────────────────────────────────────────

interface BarChartProps {
    data: MonthlyStat[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_LABELS = [
    'Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6',
    'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12',
];

function formatShort(n: number): string {
    if (n >= 1_000_000_000) { return (n / 1_000_000_000).toFixed(1) + 'B'; }
    if (n >= 1_000_000) { return (n / 1_000_000).toFixed(1) + 'M'; }
    if (n >= 1_000) { return (n / 1_000).toFixed(1) + 'K'; }
    return n.toString();
}

function getMonthLabel(monthStr: string): string {
    const parts = monthStr.split('-');
    const m = parseInt(parts[1], 10);
    return MONTH_LABELS[m - 1] || monthStr;
}

// ─── Animated Bar ─────────────────────────────────────────────────────────────

const AnimatedBar: React.FC<{
    heightPercent: number;
    color: string;
    delay: number;
}> = ({ heightPercent, color, delay }) => {
    const animHeight = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animHeight, {
            toValue: heightPercent,
            duration: 600,
            delay,
            useNativeDriver: false,
        }).start();
    }, [heightPercent, delay, animHeight]);

    return (
        <Animated.View
            style={[
                styles.bar,
                {
                    backgroundColor: color,
                    height: animHeight.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                    }),
                },
            ]}
        />
    );
};

// ─── Component ────────────────────────────────────────────────────────────────

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    // Tìm giá trị max để scale
    const maxValue = Math.max(
        ...data.map(d => Math.max(d.totalIn, d.totalOut)),
        1, // tránh chia 0
    );

    return (
        <View style={styles.container}>
            {/* Bars */}
            <View style={styles.barsRow}>
                {data.map((stat, i) => {
                    const inPercent = (stat.totalIn / maxValue) * 100;
                    const outPercent = (stat.totalOut / maxValue) * 100;

                    return (
                        <View key={stat.month} style={styles.barGroup}>
                            {/* Cột */}
                            <View style={styles.barWrapper}>
                                <AnimatedBar
                                    heightPercent={inPercent}
                                    color="rgba(74, 222, 128, 0.7)"
                                    delay={i * 80}
                                />
                                <AnimatedBar
                                    heightPercent={outPercent}
                                    color="rgba(248, 113, 113, 0.7)"
                                    delay={i * 80 + 40}
                                />
                            </View>

                            {/* Label tháng */}
                            <Text style={styles.monthLabel}>
                                {getMonthLabel(stat.month)}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View
                        style={[
                            styles.legendDot,
                            { backgroundColor: 'rgba(74, 222, 128, 0.7)' },
                        ]}
                    />
                    <Text style={styles.legendText}>Thu</Text>
                </View>
                <View style={styles.legendItem}>
                    <View
                        style={[
                            styles.legendDot,
                            { backgroundColor: 'rgba(248, 113, 113, 0.7)' },
                        ]}
                    />
                    <Text style={styles.legendText}>Chi</Text>
                </View>
                <Text style={styles.legendMax}>Max: {formatShort(maxValue)}</Text>
            </View>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
    },
    barsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 140,
        paddingHorizontal: 4,
    },
    barGroup: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
    },
    barWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: '100%',
        gap: 3,
    },
    bar: {
        width: 14,
        borderRadius: 4,
        minHeight: 2,
    },
    monthLabel: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.45)',
        fontWeight: '500',
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
        gap: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 3,
    },
    legendText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        fontWeight: '500',
    },
    legendMax: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.3)',
        marginLeft: 'auto',
    },
});

export default BarChart;
