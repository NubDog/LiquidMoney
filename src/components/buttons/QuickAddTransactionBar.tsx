/**
 * QuickAddTransactionBar.tsx
 * Thanh Widget "Thêm giao dịch mới" dạng Pill Bar phủ kín chiều ngang màn hình.
 * Thiết kế chuẩn 100% theo mockup pasted file.png.
 */

import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewStyle,
    StyleProp,
    Platform,
} from 'react-native';

interface QuickAddTransactionBarProps {
    onPress?: () => void | Promise<void>;
    style?: StyleProp<ViewStyle>;
    title?: string;
    backgroundColor?: string;
    height?: number;
}

const QuickAddTransactionBar: React.FC<QuickAddTransactionBarProps> = ({
    onPress,
    style,
    title = 'Thêm giao dịch mới',
    backgroundColor = '#0066FF',
    height = 62,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handlePress = useCallback(async () => {
        if (isLoading) return;

        setIsLoading(true);
        const startTime = Date.now();

        try {
            if (onPress) {
                await onPress();
            }
        } catch (err) {
            console.error('Error in QuickAddTransactionBar onPress:', err);
        } finally {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 400 - elapsed);
            setTimeout(() => {
                setIsLoading(false);
            }, remaining);
        }
    }, [isLoading, onPress]);

    const circleSize = height - 18;

    return (
        <Pressable
            onPress={handlePress}
            disabled={isLoading}
            style={({ pressed }) => [
                styles.container,
                {
                    height,
                    borderRadius: height / 2,
                    backgroundColor,
                },
                pressed && !isLoading && styles.pressed,
                style,
            ]}
        >
            <View style={styles.contentRow}>
                <View style={[styles.iconCircle, { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }]}>
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <Text style={styles.plusIcon}>+</Text>
                    )}
                </View>
                <Text style={styles.titleText}>{title}</Text>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#0066FF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    pressed: {
        opacity: 0.88,
        transform: [{ scale: 0.985 }],
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    plusIcon: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '500',
        marginTop: Platform.OS === 'ios' ? -2 : -3,
        textAlign: 'center',
    },
    titleText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
});

export default QuickAddTransactionBar;
