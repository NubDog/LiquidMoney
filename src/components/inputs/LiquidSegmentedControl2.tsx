import React from 'react';
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
import { FontSizes } from '../../common/theme';
import { useWaterDropAnimation } from '../../hooks/useWaterDrop';
import AppleGlassBackground from '../ui/AppleGlassBackground';

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

    const onLayout = (e: LayoutChangeEvent) => {
        setContainerWidth(e.nativeEvent.layout.width);
    };

    return (
        <AppleGlassBackground
            variant="chromeMaterial"
            borderRadius={9999}
            style={[styles.wrapper, style]}
            onLayout={onLayout}
        >
            <View style={styles.container}>
                {containerWidth > 0 && (
                    <Animated.View
                        renderToHardwareTextureAndroid={true}
                        needsOffscreenAlphaCompositing={true}
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
        </AppleGlassBackground>
    );
});

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 9999,
        width: '100%',
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
        overflow: 'hidden', // Change from visible to hidden to prevent bleed
        zIndex: 1,
    },
    indicatorOverlay: {
        borderRadius: 9999,
        backgroundColor: 'rgba(255, 255, 255, 0.22)',
        borderWidth: StyleSheet.hairlineWidth, // Force solid bounds rendering
        borderColor: 'transparent',
    },
});

export default LiquidSegmentedControl2;
