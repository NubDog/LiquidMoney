import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';
import { Colors, FontSizes, Radii, Spacing } from '../../common/theme';
import { formatVND } from '../../common/formatters';

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
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(animOpacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setDisplayText(text);
            animX.setValue(-20);
            
            Animated.parallel([
                Animated.timing(animX, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.out(Easing.back(1.5)),
                    useNativeDriver: true,
                }),
                Animated.timing(animOpacity, {
                    toValue: 1,
                    duration: 400,
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

interface AppleStatsSummaryCardProps {
    totalIn: number;
    totalOut: number;
}

const AppleStatsSummaryCard: React.FC<AppleStatsSummaryCardProps> = ({ totalIn, totalOut }) => {
    const balance = totalIn - totalOut;
    return (
        <View style={styles.card}>
            <View style={styles.inner}>
                {/* Main Metric - Chênh lệch */}
                <View style={{ alignItems: 'center', marginBottom: Spacing.md }}>
                    <Text style={styles.balanceLabel}>Chênh lệch</Text>
                    <AnimatedSlidingText
                        text={`${balance >= 0 ? '+' : '-'}${formatVND(Math.abs(balance))}`}
                        style={[
                            styles.balanceValue,
                            { color: balance >= 0 ? Colors.income : Colors.expense },
                        ]}
                        adjustsFontSizeToFit={true}
                        numberOfLines={1}
                    />
                </View>

                <View style={styles.divider} />

                {/* Secondary Metrics - Thu / Chi */}
                <View style={styles.row}>
                    <View style={styles.col}>
                        <View style={styles.labelRow}>
                            <View style={[styles.dot, { backgroundColor: Colors.income }]} />
                            <Text style={styles.label} adjustsFontSizeToFit numberOfLines={1}>Thu nhập</Text>
                        </View>
                        <AnimatedSlidingText
                            text={`+${formatVND(totalIn)}`}
                            style={[styles.value, { color: Colors.income }]}
                            adjustsFontSizeToFit={true}
                            numberOfLines={1}
                        />
                    </View>
                    <View style={styles.separator} />
                    <View style={[styles.col, { alignItems: 'flex-end' }]}>
                        <View style={[styles.labelRow, { justifyContent: 'flex-end' }]}>
                            <View style={[styles.dot, { backgroundColor: Colors.expense }]} />
                            <Text style={styles.label} adjustsFontSizeToFit numberOfLines={1}>Chi tiêu</Text>
                        </View>
                        <AnimatedSlidingText
                            text={`-${formatVND(totalOut)}`}
                            style={[styles.value, { color: Colors.expense }]}
                            adjustsFontSizeToFit={true}
                            numberOfLines={1}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: { 
        marginBottom: Spacing.lg,
        backgroundColor: '#1C1C1E', // Apple Dark Mode Elevated
        borderRadius: 24,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    inner: { padding: Spacing.lg, paddingTop: Spacing.xl },
    row: { flexDirection: 'row', alignItems: 'flex-start' },
    col: { flex: 1 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    label: { fontSize: FontSizes.sm, fontWeight: '500', color: 'rgba(235, 235, 245, 0.6)' },
    separator: {
        width: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignSelf: 'stretch',
        marginHorizontal: Spacing.md,
    },
    value: { fontSize: FontSizes.lg + 2, fontWeight: '700', letterSpacing: -0.5 },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: Spacing.md,
    },
    balanceLabel: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: 'rgba(235, 235, 245, 0.6)',
        marginBottom: 8,
    },
    balanceValue: { fontSize: 40, fontWeight: '800', letterSpacing: -1 },
});

export default React.memo(AppleStatsSummaryCard);
