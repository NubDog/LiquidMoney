import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Pressable,
    LayoutChangeEvent,
    StyleProp,
    ViewStyle
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Defs, RadialGradient, Rect, Stop, LinearGradient } from 'react-native-svg';
import { Wallet } from 'lucide-react-native';
import { Colors, FontSizes, Shadows, Radii, Spacing } from '../common/theme';
import { formatVND } from '../common/formatters';

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
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            disabled={!onPress && !onLongPress}
            style={({ pressed }) => [
                styles.wrapper,
                pressed && { opacity: 0.8 },
                style
            ]}
        >
            <View 
                style={styles.container} 
                onLayout={onLayout}
            >
                <View style={[styles.glassWrapper, { borderRadius: cardRadius }]}>
                    {/* @ts-ignore */}
                    <BlurView
                        blurType="light"
                        blurAmount={12}
                        overlayColor="transparent"
                        reducedTransparencyFallbackColor="transparent"
                        style={StyleSheet.absoluteFill}
                    >
                        {hasDimensions && (
                            <Svg width={dimensions.width} height={dimensions.height} style={StyleSheet.absoluteFill}>
                                <Defs>
                                    <RadialGradient id="glassBodyTL" cx="0%" cy="0%" rx="100%" ry="100%">
                                        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.25" />
                                        <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.05" />
                                    </RadialGradient>
                                    <RadialGradient id="glassBodyBR" cx="100%" cy="100%" rx="100%" ry="100%">
                                        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.1" />
                                        <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                                    </RadialGradient>

                                    <RadialGradient id="tlGlow" cx="0%" cy="0%" rx="61.8%" ry="38.2%">
                                        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1.0" />
                                        <Stop offset="0.08" stopColor="#FFFFFF" stopOpacity="0.8" />
                                        <Stop offset="0.25" stopColor="#FFFFFF" stopOpacity="0.35" />
                                        <Stop offset="0.618" stopColor="#FFFFFF" stopOpacity="0.1" />
                                        <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                                    </RadialGradient>

                                    <RadialGradient id="brGlow" cx="100%" cy="100%" rx="61.8%" ry="38.2%">
                                        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1.0" />
                                        <Stop offset="0.08" stopColor="#FFFFFF" stopOpacity="0.8" />
                                        <Stop offset="0.25" stopColor="#FFFFFF" stopOpacity="0.35" />
                                        <Stop offset="0.618" stopColor="#FFFFFF" stopOpacity="0.1" />
                                        <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                                    </RadialGradient>
                                    
                                    <LinearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
                                       <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.3" />
                                       <Stop offset="0.2" stopColor="#FFFFFF" stopOpacity="0.0" />
                                       <Stop offset="0.8" stopColor="#FFFFFF" stopOpacity="0.0" />
                                       <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.1" />
                                    </LinearGradient>
                                </Defs>

                                <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="url(#glassBodyTL)" rx={cardRadius} />
                                <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="url(#glassBodyBR)" rx={cardRadius} />
                                
                                <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="url(#shine)" rx={cardRadius} />

                                {/* 
                                  Kỹ thuật mô phỏng Blur Mịn Bậc Cao (Deep Inward Glow):
                                  Dùng 10 bậc chồng lấp với bước tiến (dx) cực nhỏ và 
                                  Opacity Exponential Curve để viền sáng mượt và sâu tuyệt đối.
                                */}
                                {[
                                    { w: 40, o: "0.02" },
                                    { w: 32, o: "0.02" },
                                    { w: 26, o: "0.03" },
                                    { w: 20, o: "0.04" },
                                    { w: 15, o: "0.06" },
                                    { w: 11, o: "0.08" },
                                    { w: 8,  o: "0.12" },
                                    { w: 5,  o: "0.18" },
                                    { w: 3,  o: "0.25" },
                                    { w: 1,  o: "0.80" },
                                ].map((step, idx) => (
                                    <React.Fragment key={idx}>
                                        <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="none" stroke="url(#tlGlow)" strokeWidth={step.w} opacity={step.o} rx={cardRadius} />
                                        <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="none" stroke="url(#brGlow)" strokeWidth={step.w} opacity={step.o} rx={cardRadius} />
                                    </React.Fragment>
                                ))}
                            </Svg>
                        )}
                        
                        {/* 
                          CRITICAL: All textual & icon content MUST be inside BlurView 
                          to prevent Android GPU ghosting/alpha-blending artifacts
                        */}
                        <View style={styles.content} collapsable={false}>
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
                        </View>
                    </BlurView>
                </View>
            </View>
        </Pressable>
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
        // Thiết lập tỷ lệ vàng (Aspect Ratio 1.618 là độ chuẩn thẩm mỹ của Thẻ Visa)
        aspectRatio: 1.618,
        position: 'relative',
    },
    glassWrapper: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        backgroundColor: 'transparent',
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
