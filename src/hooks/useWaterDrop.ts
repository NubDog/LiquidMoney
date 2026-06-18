import { useEffect, useRef, useState } from 'react';
import { useSharedValue, withSpring, cancelAnimation } from 'react-native-reanimated';

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
    const translateXAnim = useSharedValue(0);
    
    // We can also animate scaleX for a bouncy width effect
    const scaleXAnim = useSharedValue(1);
    
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
        
        // Exact horizontal position
        const targetX = paddingHorizontal + idx * (tabWidth + gap);

        const isWidthChanged = prevWidth.current !== containerWidth;
        prevWidth.current = containerWidth;

        if (idx === prevIdx.current) {
            if (isWidthChanged) {
                // Initial snap
                translateXAnim.value = targetX;
                scaleXAnim.value = 1;
            }
            return;
        }

        const distance = Math.abs(idx - prevIdx.current);
        prevIdx.current = idx;

        // "Water Drop" stretching effect via scaleX
        // Since transform-origin is center by default, we stretch it momentarily
        // We set the stretch scale instantly, and then spring back to 1.
        const stretchScale = 1 + (distance * 0.35);

        // Stop any running animations to prevent conflicts
        cancelAnimation(translateXAnim);
        cancelAnimation(scaleXAnim);

        // Instantly stretch
        scaleXAnim.value = stretchScale;

        // Animate natively
        translateXAnim.value = withSpring(targetX, {
            stiffness: 250,
            damping: 24,
            mass: 1,
        });
        
        scaleXAnim.value = withSpring(1, {
            stiffness: 200,
            damping: 18,
            mass: 1,
        });

    }, [selected, containerWidth, options, tabWidth, gap, paddingHorizontal, translateXAnim, scaleXAnim]);

    return {
        translateXAnim,
        scaleXAnim,
        tabWidth,
        containerWidth,
        setContainerWidth,
    };
};
