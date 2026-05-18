import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import { FontSizes, Radii, Spacing } from '../../common/theme';

interface AppleWalletCardProps {
    name: string;
    balance: number;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
    onLongPress?: () => void;
}

const AppleWalletCard: React.FC<AppleWalletCardProps> = ({
    name,
    balance,
    style,
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
        aspectRatio: 1.8, // Slightly wider to reduce vertical distance naturally
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
        color: 'rgba(255, 255, 255, 0.5)',
        letterSpacing: 1,
        marginBottom: 12,
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
    },
    balanceAmount: {
        fontSize: 40,
        color: '#FFFFFF',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});

export default AppleWalletCard;
