/**
 * SegmentedControl.tsx — Tab Switcher với hiệu ứng Liquid Glass
 * Spring animation cho indicator trượt mượt kiểu Apple
 * Scale "bong bóng" khi di chuyển + glow effect
 */

import React, { useCallback, useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type LayoutChangeEvent,
} from 'react-native';

// ─── Props ────────────────────────────────────────────────────────────────────

interface SegmentedControlProps {
    /** Danh sách nhãn cho từng tab */
    segments: string[];
    /** Index tab đang chọn */
    selectedIndex: number;
    /** Callback khi đổi tab */
    onChange: (index: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const SegmentedControl: React.FC<SegmentedControlProps> = ({
    segments,
    selectedIndex,
    onChange,
}) => {
    const [containerWidth, setContainerWidth] = useState(0);
    const translateX = useRef(new Animated.Value(0)).current;
    const scaleX = useRef(new Animated.Value(1)).current;
    const scaleY = useRef(new Animated.Value(1)).current;
    const glowOpacity = useRef(new Animated.Value(0)).current;
    const prevIndexRef = useRef(selectedIndex);

    const segmentWidth = containerWidth / segments.length;

    // Đo chiều rộng container khi layout
    const onLayout = useCallback(
        (e: LayoutChangeEvent) => {
            const width = e.nativeEvent.layout.width;
            setContainerWidth(width);
            translateX.setValue(selectedIndex * (width / segments.length));
        },
        [selectedIndex, segments.length, translateX],
    );

    // Liquid Glass animation khi đổi tab
    React.useEffect(() => {
        if (containerWidth > 0) {
            const prevIndex = prevIndexRef.current;
            const distance = Math.abs(selectedIndex - prevIndex);
            prevIndexRef.current = selectedIndex;

            if (distance === 0) {
                // Lần đầu mount hoặc cùng tab — không cần animation fancy
                Animated.spring(translateX, {
                    toValue: selectedIndex * segmentWidth,
                    useNativeDriver: true,
                    friction: 12,
                    tension: 80,
                }).start();
                return;
            }

            // Liquid Glass: bubble stretch → slide → settle
            const stretchAmount = 1 + distance * 0.06; // Stretch nhiều hơn khi xa
            const squishAmount = 1 - distance * 0.04;

            Animated.sequence([
                // Phase 1: Stretch ra (bong bóng mở rộng)
                Animated.parallel([
                    Animated.spring(scaleX, {
                        toValue: stretchAmount,
                        useNativeDriver: true,
                        friction: 8,
                        tension: 200,
                    }),
                    Animated.spring(scaleY, {
                        toValue: squishAmount,
                        useNativeDriver: true,
                        friction: 8,
                        tension: 200,
                    }),
                    Animated.timing(glowOpacity, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                ]),
                // Phase 2: Slide + settle
                Animated.parallel([
                    Animated.spring(translateX, {
                        toValue: selectedIndex * segmentWidth,
                        useNativeDriver: true,
                        friction: 10,
                        tension: 60,
                    }),
                    Animated.spring(scaleX, {
                        toValue: 1,
                        useNativeDriver: true,
                        friction: 6,
                        tension: 100,
                    }),
                    Animated.spring(scaleY, {
                        toValue: 1,
                        useNativeDriver: true,
                        friction: 6,
                        tension: 100,
                    }),
                    Animated.timing(glowOpacity, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        }
    }, [selectedIndex, segmentWidth, containerWidth, translateX, scaleX, scaleY, glowOpacity]);

    return (
        <View style={styles.container} onLayout={onLayout}>
            {/* Indicator trượt — Liquid Glass */}
            <Animated.View
                style={[
                    styles.indicator,
                    {
                        transform: [
                            { translateX },
                            { scaleX },
                            { scaleY },
                        ],
                        width: segmentWidth > 0 ? segmentWidth - 4 : 0,
                    },
                ]}
            />
            {/* Glow effect khi trượt */}
            <Animated.View
                style={[
                    styles.glow,
                    {
                        opacity: glowOpacity,
                        transform: [{ translateX }],
                        width: segmentWidth > 0 ? segmentWidth - 4 : 0,
                    },
                ]}
            />

            {/* Các segment */}
            {segments.map((label, index) => {
                const isSelected = index === selectedIndex;

                return (
                    <TouchableOpacity
                        key={label}
                        activeOpacity={0.7}
                        onPress={() => onChange(index)}
                        style={styles.segment}>
                        <Text
                            style={[
                                styles.segmentText,
                                isSelected && styles.segmentTextActive,
                            ]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        padding: 2,
        position: 'relative',
    },
    indicator: {
        position: 'absolute',
        top: 2,
        left: 2,
        bottom: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        // Glass shadow effect
        shadowColor: 'rgba(255, 255, 255, 0.3)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    glow: {
        position: 'absolute',
        top: 0,
        left: 2,
        bottom: 0,
        backgroundColor: 'rgba(192, 132, 252, 0.08)',
        borderRadius: 12,
    },
    segment: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    segmentText: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.45)',
    },
    segmentTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});

export default SegmentedControl;
