/**
 * ReorderableWalletCard.tsx — Draggable Wallet Card with Jiggle & Reorder Animation
 *
 * Features:
 * - 0.5s long-press to activate reordering mode
 * - Natural iOS-style subtle jiggle/wiggle animation (staggered by index)
 * - 60/120 FPS UI-thread slot displacement with snappy springs
 * - Elevation & scale-up on active drag
 * - Drop animation into target slot
 * - Zero double-animation & zero flicker: positions are managed via orderMap on UI thread
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedReaction,
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
    orderMap: SharedValue<number[]>;
    activeDragIndex: SharedValue<number>;
    activeTargetSlot: SharedValue<number>;
    dragPanY: SharedValue<number>;
    isDragging: SharedValue<boolean>;
    onNavigate: (walletId: string) => void;
    onStartReordering: () => void;
    onDragCommit: (newOrderMap: number[]) => void;
}

const ReorderableWalletCard: React.FC<ReorderableWalletCardProps> = ({
    item,
    index,
    totalCount,
    slotHeight,
    isReordering,
    orderMap,
    activeDragIndex,
    activeTargetSlot,
    dragPanY,
    isDragging,
    onNavigate,
    onStartReordering,
    onDragCommit,
}) => {
    const isDroppingRef = useRef(false);
    const onDragCommitRef = useRef(onDragCommit);
    onDragCommitRef.current = onDragCommit;
    const initialIndexRef = useRef(index);

    // Shared values accessible inside Reanimated worklets on UI thread
    const currentIndexShared = useSharedValue(index);
    const slotHeightShared = useSharedValue(slotHeight);
    const totalCountShared = useSharedValue(totalCount);

    useEffect(() => {
        currentIndexShared.value = index;
    }, [index, currentIndexShared]);

    useEffect(() => {
        slotHeightShared.value = slotHeight;
    }, [slotHeight, slotHeightShared]);

    useEffect(() => {
        totalCountShared.value = totalCount;
    }, [totalCount, totalCountShared]);

    // Current shift offset for this card (to open a gap / hold slot position)
    const currentShiftY = useSharedValue(0);
    const jiggleRotation = useSharedValue(0);

    // Card-specific drag & smooth landing animation values
    const isThisCardActive = useSharedValue(false);
    const dragScale = useSharedValue(1);
    const dragElevation = useSharedValue(4);

    // ─── Gentle Apple-Style Jiggle Animation (Stable across reorders) ───────────
    useEffect(() => {
        if (isReordering) {
            const angle = (initialIndexRef.current % 2 === 0 ? 1 : -1) * 0.45;
            const duration = 140 + (initialIndexRef.current % 3) * 15;

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
            isThisCardActive.value = false;
            dragScale.value = 1;
            dragElevation.value = 4;
            currentShiftY.value = 0;
        }
    }, [isReordering, jiggleRotation, isThisCardActive, dragScale, dragElevation, currentShiftY]);

    // ─── Live Slot Shift Calculation (UI Thread) ──────────────────────────────
    useAnimatedReaction(
        () => {
            'worklet';
            if (!isReordering) return 0;

            const myIdx = currentIndexShared.value;
            const h = slotHeightShared.value;
            const map = orderMap.value;
            if (!map || map.length <= myIdx) return 0;

            // If this card is actively being dragged, its Y is controlled by dragPanY
            if (isThisCardActive.value) {
                return 0;
            }

            const myRestingSlot = map[myIdx];

            // If another card is actively being dragged, calculate displacement to open gap
            if (activeDragIndex.value !== -1 && activeDragIndex.value !== myIdx && activeTargetSlot.value !== -1) {
                const dragIdx = activeDragIndex.value;
                const startSlot = map[dragIdx];
                const targetSlot = activeTargetSlot.value;

                let visualSlot = myRestingSlot;
                if (startSlot < targetSlot) {
                    // Dragged downwards: cards between (startSlot, targetSlot] shift UP
                    if (myRestingSlot > startSlot && myRestingSlot <= targetSlot) {
                        visualSlot = myRestingSlot - 1;
                    }
                } else if (startSlot > targetSlot) {
                    // Dragged upwards: cards between [targetSlot, startSlot) shift DOWN
                    if (myRestingSlot >= targetSlot && myRestingSlot < startSlot) {
                        visualSlot = myRestingSlot + 1;
                    }
                }
                return (visualSlot - myIdx) * h;
            }

            // No active drag: maintain current resting slot position
            return (myRestingSlot - myIdx) * h;
        },
        (targetOffset, prevOffset) => {
            'worklet';
            if (targetOffset !== prevOffset) {
                if (activeDragIndex.value !== -1) {
                    // Smoothly slide to open/close the gap while user is dragging
                    currentShiftY.value = withSpring(targetOffset, SpringConfigs.snappy);
                } else {
                    // Resting state: hold position smoothly without spring overshoot
                    currentShiftY.value = targetOffset;
                }
            }
        },
        [isReordering]
    );

    // ─── Drop Handler Callback ────────────────────────────────────────────────
    const handleFinishDrop = (newMap: number[]) => {
        onDragCommitRef.current(newMap);
        isDroppingRef.current = false;
    };

    // ─── PanResponder for Drag & Drop ─────────────────────────────────────────
    const panResponder = useMemo(() => {
        return PanResponder.create({
            onStartShouldSetPanResponderCapture: () => isReordering && !isDroppingRef.current,
            onMoveShouldSetPanResponderCapture: () => isReordering && !isDroppingRef.current,
            onPanResponderTerminationRequest: () => false,
            onPanResponderGrant: () => {
                if (!isReordering || isDroppingRef.current) return;
                const myIdx = currentIndexShared.value;
                const map = orderMap.value;
                const mySlot = map && map.length > myIdx ? map[myIdx] : myIdx;

                isThisCardActive.value = true;
                dragScale.value = withSpring(1.04, SpringConfigs.snappy);
                dragElevation.value = withSpring(16, SpringConfigs.snappy);
                activeDragIndex.value = myIdx;
                activeTargetSlot.value = mySlot;
                dragPanY.value = 0;
                isDragging.value = true;
            },
            onPanResponderMove: (_, gestureState) => {
                if (!isReordering || isDroppingRef.current) return;
                dragPanY.value = gestureState.dy;

                const currentSlotHeight = slotHeightShared.value;
                const currentTotal = totalCountShared.value;
                const myIdx = currentIndexShared.value;
                const map = orderMap.value;
                const mySlot = map && map.length > myIdx ? map[myIdx] : myIdx;

                const rawTarget = mySlot + Math.round(gestureState.dy / currentSlotHeight);
                const clampedTarget = Math.max(0, Math.min(currentTotal - 1, rawTarget));
                if (activeTargetSlot.value !== clampedTarget) {
                    activeTargetSlot.value = clampedTarget;
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (!isReordering || isDroppingRef.current) return;

                isDroppingRef.current = true;
                const currentSlotHeight = slotHeightShared.value;
                const currentTotal = totalCountShared.value;
                const myIdx = currentIndexShared.value;
                const map = orderMap.value;
                const mySlot = map && map.length > myIdx ? map[myIdx] : myIdx;

                const rawTarget = mySlot + Math.round(gestureState.dy / currentSlotHeight);
                const finalTarget = Math.max(0, Math.min(currentTotal - 1, rawTarget));
                const targetOffset = (finalTarget - mySlot) * currentSlotHeight;

                // Animate scale & elevation smoothly down to normal over the drop duration (180ms)
                dragScale.value = withTiming(1.0, { duration: 180, easing: Easing.out(Easing.cubic) });
                dragElevation.value = withTiming(4, { duration: 180, easing: Easing.out(Easing.cubic) });

                dragPanY.value = withTiming(
                    targetOffset,
                    { duration: 180, easing: Easing.out(Easing.cubic) },
                    (finished) => {
                        'worklet';
                        if (finished) {
                            // Compute new order map on UI thread
                            const fromSlot = mySlot;
                            const toSlot = finalTarget;
                            const currentMap = orderMap.value;
                            const newMap = [];
                            for (let i = 0; i < currentMap.length; i++) {
                                if (i === myIdx) {
                                    newMap.push(toSlot);
                                } else if (fromSlot < toSlot) {
                                    if (currentMap[i] > fromSlot && currentMap[i] <= toSlot) {
                                        newMap.push(currentMap[i] - 1);
                                    } else {
                                        newMap.push(currentMap[i]);
                                    }
                                } else if (fromSlot > toSlot) {
                                    if (currentMap[i] >= toSlot && currentMap[i] < fromSlot) {
                                        newMap.push(currentMap[i] + 1);
                                    } else {
                                        newMap.push(currentMap[i]);
                                    }
                                } else {
                                    newMap.push(currentMap[i]);
                                }
                            }
                            orderMap.value = newMap;
                            // Seamless handoff: resting offset matches dropped position with 0 deviation
                            currentShiftY.value = (toSlot - myIdx) * currentSlotHeight;
                            isThisCardActive.value = false;
                            activeDragIndex.value = -1;
                            activeTargetSlot.value = -1;
                            dragPanY.value = 0;
                            isDragging.value = false;
                            runOnJS(handleFinishDrop)(newMap);
                        }
                    }
                );
            },
            onPanResponderTerminate: () => {
                if (!isReordering) return;
                isDroppingRef.current = true;
                const myIdx = currentIndexShared.value;
                const map = orderMap.value;
                const mySlot = map && map.length > myIdx ? map[myIdx] : myIdx;
                const currentSlotHeight = slotHeightShared.value;

                dragScale.value = withTiming(1.0, { duration: 150 });
                dragElevation.value = withTiming(4, { duration: 150 });
                dragPanY.value = withTiming(0, { duration: 150 }, (finished) => {
                    'worklet';
                    if (finished) {
                        currentShiftY.value = (mySlot - myIdx) * currentSlotHeight;
                        isThisCardActive.value = false;
                        activeDragIndex.value = -1;
                        activeTargetSlot.value = -1;
                        dragPanY.value = 0;
                        isDragging.value = false;
                        isDroppingRef.current = false;
                    }
                });
            },
        });
    }, [
        isReordering,
        orderMap,
        activeDragIndex,
        activeTargetSlot,
        dragPanY,
        isDragging,
        slotHeightShared,
        totalCountShared,
        currentIndexShared,
        isThisCardActive,
        dragScale,
        dragElevation,
        currentShiftY,
    ]);

    // ─── Animated Style ───────────────────────────────────────────────────────
    const animatedStyle = useAnimatedStyle(() => {
        'worklet';
        if (isThisCardActive.value) {
            const myIdx = currentIndexShared.value;
            const map = orderMap.value;
            const mySlot = map && map.length > myIdx ? map[myIdx] : myIdx;
            const startOffsetY = (mySlot - myIdx) * slotHeightShared.value;

            return {
                transform: [
                    { translateY: startOffsetY + dragPanY.value },
                    { scale: dragScale.value },
                    { rotate: '0deg' },
                ],
                zIndex: 9999,
                elevation: dragElevation.value,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 16 },
                shadowOpacity: 0.8,
                shadowRadius: 24,
            };
        }

        const rot = isReordering ? jiggleRotation.value : 0;

        return {
            transform: [
                { translateY: currentShiftY.value },
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
            slotHeightShared.value = h;
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
                delayLongPress={500}
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
