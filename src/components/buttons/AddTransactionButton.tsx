/**
 * AddTransactionButton.tsx
 * Nút "Thêm giao dịch mới" dạng Apple Glass Button / FAB.
 * - Khi nhấn, icon dấu "+" sẽ chuyển sang icon Loading (ActivityIndicator).
 * - Giữ trạng thái loading tối thiểu 1.4 giây (1400ms) trước khi quay lại dấu "+".
 */

import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle, StyleProp, Platform } from 'react-native';

interface AddTransactionButtonProps {
    onPress?: () => void | Promise<void>;
    size?: number;
    style?: StyleProp<ViewStyle>;
    backgroundColor?: string;
}

const AddTransactionButton: React.FC<AddTransactionButtonProps> = ({
    onPress,
    size = 60,
    style,
    backgroundColor = 'rgba(255, 255, 255, 0.18)',
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
            console.error('Error in AddTransactionButton onPress:', err);
        } finally {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 1400 - elapsed);
            setTimeout(() => {
                setIsLoading(false);
            }, remaining);
        }
    }, [isLoading, onPress]);

    return (
        <Pressable
            onPress={handlePress}
            hitSlop={12}
            disabled={isLoading}
            style={({ pressed }) => [
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor,
                },
                pressed && !isLoading && styles.pressed,
                style,
            ]}
        >
            {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
                <Text style={[styles.plusText, { fontSize: Math.round(size * 0.52) }]}>+</Text>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
            },
            android: {
                elevation: 0,
            },
        }),
    },
    pressed: {
        opacity: 0.7,
        transform: [{ scale: 0.92 }],
    },
    plusText: {
        color: '#FFFFFF',
        fontWeight: '300',
        textAlign: 'center',
        marginTop: Platform.OS === 'ios' ? -2 : -4,
    },
});

export default AddTransactionButton;
