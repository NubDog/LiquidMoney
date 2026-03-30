import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { FontSizes, Radii } from '../common/theme';
import { useWaterDropAnimation } from '../hooks/useWaterDrop';
import LiquidCard from './LiquidCard';

interface Option {
    key: string;
    label: string;
}

interface LiquidSegmentedControlProps {
    options: Option[];
    selected: string;
    onChange: (key: string) => void;
    style?: ViewStyle;
}

const LiquidSegmentedControl: React.FC<LiquidSegmentedControlProps> = React.memo(({
    options,
    selected,
    onChange,
    style,
}) => {
    const { leftAnim, rightAnim, containerWidth, setContainerWidth, tabWidth } = useWaterDropAnimation({
        options,
        selected,
        gap: 10,
        paddingHorizontal: 8,
    });

    return (
        <LiquidCard intensity="heavy" borderRadius={Radii.lg} style={[styles.wrapper, style]}>
            <View
                style={styles.container}
                onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}>
                {containerWidth > 0 && (
                    <Animated.View
                        style={[
                            styles.indicatorWrapper,
                            {
                                left: leftAnim,
                                right: rightAnim,
                            },
                        ]}>
                        <View style={[StyleSheet.absoluteFill, styles.indicatorOverlay]} />
                        <View style={[StyleSheet.absoluteFill, styles.indicatorBorder]} />
                    </Animated.View>
                )}
                {options.map(option => (
                    <Pressable
                        key={option.key}
                        style={[styles.tab, { width: tabWidth }]}
                        onPress={() => onChange(option.key)}>
                        <Text style={[
                            styles.text,
                            selected === option.key && styles.textActive,
                        ]}>
                            {option.label}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </LiquidCard>
    );
});

const styles = StyleSheet.create({
    wrapper: {
        overflow: 'hidden',
    },
    container: {
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 8,
        paddingHorizontal: 8,
        position: 'relative',
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
        borderRadius: Radii.md,
        zIndex: 2,
    },
    text: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
    },
    textActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    indicatorWrapper: {
        position: 'absolute',
        top: 8,
        bottom: 8,
        borderRadius: Radii.md,
        overflow: 'hidden',
        zIndex: 1,
    },
    indicatorOverlay: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)', // Perfectly pristine transparent highlight
    },
    indicatorBorder: {
        borderRadius: Radii.md - 2,
        borderWidth: 0,
    },
});

export default LiquidSegmentedControl;
