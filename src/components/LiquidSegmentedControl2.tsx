import React, { useState } from 'react';
import { 
    Animated,
    Pressable, 
    StyleSheet, 
    Text, 
    View, 
    ViewStyle, 
    StyleProp, 
    LayoutChangeEvent 
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { FontSizes } from '../common/theme';
import { useWaterDropAnimation } from '../hooks/useWaterDrop';

interface Option {
    key: string;
    label: string;
}

interface LiquidSegmentedControl2Props {
    options: Option[];
    selected: string;
    onChange: (key: string) => void;
    style?: StyleProp<ViewStyle>;
}

const LiquidSegmentedControl2: React.FC<LiquidSegmentedControl2Props> = React.memo(({
    options,
    selected,
    onChange,
    style,
}) => {
    // We limit it to min 2, max 4 by logic but UI visually supports whatever array is passed.
    const { translateXAnim, scaleXAnim, containerWidth, setContainerWidth, tabWidth } = useWaterDropAnimation({
        options,
        selected,
        gap: 8,
        paddingHorizontal: 6,
    });

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const hasDimensions = dimensions.width > 0 && dimensions.height > 0;

    const onLayout = (e: LayoutChangeEvent) => {
        setDimensions({
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
        });
        setContainerWidth(e.nativeEvent.layout.width);
    };

    const pillRadius = hasDimensions ? dimensions.height / 2 : 100;
    const coreThickness = hasDimensions ? Math.max(1, dimensions.height * 0.02) : 1;
    const bloomThickness = hasDimensions ? Math.max(3, dimensions.height * 0.08) : 3;

    return (
        <View style={[styles.wrapper, style]} onLayout={onLayout}>
            {/* @ts-ignore */}
            <BlurView
                blurType="light"
                blurAmount={30}
                overlayColor="transparent"
                reducedTransparencyFallbackColor="transparent"
            >
                {hasDimensions && (
                    <Svg width={dimensions.width} height={dimensions.height} style={StyleSheet.absoluteFill}>
                        <Defs>
                            {/* Inner ambient glass body */}
                            <RadialGradient id="glassBodyTL" cx="0%" cy="0%" rx="100%" ry="100%">
                                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.15" />
                                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                            </RadialGradient>
                            <RadialGradient id="glassBodyBR" cx="100%" cy="100%" rx="100%" ry="100%">
                                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.08" />
                                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                            </RadialGradient>

                            {/* Border glow */}
                            <RadialGradient id="tlGlow" cx="0%" cy="0%" rx="61.8%" ry="38.2%">
                                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1.0" />
                                <Stop offset="0.08" stopColor="#FFFFFF" stopOpacity="0.8" />
                                <Stop offset="0.25" stopColor="#FFFFFF" stopOpacity="0.35" />
                                <Stop offset="0.618" stopColor="#FFFFFF" stopOpacity="0.1" />
                                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                            </RadialGradient>

                            <RadialGradient id="brGlow" cx="100%" cy="100%" rx="61.8%" ry="38.2%">
                                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.8" />
                                <Stop offset="0.1" stopColor="#FFFFFF" stopOpacity="0.6" />
                                <Stop offset="0.25" stopColor="#FFFFFF" stopOpacity="0.2" />
                                <Stop offset="0.618" stopColor="#FFFFFF" stopOpacity="0.05" />
                                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                            </RadialGradient>
                        </Defs>
                        
                        {/* Ambient body fill */}
                        <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="url(#glassBodyTL)" rx={pillRadius} />
                        <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="url(#glassBodyBR)" rx={pillRadius} />
                        
                        <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#tlGlow)" strokeWidth={bloomThickness} opacity="0.35" rx={Math.max(0, pillRadius - 0.5)} />
                        <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#tlGlow)" strokeWidth={coreThickness} opacity="1.0" rx={Math.max(0, pillRadius - 0.5)} />

                        <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#brGlow)" strokeWidth={bloomThickness} opacity="0.35" rx={Math.max(0, pillRadius - 0.5)} />
                        <Rect x="0.5" y="0.5" width={Math.max(0, dimensions.width - 1)} height={Math.max(0, dimensions.height - 1)} fill="none" stroke="url(#brGlow)" strokeWidth={coreThickness} opacity="1.0" rx={Math.max(0, pillRadius - 0.5)} />
                    </Svg>
                )}

                <View style={styles.container}>
                    {containerWidth > 0 && (
                        <Animated.View
                            style={[
                                styles.indicatorWrapper,
                                {
                                    width: tabWidth,
                                    transform: [
                                        { translateX: translateXAnim },
                                        { scaleX: scaleXAnim }
                                    ]
                                }
                            ]}
                        >
                            <View style={[StyleSheet.absoluteFill, styles.indicatorOverlay]} />
                        </Animated.View>
                    )}

                    {options.map(option => (
                        <Pressable
                            key={option.key}
                            style={[styles.tab, { width: tabWidth }]}
                            onPress={() => onChange(option.key)}
                        >
                            <Text style={[styles.text, selected === option.key && styles.textActive]}>
                                {option.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </BlurView>
        </View>
    );
});

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 9999,
        overflow: 'hidden',
        width: '100%',
        backgroundColor: 'transparent',
    },
    container: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 6,
        paddingHorizontal: 6,
        position: 'relative',
        zIndex: 2,
    },
    tab: {
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        borderRadius: 9999,
    },
    text: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.45)', // Unselected text color
    },
    textActive: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
    indicatorWrapper: {
        position: 'absolute',
        top: 6,
        bottom: 6,
        left: 0,
        borderRadius: 9999,
        overflow: 'visible', // allows shadow outside the indicator natively
        zIndex: 1,
    },
    indicatorOverlay: {
        borderRadius: 9999,
        backgroundColor: 'rgba(255, 255, 255, 0.22)', // slightly more opaque to pop like a bubble
    },
});

export default LiquidSegmentedControl2;
