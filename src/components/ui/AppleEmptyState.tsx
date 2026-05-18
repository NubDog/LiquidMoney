import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import { FontSizes } from '../../common/theme';

const ANIMATIONS = {
    nodata: require('../../assets/Lottie Animation/nodata.json'),
    noresult: require('../../assets/Lottie Animation/No Result Green theme.json'),
} as const;

interface AppleEmptyStateProps {
    animation?: keyof typeof ANIMATIONS;
    title: string;
    subtitle?: string;
    animationSize?: number;
    style?: StyleProp<ViewStyle>;
}

const AppleEmptyState: React.FC<AppleEmptyStateProps> = ({
    animation = 'nodata',
    title,
    subtitle,
    animationSize = 160,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.content}>
                <LottieView
                    source={ANIMATIONS[animation]}
                    autoPlay
                    loop
                    style={{ width: animationSize, height: animationSize, marginBottom: 16 }}
                />
                <Text style={styles.title}>{title}</Text>
                {subtitle ? (
                    <Text style={styles.subtitle}>{subtitle}</Text>
                ) : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        paddingTop: 48,
        paddingBottom: 48,
        paddingHorizontal: 24,
    },
    title: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: '#FFFFFF', // Clean white, no shadow
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: 'rgba(235, 235, 245, 0.6)', // Apple standard secondary text
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default React.memo(AppleEmptyState);
