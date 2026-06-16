import React, { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { FPSMonitor } = NativeModules;
const fpsEventEmitter = FPSMonitor ? new NativeEventEmitter(FPSMonitor) : null;

const FPSMonitorComponent: React.FC = () => {
    const [fps, setFps] = useState<number>(0);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (Platform.OS !== 'android' || !fpsEventEmitter) return;

        const subscription = fpsEventEmitter.addListener('onFPSUpdate', (currentFps: number) => {
            setFps(currentFps);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    if (Platform.OS !== 'android' || fps === 0) return null;

    let color = '#34C759'; // Green for 90+
    if (fps < 60) color = '#FF3B30'; // Red for < 60
    else if (fps < 90) color = '#FFCC00'; // Yellow for 60-89

    return (
        <View style={[styles.container, { top: insets.top || 10 }]} pointerEvents="none">
            <Text style={[styles.text, { color }]}>{fps} FPS</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 99999,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
    text: {
        fontSize: 12,
        fontWeight: '900',
        fontVariant: ['tabular-nums'], // Helps with monospaced numbers so it doesn't jump
    },
});

export default FPSMonitorComponent;
