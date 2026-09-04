/**
 * ReorderableWalletCard.tsx — Draggable Wallet Card with Jiggle & Reorder Animation
 *
 * Features:
 * - 1.5s long-press to activate reordering mode
 * - Natural iOS-style subtle jiggle/wiggle animation (staggered by index)
 * - 60/120 FPS UI-thread slot displacement with snappy springs
 * - Elevation & scale-up on active drag
 * - Drop animation into target slot
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withSpring,
    runOnJS,
    Easing,
    type SharedValue,
} from 'react-native-reanimated';
import AppleWalletCard from './AppleWalletCard';
import { SpringConfigs } from '../../common/animations';
import type { Wallet } from '../../common/types';

interface ReorderableWalletCardProps {
    item: Wallet;
    index: number;
    totalCount: number;
    slotHeight: number;
    isReordering: boolean;
    activeDragIndex: SharedValue<number>;
    activeTargetIndex: SharedValue<number>;
    dragPanY: SharedValue<number>;
    isDragging: SharedValue<boolean>;
    onNavigate: (walletId: string) => void;
    onStartReordering: () => void;
    onDragEnd: (fromIndex: number, toIndex: number) => void;
}

const ReorderableWalletCard: React.FC<ReorderableWalletCardProps> = ({
    item,
    index,
    totalCount,
    slotHeight,
    isReordering,
    activeDragIndex,
    activeTargetIndex,
    dragPanY,
    isDragging,
    onNavigate,
    onStartReordering,
    onDragEnd,
}) => {
    const isDroppingRef = useRef(false);
    const slotHeightRef = useRef(slotHeight);
    slotHeightRef.current = slotHeight;
    const totalCountRef = useRef(totalCount);
    totalCountRef.current = totalCount;
    const onDragEndRef = useRef(onDragEnd);
    onDragEndRef.current = onDragEnd;

    const jiggleRotation = useSharedValue(0);

    // ─── Gentle Apple-Style Jiggle Animation ───────────────────────────────────
    useEffect(() => {
        if (isReordering) {
            // Very subtle 0.45deg angle with smooth sine easing (luxurious, gentle tremble)
            const angle = (index % 2 === 0 ? 1 : -1) * 0.45;
            const duration = 140 + (index % 3) * 15;

            jiggleRotation.value = withRepeat(
                withSequence(
                    withTiming(-angle, { duration, easing: Easing.inOut(Easing.sin) }),
                    withTiming(angle, { duration, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            );
        } else {
            jiggleRotation.value = withTiming(0, { duration: 150 });
        }
    }, [isReordering, index, jiggleRotation]);

    // ─── Drop Handler Callback ────────────────────────────────────────────────
    const handleFinishDrop = (from: number, to: number) => {
        onDragEndRef.current(from, to);
        isDroppingRef.current = false;
    };

    // ─── PanResponder for Drag & Drop ─────────────────────────────────────────
    const panResponder = useMemo(() => {
        return PanResponder.create({
            onStartShouldSetPanResponderCapture: () => isReordering && !isDroppingRef.current,
            onMoveShouldSetPanResponderCapture: () => isReordering && !isDroppingRef.current,
            onPanResponderGrant: () => {
                if (!isReordering || isDroppingRef.current) return;
                activeDragIndex.value = index;
                activeTargetIndex.value = index;
                dragPanY.value = 0;
                isDragging.value = true;
            },
            onPanResponderMove: (_, gestureState) => {
                if (!isReordering || isDroppingRef.current) return;
                // Directly update translateY so the card strictly follows the user's finger!
                dragPanY.value = gestureState.dy;

                const currentSlotHeight = slotHeightRef.current;
                const currentTotal = totalCountRef.current;
                const rawTarget = index + Math.round(gestureState.dy / currentSlotHeight);
                const clampedTarget = Math.max(0, Math.min(currentTotal - 1, rawTarget));
                if (activeTargetIndex.value !== clampedTarget) {
                    activeTargetIndex.value = clampedTarget;
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (!isReordering || isDroppingRef.current) return;

                isDroppingRef.current = true;
                const currentSlotHeight = slotHeightRef.current;
                const currentTotal = totalCountRef.current;
                const rawTarget = index + Math.round(gestureState.dy / currentSlotHeight);
                const finalTarget = Math.max(0, Math.min(currentTotal - 1, rawTarget));
                const targetOffset = (finalTarget - index) * currentSlotHeight;

                dragPanY.value = withTiming(
                    targetOffset,
                    { duration: 180, easing: Easing.out(Easing.cubic) },
                    (finished) => {
                        'worklet';
                        if (finished) {
                            runOnJS(handleFinishDrop)(index, finalTarget);
                        }
                    }
                );
            },
            onPanResponderTerminate: () => {
                if (!isReordering) return;
                isDroppingRef.current = true;
                dragPanY.value = withTiming(0, { duration: 150 }, (finished) => {
                    'worklet';
                    if (finished) {
                        runOnJS(handleFinishDrop)(index, index);
                    }
                });
            },
        });
    }, [isReordering, index, activeDragIndex, activeTargetIndex, dragPanY, isDragging]);

    // ─── Animated Style ───────────────────────────────────────────────────────
    const animatedStyle = useAnimatedStyle(() => {
        'worklet';
        const isThisCardDragged = isDragging.value && activeDragIndex.value === index;

        if (isThisCardDragged) {
            return {
                transform: [
                    { translateY: dragPanY.value },
                    { scale: 1.04 },
                    { rotate: '0deg' },
                ],
                zIndex: 9999,
                elevation: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 16 },
                shadowOpacity: 0.8,
                shadowRadius: 24,
            };
        }

        // Shift calculation if another card is dragged over this item's slot
        let shiftY = 0;
        if (isDragging.value && activeDragIndex.value !== -1 && activeTargetIndex.value !== -1) {
            const from = activeDragIndex.value;
            const to = activeTargetIndex.value;

            if (from < to) {
                // Dragging downwards: cards between (from, to] shift UP
                if (index > from && index <= to) {
                    shiftY = -slotHeight;
                }
            } else if (from > to) {
                // Dragging upwards: cards between [to, from) shift DOWN
                if (index >= to && index < from) {
                    shiftY = slotHeight;
                }
            }
        }

        const rot = isReordering ? jiggleRotation.value : 0;

        return {
            transform: [
                { translateY: withSpring(shiftY, SpringConfigs.snappy) },
                { rotate: `${rot}deg` },
                { scale: 1 },
            ],
            zIndex: 1,
            elevation: 4,
        };
    });

    const handleLayout = (e: LayoutChangeEvent) => {
        const h = Math.round(e.nativeEvent.layout.height + 14);
        if (h > 50) {
            slotHeightRef.current = h;
        }
    };

    return (
        <Animated.View
            onLayout={handleLayout}
            {...panResponder.panHandlers}
            style={[styles.container, animatedStyle]}
        >
            <AppleWalletCard
                name={item.name}
                balance={item.current_balance}
                imageUri={item.image_uri}
                onPress={() => onNavigate(item.id)}
                onLongPress={onStartReordering}
                delayLongPress={1500}
                disabled={isReordering}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
});

export default React.memo(ReorderableWalletCard);
