import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle, TouchableOpacity, Image } from 'react-native';
import { FontSizes, Radii, Spacing } from '../../common/theme';

interface AppleWalletCardProps {
    name: string;
    balance: number;
    style?: StyleProp<ViewStyle>;
    imageUri?: string | null;
    onPress?: () => void;
    onLongPress?: () => void;
}

const AppleWalletCard: React.FC<AppleWalletCardProps> = ({
    name,
    balance,
    style,
    imageUri,
    onPress,
    onLongPress
}) => {
    // Format number to use dot as thousands separator (e.g. 1.000.000)
    const formattedBalance = Math.floor(balance).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.9}
            disabled={!onPress && !onLongPress}
        >
            {/* Background Image Container */}
            <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }]}>
                <Image
                    source={imageUri ? { uri: imageUri } : require('../../assets/img/Background_Card.jpg')}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                />
                {/* Lớp phủ mờ 20% giúp chữ luôn nổi bật trên ảnh nền tuỳ biến */}
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />
            </View>

            {/* Apple-style minimalist curved highlight */}
            <View style={styles.appleCurve} />
            <View style={styles.gradientHighlight} />

            <View style={styles.content}>
                <Text style={styles.name}>{name.toUpperCase()}</Text>

                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceSign}>$</Text>
                    <Text style={styles.balanceAmount} numberOfLines={1} adjustsFontSizeToFit>
                        {formattedBalance}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        aspectRatio: 2.2, // Tighter aspect ratio to make it less tall
        backgroundColor: '#0A0A0C', // Deep premium black
        borderRadius: Radii.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.6,
        shadowRadius: 24,
        elevation: 10,
        overflow: 'hidden',
    },
    appleCurve: {
        position: 'absolute',
        width: 1600,
        height: 1600,
        borderRadius: 800,
        backgroundColor: 'rgba(255, 255, 255, 0.015)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.03)',
        bottom: -1300, // 300 visible height
        right: -400, // Peak is to the right, creating upward slope
    },
    gradientHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.15)',
        borderLeftWidth: 0.5,
        borderLeftColor: 'rgba(255, 255, 255, 0.05)',
    },
    content: {
        flex: 1,
        padding: Spacing.xl,
        justifyContent: 'flex-end', // Align items to bottom left closely
    },
    name: {
        fontSize: FontSizes.xs,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.75)',
        letterSpacing: 1,
        marginBottom: 12,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    balanceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    balanceSign: {
        fontSize: 36, // Almost exactly the size of the amount
        color: '#FFFFFF', // EXACTLY the same color as the amount to avoid mismatch
        fontWeight: '600', // Same weight as amount
        marginRight: 6,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    balanceAmount: {
        fontSize: 40,
        color: '#FFFFFF',
        fontWeight: '600',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
});

export default AppleWalletCard;
