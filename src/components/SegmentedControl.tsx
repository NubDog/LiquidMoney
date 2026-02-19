/**
 * SegmentedControl.tsx — Tab Switcher với chỉ báo trượt animated
 * Sử dụng React Native Animated API cho hiệu ứng trượt mượt
 */

import React, { useCallback, useRef, useState } from 'react';
import {
    Animated,
    Easing,
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

    const segmentWidth = containerWidth / segments.length;

    // Đo chiều rộng container khi layout
    const onLayout = useCallback(
        (e: LayoutChangeEvent) => {
            const width = e.nativeEvent.layout.width;
            setContainerWidth(width);
            // Set vị trí ban đầu (không animate)
            translateX.setValue(selectedIndex * (width / segments.length));
        },
        [selectedIndex, segments.length, translateX],
    );

    // Cập nhật indicator khi selectedIndex thay đổi
    React.useEffect(() => {
        if (containerWidth > 0) {
            Animated.timing(translateX, {
                toValue: selectedIndex * segmentWidth,
                duration: 280,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                useNativeDriver: true,
            }).start();
        }
    }, [selectedIndex, segmentWidth, containerWidth, translateX]);

    return (
        <View style={styles.container} onLayout={onLayout}>
            {/* Indicator trượt */}
            <Animated.View
                style={[
                    styles.indicator,
                    {
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
        borderColor: 'rgba(255, 255, 255, 0.2)',
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
