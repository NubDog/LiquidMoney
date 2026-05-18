import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle, Platform } from 'react-native';
import { Colors, FontSizes, Radii, Spacing } from '../../common/theme';
import { formatVND } from '../../common/formatters';

interface AppleSummaryCardProps {
    walletName: string;
    currentBalance: number;
    initialBalance: number;
    balanceDiff: number;
    diffColor: string;
    style?: StyleProp<ViewStyle>;
}

const AppleSummaryCard: React.FC<AppleSummaryCardProps> = ({
    walletName,
    currentBalance,
    initialBalance,
    balanceDiff,
    diffColor,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <Text style={styles.walletName}>{walletName}</Text>
            
            <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
            <Text style={styles.balanceAmount} numberOfLines={1} adjustsFontSizeToFit>
                {formatVND(currentBalance)}
            </Text>

            <View style={styles.balanceRow}>
                <View style={styles.balanceCol}>
                    <Text style={styles.smallLabel}>Ban đầu</Text>
                    <Text style={styles.smallValue}>
                        {formatVND(initialBalance)}
                    </Text>
                </View>
                <View style={styles.balanceCol}>
                    <Text style={styles.smallLabel}>Chênh lệch</Text>
                    <Text style={[styles.smallValue, { color: diffColor }]}>
                        {balanceDiff >= 0 ? '+' : ''}
                        {formatVND(balanceDiff)}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1C1C1E', // Apple Dark Mode Elevated Card
        borderRadius: Radii.xxl,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.xl,
        paddingHorizontal: Spacing.xl,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    walletName: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },
    balanceLabel: {
        fontSize: FontSizes.sm,
        color: 'rgba(235, 235, 245, 0.6)', // Apple standard secondary text
        marginTop: Spacing.xs,
    },
    balanceAmount: {
        fontSize: FontSizes.title + 8,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 4,
        letterSpacing: -1,
    },
    balanceRow: {
        flexDirection: 'row',
        marginTop: Spacing.xl,
        gap: Spacing.md,
    },
    balanceCol: {
        flex: 1,
    },
    smallLabel: {
        fontSize: FontSizes.xs + 2,
        color: 'rgba(235, 235, 245, 0.6)',
        marginBottom: 4,
    },
    smallValue: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
    },
});

export default React.memo(AppleSummaryCard);
