/**
 * TransactionFilterBar.tsx — Liquid Gliding Segmented Control
 * Dark Mode • Frosted Glass • Spring Physics
 *
 * Thư viện:
 *  - react-native-reanimated v3  (useSharedValue, useAnimatedStyle, withSpring, interpolateColor)
 *  - react-native-gesture-handler (Gesture.Tap, GestureDetector)
 *  - @react-native-community/blur (BlurView)
 */

import React, { useCallback, useState } from 'react';
import {
    Platform,
    StyleSheet,
    View,
    type LayoutChangeEvent,
} from 'react-native';
import Animated, {
    interpolateColor,
    runOnJS,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withSpring,
    type SharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { BlurView } from '@react-native-community/blur';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TransactionFilterBarProps {
    /** Danh sách nhãn tab, mặc định: ['Tất cả', 'Thu', 'Chi'] */
    segments?: string[];
    /** Index tab đang active */
    selectedIndex: number;
    /** Callback khi chuyển tab */
    onChange: (index: number) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_SEGMENTS = ['Tất cả', 'Thu', 'Chi'];
const CONTAINER_PADDING = 6;
const INDICATOR_BORDER_RADIUS = 22;
const CONTAINER_BORDER_RADIUS = 26;

// Spring config — mềm mại, mượt mà, có độ nảy nhẹ
const SPRING_CONFIG = {
    damping: 18,
    stiffness: 160,
    mass: 0.8,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
};

// Colors
const ACTIVE_TEXT_COLOR = '#FFFFFF';
const INACTIVE_TEXT_COLOR = 'rgba(255, 255, 255, 0.40)';
const INDICATOR_BG = 'rgba(255, 255, 255, 0.14)';
const INDICATOR_BORDER = 'rgba(255, 255, 255, 0.22)';

// ─── Animated Tab Label ───────────────────────────────────────────────────────

interface TabLabelProps {
    label: string;
    index: number;
    /** Shared value: current active index (animated) */
    activeProgress: SharedValue<number>;
    segmentWidth: number;
    onTap: (index: number) => void;
}

const TabLabel: React.FC<TabLabelProps> = React.memo(
    ({ label, index, activeProgress, segmentWidth, onTap }) => {
        // Mỗi tab có một "progress" riêng: 0 = inactive, 1 = active
        const tabProgress = useDerivedValue(() => {
            const diff = Math.abs(activeProgress.value - index);
            // Clamp 0..1 : khi diff = 0 → 1, diff >= 1 → 0
            return Math.max(0, 1 - diff);
        });

        const animatedTextStyle = useAnimatedStyle(() => {
            const color = interpolateColor(
                tabProgress.value,
                [0, 1],
                [INACTIVE_TEXT_COLOR, ACTIVE_TEXT_COLOR],
            );
            return { color };
        });

        const animatedScaleStyle = useAnimatedStyle(() => {
            // Nhẹ nhàng scale chữ lên khi active
            const scale = 1 + tabProgress.value * 0.04;
            return { transform: [{ scale }] };
        });

        // Gesture.Tap — phản hồi tức thì, không delay
        const tapGesture = Gesture.Tap()
            .maxDuration(250)
            .onEnd(() => {
                'worklet';
                runOnJS(onTap)(index);
            });

        return (
            <GestureDetector gesture={tapGesture}>
                <Animated.View
                    style={[
                        localStyles.tabHitArea,
                        { width: segmentWidth },
                        animatedScaleStyle,
                    ]}>
                    <Animated.Text
                        style={[localStyles.tabText, animatedTextStyle]}
                        numberOfLines={1}>
                        {label}
                    </Animated.Text>
                </Animated.View>
            </GestureDetector>
        );
    },
);

// ─── Main Component ───────────────────────────────────────────────────────────

const TransactionFilterBar: React.FC<TransactionFilterBarProps> = ({
    segments = DEFAULT_SEGMENTS,
    selectedIndex,
    onChange,
}) => {
    const [containerWidth, setContainerWidth] = useState(0);

    // Shared value cho animation — giá trị float biểu thị index đang active
    const activeIndex = useSharedValue(selectedIndex);

    // Cập nhật khi selectedIndex thay đổi từ props
    React.useEffect(() => {
        activeIndex.value = withSpring(selectedIndex, SPRING_CONFIG);
    }, [selectedIndex, activeIndex]);

    // Kích thước mỗi tab
    const segmentWidth =
        containerWidth > 0
            ? (containerWidth - CONTAINER_PADDING * 2) / segments.length
            : 0;

    // Đo container
    const handleLayout = useCallback((e: LayoutChangeEvent) => {
        setContainerWidth(e.nativeEvent.layout.width);
    }, []);

    // Callback khi tap tab
    const handleTap = useCallback(
        (index: number) => {
            onChange(index);
        },
        [onChange],
    );

    // ── Indicator animated style ──
    const indicatorStyle = useAnimatedStyle(() => {
        if (segmentWidth <= 0) {
            return { opacity: 0 };
        }
        const translateX = activeIndex.value * segmentWidth;
        return {
            opacity: 1,
            transform: [{ translateX }],
            width: segmentWidth,
        };
    });

    return (
        <View style={localStyles.wrapper} onLayout={handleLayout}>
            {/* Frosted Glass background — BlurView */}
            {Platform.OS === 'ios' ? (
                <BlurView
                    style={StyleSheet.absoluteFill}
                    blurType="dark"
                    blurAmount={24}
                    reducedTransparencyFallbackColor="rgba(20, 20, 20, 0.85)"
                />
            ) : (
                // Android: BlurView có thể hạn chế, dùng fallback solid
                <View
                    style={[
                        StyleSheet.absoluteFill,
                        localStyles.androidBlurFallback,
                    ]}
                />
            )}

            {/* Inner container chứa indicator + tabs */}
            <View style={localStyles.innerContainer}>
                {/* Indicator — cục pill trượt */}
                <Animated.View style={[localStyles.indicator, indicatorStyle]}>
                    <View style={localStyles.indicatorInner} />
                </Animated.View>

                {/* Tab labels */}
                {segments.map((label, index) => (
                    <TabLabel
                        key={label}
                        label={label}
                        index={index}
                        activeProgress={activeIndex}
                        segmentWidth={segmentWidth}
                        onTap={handleTap}
                    />
                ))}
            </View>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const localStyles = StyleSheet.create({
    wrapper: {
        borderRadius: CONTAINER_BORDER_RADIUS,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.10)',
    },
    androidBlurFallback: {
        backgroundColor: 'rgba(25, 25, 30, 0.88)',
    },
    innerContainer: {
        flexDirection: 'row',
        padding: CONTAINER_PADDING,
        position: 'relative',
    },
    indicator: {
        position: 'absolute',
        top: CONTAINER_PADDING,
        left: CONTAINER_PADDING,
        bottom: CONTAINER_PADDING,
        justifyContent: 'center',
        alignItems: 'center',
    },
    indicatorInner: {
        flex: 1,
        width: '100%',
        borderRadius: INDICATOR_BORDER_RADIUS,
        backgroundColor: INDICATOR_BG,
        borderWidth: 1,
        borderColor: INDICATOR_BORDER,
        // Subtle glow
        ...(Platform.OS === 'ios'
            ? {
                shadowColor: 'rgba(255, 255, 255, 0.25)',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
            }
            : {
                elevation: 4,
            }),
    },
    tabHitArea: {
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
});

export default TransactionFilterBar;
