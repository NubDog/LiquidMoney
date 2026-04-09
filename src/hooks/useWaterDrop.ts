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
    const translateXAnim = useRef(new Animated.Value(0)).current;
    
    // We can also animate scaleX for a bouncy width effect
    const scaleXAnim = useRef(new Animated.Value(1)).current;
    
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
                translateXAnim.setValue(targetX);
                scaleXAnim.setValue(1);
            }
            return;
        }

        const distance = Math.abs(idx - prevIdx.current);
        prevIdx.current = idx;

        // "Water Drop" stretching effect via scaleX
        // Since transform-origin is center by default, we stretch it momentarily
        // The scale factor should stretch it to cover the distance
        const stretchScale = 1 + (distance * 0.5);

        Animated.sequence([
            // Stretch simultaneously while moving
            Animated.parallel([
                Animated.spring(translateXAnim, {
                    toValue: targetX,
                    bounciness: 8,
                    speed: 12,
                    useNativeDriver: true,
                }),
                Animated.sequence([
                    Animated.timing(scaleXAnim, {
                        toValue: stretchScale,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scaleXAnim, {
                        toValue: 1,
                        bounciness: 12,
                        speed: 16,
                        useNativeDriver: true,
                    })
                ])
            ])
        ]).start();

    }, [selected, containerWidth, options, tabWidth, gap, paddingHorizontal, translateXAnim, scaleXAnim]);

    return {
        translateXAnim,
        scaleXAnim,
        tabWidth,
        containerWidth,
        setContainerWidth,
    };
};
