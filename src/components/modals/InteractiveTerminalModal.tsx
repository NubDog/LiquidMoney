import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Animated,
    Platform,
    TextInput,
    KeyboardAvoidingView,
    Keyboard,
} from 'react-native';
import { Copy, Terminal as TerminalIcon, ChevronRight } from 'lucide-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { animateSheetIn, animateSheetOut } from '../../common/animations';
import { Colors, FontSizes, Shadows, Spacing } from '../../common/theme';
import AppleCloseButton from '../ui/AppleCloseButton';

interface InteractiveTerminalModalProps {
    visible: boolean;
    onClose: () => void;
}

const getLogColor = (log: string) => {
    const lower = log.toLowerCase();
    if (lower.includes('[error]') || lower.includes('[fail]')) return Colors.expense; // Red for errors
    if (lower.includes('[success]') || lower.includes('done')) return Colors.income; // Green for success
    if (lower.includes('warning')) return Colors.warning; // Yellow for warnings
    if (lower.startsWith('>')) return Colors.cyan; // Commands in cyan
    return 'rgba(255, 255, 255, 0.85)'; // Default light gray
};

const InteractiveTerminalModal: React.FC<InteractiveTerminalModalProps> = ({ visible, onClose }) => {
    const translateY = useRef(new Animated.Value(800)).current;
    const prevVisible = useRef(false);
    
    const [logs, setLogs] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);
    const inputRef = useRef<TextInput>(null);
    const keyboardOffsetAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const onKeyboardShow = (e: any) => {
            const shiftAmount = Math.max(0, e.endCoordinates.height);
            Animated.timing(keyboardOffsetAnim, {
                toValue: -shiftAmount,
                duration: e.duration || 250,
                useNativeDriver: true,
            }).start();
        };

        const onKeyboardHide = (e: any) => {
            Animated.timing(keyboardOffsetAnim, {
                toValue: 0,
                duration: e.duration || 250,
                useNativeDriver: true,
            }).start();
        };

        const sub1 = Keyboard.addListener(showEvent, onKeyboardShow);
        const sub2 = Keyboard.addListener(hideEvent, onKeyboardHide);
        return () => {
            sub1.remove();
            sub2.remove();
        };
    }, [keyboardOffsetAnim]);

    const checkFPS = useCallback(async () => {
        return new Promise<number>((resolve) => {
            let frames = 0;
            let start = Date.now();
            
            const loop = () => {
                frames++;
                const now = Date.now();
                if (now - start >= 1000) {
                    resolve(frames);
                } else {
                    requestAnimationFrame(loop);
                }
            };
            requestAnimationFrame(loop);
        });
    }, []);

    const appendLog = useCallback((msg: string) => {
        setLogs(prev => [...prev, msg]);
    }, []);

    const executeCommand = useCallback(async (cmd: string) => {
        const cleanCmd = cmd.trim().toLowerCase();
        if (!cleanCmd) return;

        appendLog(`> ${cmd}`);
        
        switch (cleanCmd) {
            case 'fps':
                appendLog('Checking screen refresh rate...');
                const fps = await checkFPS();
                appendLog(`[SUCCESS] Current refresh rate is approx: ${fps} FPS`);
                break;
            case 'clear':
                setLogs([]);
                break;
            case 'help':
                appendLog('Available commands:');
                appendLog('- fps: Check screen refresh rate');
                appendLog('- clear: Clear console logs');
                appendLog('- help: Show this help message');
                break;
            default:
                appendLog(`[ERROR] Command not found: ${cleanCmd}. Type "help" for a list of commands.`);
        }
    }, [appendLog, checkFPS]);

    const handleSubmit = () => {
        if (inputValue.trim()) {
            executeCommand(inputValue);
            setInputValue('');
        }
    };

    // Auto-run FPS check on open
    useEffect(() => {
        if (visible && !prevVisible.current) {
            translateY.stopAnimation();
            animateSheetIn(translateY).start();
            
            // Initial commands
            setLogs([
                'LiquidMoney Interactive Console',
                'Type "help" for a list of commands.',
                '',
            ]);
            
            setTimeout(() => {
                executeCommand('fps');
            }, 500);
            
            // Focus input slightly after animation
            setTimeout(() => {
                inputRef.current?.focus();
            }, 600);
        }
        prevVisible.current = visible;
    }, [visible, translateY, executeCommand]);

    const handleClose = () => {
        Keyboard.dismiss();
        translateY.stopAnimation();
        animateSheetOut(translateY, 800, 250).start(() => {
            onClose();
            setLogs([]);
            setInputValue('');
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
            <View style={styles.root} pointerEvents="box-none">
                <Pressable
                    style={[StyleSheet.absoluteFill, styles.overlay]}
                    onPress={handleClose}
                />

                <Animated.View
                    style={[
                        styles.modalContainer,
                        { transform: [{ translateY: Animated.add(translateY, keyboardOffsetAnim) }] },
                    ]}>
                    <View style={styles.sheet}>
                        {/* Grabber */}
                        <View style={styles.grabberContainer}>
                            <View style={styles.grabber} />
                        </View>

                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Interactive Console</Text>
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
                        <Pressable 
                            style={styles.consoleWrapper} 
                            onPress={() => inputRef.current?.focus()}
                        >
                            <ScrollView
                                ref={scrollViewRef}
                                style={styles.scrollContainer}
                                contentContainerStyle={styles.scrollContent}
                                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                                keyboardShouldPersistTaps="handled"
                            >
                                {logs.map((log, index) => {
                                    const hasNewline = log.startsWith('\n');
                                    const cleanLog = log.trim();
                                    return (
                                        <View key={index.toString()} style={[styles.logRow, hasNewline && { marginTop: 12 }]}>
                                            <Text style={styles.logTime}>[{String(index).padStart(4, '0')}]</Text>
                                            <Text style={[styles.logMessage, { color: getLogColor(log) }]}>{cleanLog}</Text>
                                        </View>
                                    );
                                })}
                            </ScrollView>

                            {/* Input Field */}
                            <View style={styles.inputContainer}>
                                <ChevronRight size={16} color={Colors.cyan} style={styles.promptIcon} />
                                <TextInput
                                    ref={inputRef}
                                    style={styles.input}
                                    value={inputValue}
                                    onChangeText={setInputValue}
                                    onSubmitEditing={handleSubmit}
                                    placeholder="Type a command..."
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    spellCheck={false}
                                    keyboardAppearance="dark"
                                    returnKeyType="send"
                                    blurOnSubmit={false}
                                />
                            </View>
                        </Pressable>
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContainer: {
        height: '85%',
        paddingTop: Platform.OS === 'ios' ? 10 : 0,
    },
    sheet: {
        flex: 1,
        backgroundColor: '#1C1C1E',
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
        backgroundColor: '#000000',
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
        paddingBottom: Spacing.md,
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    promptIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        color: Colors.text,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 14,
        padding: 0,
        height: 20,
    },
});

export default InteractiveTerminalModal;
