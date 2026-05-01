/**
 * TerminalLogModal.tsx — Developer / Error Logs Modal
 * Redesigned to follow flat Apple iOS Bottom Sheet guidelines.
 */

import React, { useRef, useEffect } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Animated,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Copy } from 'lucide-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { animateSheetIn, animateSheetOut } from '../../common/animations';
import { Colors, FontSizes, Shadows, Spacing } from '../../common/theme';
import AppleCloseButton from '../ui/AppleCloseButton';

interface TerminalLogModalProps {
    visible: boolean;
    onClose: () => void;
    logs: string[];
    isComplete?: boolean;
}

const getLogColor = (log: string) => {
    const lower = log.toLowerCase();
    if (lower.includes('[error]') || lower.includes('[fail]')) return Colors.expense; // Red for errors
    if (lower.includes('[success]') || lower.includes('done')) return Colors.income; // Green for success
    if (lower.includes('warning')) return Colors.warning; // Yellow for warnings
    return 'rgba(255, 255, 255, 0.85)'; // Default light gray
};

const TerminalLogModal: React.FC<TerminalLogModalProps> = ({ visible, onClose, logs, isComplete }) => {
    const translateY = useRef(new Animated.Value(800)).current;
    const prevVisible = useRef(false);

    React.useEffect(() => {
        if (visible && !prevVisible.current) {
            translateY.stopAnimation();
            animateSheetIn(translateY).start();
        }
        prevVisible.current = visible;
    }, [visible, translateY]);

    const handleClose = () => {
        translateY.stopAnimation();
        animateSheetOut(translateY, 800, 250).start(() => {
            onClose();
        });
    };

    const handleCopyAll = () => {
        const copyText = logs.join('\n');
        Clipboard.setString(copyText);
    };

    // Auto-scroll to bottom ref
    const scrollViewRef = useRef<ScrollView>(null);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}>
            <View style={styles.root}>
                <Pressable
                    style={[StyleSheet.absoluteFill, styles.overlay]}
                    onPress={handleClose}
                />

                <Animated.View
                    style={[
                        styles.modalContainer,
                        { transform: [{ translateY }] },
                    ]}>
                    <View style={styles.sheet}>
                        
                        {/* Grabber */}
                        <View style={styles.grabberContainer}>
                            <View style={styles.grabber} />
                        </View>

                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Terminal Logs</Text>
                            <View style={styles.headerActions}>
                                <Pressable
                                    onPress={handleCopyAll}
                                    style={({ pressed }) => [
                                        styles.copyBtn,
                                        pressed && { opacity: 0.7 }
                                    ]}>
                                    <Copy size={16} color={Colors.text} strokeWidth={2} />
                                    <Text style={styles.copyText}>Sao chép</Text>
                                </Pressable>
                                <AppleCloseButton onPress={handleClose} size={32} iconSize={16} />
                            </View>
                        </View>

                        {/* Console Window */}
                        <View style={styles.consoleWrapper}>
                            <ScrollView
                                ref={scrollViewRef}
                                style={styles.scrollContainer}
                                contentContainerStyle={styles.scrollContent}
                                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                            >
                                {logs.length === 0 ? (
                                    <Text style={styles.emptyText}>No logs recorded.</Text>
                                ) : (
                                    logs.map((log, index) => {
                                        const hasNewline = log.startsWith('\n');
                                        const cleanLog = log.trim();
                                        return (
                                            <View key={index.toString()} style={[styles.logRow, hasNewline && { marginTop: 12 }]}>
                                                <Text style={styles.logTime}>[{String(index).padStart(4, '0')}]</Text>
                                                <Text style={[styles.logMessage, { color: getLogColor(log) }]}>{cleanLog}</Text>
                                            </View>
                                        );
                                    })
                                )}
                                
                                {!isComplete && (
                                    <View style={styles.loadingRow}>
                                        <ActivityIndicator size="small" color={Colors.textMuted} />
                                        <Text style={styles.loadingText}>Đang xử lý...</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Standard dark overlay
    },
    modalContainer: {
        height: '85%',
        paddingTop: Platform.OS === 'ios' ? 10 : 0,
    },
    sheet: {
        flex: 1,
        backgroundColor: '#1C1C1E', // Standard Apple Dark Mode Card Color
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        ...Shadows.menu,
    },
    grabberContainer: {
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 4,
    },
    grabber: {
        width: 36,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    title: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.text,
        letterSpacing: -0.5,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    copyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        gap: 6,
    },
    copyText: {
        color: Colors.text,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
    consoleWrapper: {
        flex: 1,
        backgroundColor: '#000000', // Deep black for terminal feel
        borderRadius: 16,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.xl + (Platform.OS === 'ios' ? 20 : 0),
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.md,
        paddingBottom: Spacing.xl,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    logRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    logTime: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 12,
        marginRight: 8,
        marginTop: 2,
    },
    logMessage: {
        flex: 1,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 13,
        lineHeight: 18,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    loadingText: {
        color: Colors.textMuted,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 13,
        fontStyle: 'italic',
    },
});

export default TerminalLogModal;
