/**
 * TerminalLogModal.tsx — Developer / Error Logs Modal
 * Extracted with Volumetric Glass Base
 */

import React, { useCallback, useRef } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Animated,
} from 'react-native';
import { X, Copy } from 'lucide-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { animateSheetIn, animateSheetOut } from '../common/animations';
import { Colors, FontSizes, Shadows, Spacing } from '../common/theme';
import LiquidCard from './LiquidCard';

interface TerminalLogModalProps {
    visible: boolean;
    onClose: () => void;
    logs: string[];
    isComplete?: boolean;
}

const TerminalLogModal: React.FC<TerminalLogModalProps> = ({ visible, onClose, logs, isComplete }) => {
    const translateY = useRef(new Animated.Value(600)).current;

    React.useEffect(() => {
        if (visible) {
            animateSheetIn(translateY).start();
        }
    }, [visible, translateY]);

    const handleClose = () => {
        animateSheetOut(translateY, 600, 250).start(({ finished }) => {
            if (finished) onClose();
        });
    };

    const handleCopyAll = () => {
        const copyText = logs.join('\n');
        Clipboard.setString(copyText);
    };

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
                    <LiquidCard 
                        style={styles.card}
                        intensity="light"
                        
                        borderRadius={20}
                    >
                        <View style={styles.header}>
                            <Text style={styles.title}>System Logs</Text>
                            <View style={styles.headerActions}>
                                <Pressable
                                    onPress={handleCopyAll}
                                    style={styles.iconBtn}>
                                    <Copy size={20} color="rgba(255,255,255,0.7)" />
                                </Pressable>
                                <Pressable
                                    onPress={handleClose}
                                    style={styles.iconBtn}>
                                    <X size={20} color="rgba(255,255,255,0.7)" />
                                </Pressable>
                            </View>
                        </View>

                        <ScrollView
                            style={styles.scrollContainer}
                            contentContainerStyle={styles.scrollContent}>
                            {logs.length === 0 ? (
                                <Text style={styles.emptyText}>No logs recorded.</Text>
                            ) : (
                                logs.map((log, index) => (
                                    <View key={index.toString()} style={styles.logRow}>
                                        <Text style={styles.logTime}>[{String(index).padStart(4, '0')}]</Text>
                                        <Text style={[styles.logMessage, { color: Colors.accent }]}>{log}</Text>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    </LiquidCard>
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
        backgroundColor: Colors.overlayHeavy,
    },
    modalContainer: {
        height: '80%',
        marginHorizontal: 12,
        marginBottom: 34, // Safe area bottom
        ...Shadows.menu,
    },
    card: {
        flex: 1,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(0,0,0,0.2)', // Terminal header feel
    },
    title: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        fontFamily: 'monospace',
        color: '#FFFFFF',
    },
    headerActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    iconBtn: {
        padding: 4,
    },
    scrollContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)', // Darker background for code/terminal
    },
    scrollContent: {
        padding: Spacing.md,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'monospace',
    },
    logRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    logTime: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'monospace',
        fontSize: 12,
        marginRight: 6,
    },
    logType: {
        fontFamily: 'monospace',
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 6,
        width: 60,
    },
    logMessage: {
        flex: 1,
        color: 'rgba(255,255,255,0.85)',
        fontFamily: 'monospace',
        fontSize: 12,
    },
});

export default TerminalLogModal;
