import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

interface UseWaterDropAnimationProps {
    options: { key: string; label: string }[];
    selected: string;
    gap?: number;
    paddingHorizontal?: number;
}

export const useWaterDropAnimation = ({
    options,
    selected,
    gap = 10,
    paddingHorizontal = 4,
}: UseWaterDropAnimationProps) => {
    const [containerWidth, setContainerWidth] = useState(0);
    const leftAnim = useRef(new Animated.Value(0)).current;
    const rightAnim = useRef(new Animated.Value(0)).current;
    const prevIdx = useRef(options.findIndex(o => o.key === selected));
    const prevWidth = useRef(0);

    const optionCount = options.length;
    const tabWidth = containerWidth > 0 
        ? (containerWidth - (paddingHorizontal * 2) - gap * (optionCount - 1)) / optionCount 
        : 0;

    useEffect(() => {
        if (containerWidth <= 0 || tabWidth <= 0) { return; }
        const idx = options.findIndex(o => o.key === selected);
        if (idx === -1) return;
        
        const targetLeft = paddingHorizontal + idx * (tabWidth + gap);
        const targetRight = containerWidth - (targetLeft + tabWidth);

        const isWidthChanged = prevWidth.current !== containerWidth;
        prevWidth.current = containerWidth;

        if (idx === prevIdx.current) {
            if (isWidthChanged) {
                // Initial layout or resize snap
                leftAnim.setValue(targetLeft);
                rightAnim.setValue(targetRight);
            }
            // Do NOT snap if it's just a re-render from props to prevent cancelling running animations
            return;
        }

        const isMovingRight = idx > prevIdx.current;
        const distance = Math.abs(idx - prevIdx.current);
        prevIdx.current = idx;

        // "Water Drop / Jelly" Physics - Extremely soft, fluid, and bouncy
        // The leading edge (head) springs tight but gently
        // The trailing edge (tail) lags heavily behind, creating a drop-like stretch,
        // then snaps satisfyingly into place.
        const headStiff = 140; // Soft pull forward
        const headDamp = 14;   // Slight elasticity at the destination
        
        // If leaping across multiple tabs (distance > 1), we increase tail stiffness 
        // to prevent the drop from unnaturally stretching across the entire container
        const tailStiff = distance > 1 ? 100 : 50;  // Tighter tail if jumping multi tabs
        const tailDamp = distance > 1 ? 14 : 10;

        Animated.parallel([
            Animated.spring(leftAnim, {
                toValue: targetLeft,
                damping: isMovingRight ? tailDamp : headDamp,
                stiffness: isMovingRight ? tailStiff : headStiff,
                mass: 1,
                useNativeDriver: false,
            }),
            Animated.spring(rightAnim, {
                toValue: targetRight,
                damping: isMovingRight ? headDamp : tailDamp,
                stiffness: isMovingRight ? headStiff : tailStiff,
                mass: 1,
                useNativeDriver: false,
            })
        ]).start();
    }, [selected, containerWidth, options, tabWidth, gap, leftAnim, rightAnim, paddingHorizontal]);

    return {
        leftAnim,
        rightAnim,
        tabWidth,
        containerWidth,
        setContainerWidth,
    };
};
