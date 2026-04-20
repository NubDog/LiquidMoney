import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    LayoutChangeEvent,
    StyleProp,
    ViewStyle
} from 'react-native';
import { Wallet } from 'lucide-react-native';
import { FontSizes, Shadows, Radii, Spacing } from '../common/theme';
import { formatVND } from '../common/formatters';
import BackgroundLiquidGlass from './BackgroundLiquidGlass';

interface WalletCard2Props {
    name: string;
    balance: number;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
    onLongPress?: () => void;
}

const WalletCard2: React.FC<WalletCard2Props> = ({
    name,
    balance,
    style,
    onPress,
    onLongPress
}) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const onLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setDimensions({ width, height });
    };

    const hasDimensions = dimensions.width > 0 && dimensions.height > 0;
    const cardRadius = Radii.xl; // Or 24 depending on specific theming
    
    // Golden ratio relative sizes for the texts based on card height
    const dynamicBalanceSize = hasDimensions ? Math.min(dimensions.height * 0.18, 42) : 34;

    return (
        <View style={[styles.wrapper, style]} onLayout={onLayout}>
            <BackgroundLiquidGlass
                onPress={onPress}
                onLongPress={onLongPress}
                disabled={!onPress && !onLongPress}
                borderRadius={cardRadius}
                fillContainer={true}
                style={styles.container}
                contentContainerStyle={styles.content}
            >
                <View style={styles.header}>
                    <View style={styles.titleRow}>
                        <View style={styles.iconWrapper}>
                            <Wallet size={hasDimensions ? Math.max(20, dimensions.height * 0.12) : 20} color="#FFFFFF" strokeWidth={1.5} />
                        </View>
                        <Text style={styles.name}>{name}</Text>
                    </View>
                </View>

                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceLabel}>Tổng số dư</Text>
                    <View style={styles.balanceRow}>
                        <Text style={[styles.balanceLarge, { fontSize: dynamicBalanceSize }]}>
                            {formatVND(balance)}
                        </Text>
                    </View>
                </View>
            </BackgroundLiquidGlass>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        marginBottom: Spacing.lg,
        ...Shadows.card,
    },
    container: {
        width: '100%',
        aspectRatio: 1.618,
    },
    content: {
        flex: 1,
        padding: Spacing.xl,
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        padding: Spacing.md,
        borderRadius: 99,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    name: {
        fontSize: FontSizes.xl,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    balanceContainer: {
        justifyContent: 'flex-end',
        paddingBottom: Spacing.xs,
    },
    balanceLabel: {
        fontSize: FontSizes.md,
        color: 'rgba(255, 255, 255, 0.65)',
        fontWeight: '500',
        marginBottom: 8,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    balanceLarge: {
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.75,
    },
});

export default WalletCard2;
