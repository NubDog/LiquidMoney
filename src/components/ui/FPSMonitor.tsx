import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFrameCallback, runOnJS, useSharedValue } from 'react-native-reanimated';

export default function FPSMonitor() {
    const [fps, setFps] = useState(0);
    const lastTick = useSharedValue(0);
    const frameCount = useSharedValue(0);

    const updateFps = (value: number) => {
        setFps(Math.round(value));
    };

    useFrameCallback((frameInfo) => {
        'worklet';
        if (lastTick.value === 0) {
            lastTick.value = frameInfo.timestamp;
            return;
        }

        frameCount.value += 1;
        const elapsed = frameInfo.timestamp - lastTick.value;

        // Update every 500ms to avoid overwhelming the JS thread
        if (elapsed >= 500) { 
            const currentFps = (frameCount.value * 1000) / elapsed;
            runOnJS(updateFps)(currentFps);
            lastTick.value = frameInfo.timestamp;
            frameCount.value = 0;
        }
    });

    // Provide a stable color based on FPS performance
    const getColor = () => {
        if (fps >= 100) return '#00FF00'; // Green for 120Hz/144Hz
        if (fps >= 55) return '#ADFF2F'; // Yellow-Green for 60Hz
        if (fps >= 30) return '#FFA500'; // Orange for poor
        return '#FF0000'; // Red for severe lag
    };

    if (fps === 0) return null; // Don't render until we have a reading

    return (
        <View style={styles.container} pointerEvents="none">
            <Text style={[styles.text, { color: getColor() }]}>
                {fps} FPS
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60, // Avoid safe area and headers
        right: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        zIndex: 9999,
        elevation: 9999,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    text: {
        fontWeight: '900',
        fontSize: 13,
        fontFamily: 'monospace',
    }
});
