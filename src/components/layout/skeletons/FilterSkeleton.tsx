import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Spacing, Radii } from '../../../common/theme';

interface Props {
    pulseStyle: any;
}

export const FilterSkeleton: React.FC<Props> = ({ pulseStyle }) => {
    return (
        <View style={styles.filterWrapper}>
            <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.03)' }, pulseStyle]} />
        </View>
    );
};

const styles = StyleSheet.create({
    filterWrapper: {
        marginBottom: Spacing.xl,
        height: 44, // Exact height of AppleSegmentedControl
        borderRadius: Radii.xl,
        backgroundColor: '#1C1C1E', // Match AppleSegmentedControl background
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
});
