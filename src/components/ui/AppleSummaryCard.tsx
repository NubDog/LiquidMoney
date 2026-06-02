import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle, Platform, Image } from 'react-native';
import { Colors, FontSizes, Radii, Spacing } from '../../common/theme';
import { formatVND } from '../../common/formatters';

interface AppleSummaryCardProps {
    walletName: string;
    currentBalance: number;
    initialBalance: number;
    balanceDiff: number;
    diffColor: string;
    imageUri?: string | null;
    style?: StyleProp<ViewStyle>;
}

const AppleSummaryCard: React.FC<AppleSummaryCardProps> = ({
    walletName,
    currentBalance,
    initialBalance,
    balanceDiff,
    diffColor,
    imageUri,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <View style={[StyleSheet.absoluteFillObject, { borderRadius: Radii.xxl, overflow: 'hidden' }]}>
                <Image
                    source={imageUri ? { uri: imageUri } : require('../../assets/img/Background_Card.jpg')}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                />
                {/* Lớp phủ mờ 20% giúp chữ luôn nổi bật trên ảnh nền tuỳ biến */}
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />
            </View>
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
        color: 'rgba(255, 255, 255, 0.85)',
        marginBottom: Spacing.sm,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    balanceLabel: {
        fontSize: FontSizes.sm,
        color: 'rgba(235, 235, 245, 0.8)', // Apple standard secondary text
        marginTop: Spacing.xs,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    balanceAmount: {
        fontSize: FontSizes.title + 8,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 4,
        letterSpacing: -1,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
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
        color: 'rgba(235, 235, 245, 0.8)',
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    smallValue: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.95)',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});

export default React.memo(AppleSummaryCard);
