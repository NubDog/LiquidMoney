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
import { FontSizes } from '../../common/theme';
import { useWaterDropAnimation } from '../../hooks/useWaterDrop';

interface Option {
    key: string;
    label: string;
}

interface AppleSegmentedControlProps {
    options: Option[];
    selected: string;
    onChange: (key: string) => void;
    style?: StyleProp<ViewStyle>;
}

const AppleSegmentedControl: React.FC<AppleSegmentedControlProps> = React.memo(({
    options,
    selected,
    onChange,
    style,
}) => {
    const { translateXAnim, scaleXAnim, containerWidth, setContainerWidth, tabWidth } = useWaterDropAnimation({
        options,
        selected,
        gap: 6,
        paddingHorizontal: 6,
    });

    const onLayout = (e: LayoutChangeEvent) => {
        setContainerWidth(e.nativeEvent.layout.width);
    };

    return (
        <View style={[styles.wrapper, style]} onLayout={onLayout}>
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
        </View>
    );
});

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 999,
        overflow: 'hidden',
        width: '100%',
        backgroundColor: '#2C2C2E', // iOS Dark Mode Elevated
    },
    container: {
        flexDirection: 'row',
        gap: 6,
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
        borderRadius: 999,
    },
    text: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: 'rgba(235, 235, 245, 0.6)', // Unselected text color
    },
    textActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    indicatorWrapper: {
        position: 'absolute',
        top: 6,
        bottom: 6,
        left: 0,
        borderRadius: 999,
        zIndex: 1,
        // Standard iOS shadow for segmented control indicator
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    indicatorOverlay: {
        borderRadius: 999,
        backgroundColor: '#48484A', // iOS Dark Mode Light elevated
    },
});

export default AppleSegmentedControl;
