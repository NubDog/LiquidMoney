import { useEffect, useRef, useState } from 'react';
import { useSharedValue, withSpring } from 'react-native-reanimated';

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
    const leftAnim = useSharedValue(0);
    const rightAnim = useSharedValue(0);
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
                leftAnim.value = targetLeft;
                rightAnim.value = targetRight;
            }
            // Do NOT snap if it's just a re-render from props to prevent cancelling running animations
            return;
        }

        const isMovingRight = idx > prevIdx.current;
        const distance = Math.abs(idx - prevIdx.current);
        prevIdx.current = idx;

        // "Water Drop / Jelly" Physics - Extremely soft, fluid, and bouncy
        const headStiff = 140; // Soft pull forward
        const headDamp = 14;   // Slight elasticity at the destination
        
        const tailStiff = distance > 1 ? 100 : 50;  // Tighter tail if jumping multi tabs
        const tailDamp = distance > 1 ? 14 : 10;

        leftAnim.value = withSpring(targetLeft, {
            damping: isMovingRight ? tailDamp : headDamp,
            stiffness: isMovingRight ? tailStiff : headStiff,
            mass: 1,
        });
        
        rightAnim.value = withSpring(targetRight, {
            damping: isMovingRight ? headDamp : tailDamp,
            stiffness: isMovingRight ? headStiff : tailStiff,
            mass: 1,
        });
    }, [selected, containerWidth, options, tabWidth, gap, leftAnim, rightAnim, paddingHorizontal]);

    return {
        leftAnim,
        rightAnim,
        tabWidth,
        containerWidth,
        setContainerWidth,
    };
};
