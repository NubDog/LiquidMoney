/**
 * TerminalLogModal.tsx
 * Modal hiển thị tiến trình dạng terminal (console logs)
 * Dùng cho các tác vụ Developer Tools (vd: Generate mock data)
 */

import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Terminal } from 'lucide-react-native';

interface TerminalLogModalProps {
    visible: boolean;
    logs: string[];
    isComplete: boolean;
    onClose: () => void;
}

const TerminalLogModal: React.FC<TerminalLogModalProps> = ({
    visible,
    logs,
    isComplete,
    onClose,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }).start();
        } else {
            fadeAnim.setValue(0);
        }
    }, [visible, fadeAnim]);

    // Auto scroll to bottom
    const handleContentSizeChange = () => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={isComplete ? onClose : undefined}
        >
            <View style={styles.root}>
                {/* Backdrop */}
                <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />

                {/* Modal Container */}
                <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Terminal size={18} color="#4ade80" />
                            <Text style={styles.title}>Developer Console</Text>
                        </View>
                        {isComplete && (
                            <Pressable onPress={onClose} style={styles.closeBtn}>
                                <Text style={styles.closeBtnText}>Xong</Text>
                            </Pressable>
                        )}
                    </View>

                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.terminalWindow}
                        contentContainerStyle={styles.scrollContent}
                        onContentSizeChange={handleContentSizeChange}
                        showsVerticalScrollIndicator={true}
                        indicatorStyle="white"
                    >
                        {logs.map((log, index) => {
                            const isError = log.includes('[ERROR]') || log.includes('error');
                            const isSuccess = log.includes('[SUCCESS]') || log.includes('Done');
                            const isWarning = log.includes('[WARN]');

                            let color = '#a3a3a3'; // Lighter gray for normal text
                            if (isError) color = '#f87171'; // Red
                            else if (isSuccess) color = '#4ade80'; // Green
                            else if (isWarning) color = '#facc15'; // Yellow
                            else if (log.startsWith('>')) color = '#e5e5e5'; // White-ish for commands/info

                            return (
                                <Text key={index} style={[styles.logText, { color }]}>
                                    {log}
                                </Text>
                            );
                        })}
                        {/* Fake cursor blinking if not complete */}
                        {!isComplete && (
                            <Text style={[styles.logText, styles.cursorAnimation]}>_</Text>
                        )}
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    container: {
        width: '90%',
        height: '75%',
        backgroundColor: '#0f172a', // Slate 900
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#334155', // Slate 700
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1e293b', // Slate 800
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        color: '#f1f5f9',
        fontSize: 15,
        fontWeight: '600',
    },
    closeBtn: {
        backgroundColor: '#334155',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
    },
    closeBtnText: {
        color: '#4ade80',
        fontSize: 14,
        fontWeight: '700',
    },
    terminalWindow: {
        flex: 1,
        backgroundColor: '#020617', // Slate 950 (Terminal BG)
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    logText: {
        fontFamily: 'monospace', // Falls back to system monospace font safely
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 4,
    },
    cursorAnimation: {
        color: '#4ade80',
        opacity: 0.8,
    },
});

export default TerminalLogModal;
