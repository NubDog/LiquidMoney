import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing, runOnJS } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { Colors, FontSizes, Spacing } from '../../common/theme';
import { formatVNDShort } from '../../common/formatters';

type Period = 'day' | 'week';

export interface ChartDataPoint {
    label: string;
    income: number;
    expense: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_SIDE_PAD = Spacing.md * 2 + Spacing.lg * 2;
const CHART_WIDTH = SCREEN_WIDTH - CHART_SIDE_PAD;
const CHART_HEIGHT = 200;
const VALUE_LABEL_HEIGHT = 22;
const X_LABEL_HEIGHT = 22;
const BAR_AREA_HEIGHT = CHART_HEIGHT - VALUE_LABEL_HEIGHT - X_LABEL_HEIGHT;

interface AppleBarChartProps {
    data: ChartDataPoint[];
    period: Period;
}

const AppleBarChart: React.FC<AppleBarChartProps> = React.memo(({ data, period }) => {
    // Hold displayed data to animate old data OUT before swapping to new data IN
    const [displayData, setDisplayData] = useState(data);

    // Scale animation for bars dropping and growing
    const barScale = useSharedValue(0);
    
    // Fade animation for X-axis labels to transition smoothly
    const labelsFade = useSharedValue(0);

    useEffect(() => {
        // Run initial mount animation
        barScale.value = withSpring(1, { damping: 17, stiffness: 90 });
        labelsFade.value = withTiming(1, { duration: 400 });
    }, [barScale, labelsFade]);

    const swapDataAndAnimate = (newData: ChartDataPoint[]) => {
        setDisplayData(newData);
        
        // Wait a tiny bit to ensure JS paints the swap, then grow up gracefully
        setTimeout(() => {
            barScale.value = withSpring(1, { damping: 17, stiffness: 90 });
            labelsFade.value = withTiming(1, { duration: 400 });
        }, 50);
    };

    useEffect(() => {
        if (data === displayData) return;

        // Sequence: Drop down -> Swap -> Grow up
        barScale.value = withTiming(0, { duration: 400, easing: Easing.in(Easing.cubic) });
        labelsFade.value = withTiming(0, { duration: 400 }, (finished) => {
            if (finished) {
                runOnJS(swapDataAndAnimate)(data);
            }
        });
    }, [data, displayData, barScale, labelsFade]);

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
        <View style={styles.card}>
            <View style={styles.inner}>
                <Text style={styles.title}>Dòng tiền</Text>

                <View style={{ height: CHART_HEIGHT, position: 'relative' }}>
                    {!hasData ? (
                        <Animated.View style={[styles.emptyChart, { opacity: labelsFade }]}>
                            <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
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
                                                fill="rgba(235, 235, 245, 0.6)" // Apple standard secondary text
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

                                        // Determine if both bars need to be shown side-by-side
                                        const hasBoth = d.income > 0 && d.expense > 0;

                                        // In Day view, since there's only 1 bar per group, center it.
                                        // In Week view, center if only 1 bar has data, otherwise offset them.
                                        const inBarX = isDayView || !hasBoth ? cx - barWidth / 2 : cx - barWidth - barGap / 2;
                                        const outBarX = isDayView || !hasBoth ? cx - barWidth / 2 : cx + barGap / 2;
                                        
                                        // Ensure labels and bars exist rigidly inside the frame
                                        const inBarY = VALUE_LABEL_HEIGHT + BAR_AREA_HEIGHT - inH;
                                        const outBarY = VALUE_LABEL_HEIGHT + BAR_AREA_HEIGHT - outH;

                                        return (
                                            <React.Fragment key={`bar-${i}`}>
                                                {shouldRenderIn && d.income > 0 && (
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
                                                            opacity={1}
                                                        />
                                                    </>
                                                )}
                                                {shouldRenderOut && d.expense > 0 && (
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
                                                            opacity={1}
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
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: Colors.income }]} />
                        <Text style={styles.legendText}>Thu</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: Colors.expense }]} />
                        <Text style={styles.legendText}>Chi</Text>
                    </View>
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    card: { 
        marginBottom: Spacing.lg,
        backgroundColor: '#1C1C1E', // Apple Dark Mode Elevated
        borderRadius: 24,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    inner: { padding: Spacing.lg },
    title: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: 'rgba(235, 235, 245, 0.6)',
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
        color: 'rgba(235, 235, 245, 0.3)',
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
        color: 'rgba(235, 235, 245, 0.6)',
        fontWeight: '500',
    },
});

export default AppleBarChart;
