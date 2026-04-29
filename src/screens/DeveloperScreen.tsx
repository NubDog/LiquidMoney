/**
 * DeveloperScreen.tsx — Developer Tools screen
 * Mock data generation + debug tools
 *
 * Refactored: Uses shared theme tokens.
 */

import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Code, Database, Bug, Play, TerminalSquare } from 'lucide-react-native';
import BackgroundLiquidGlass from '../components/layout/BackgroundLiquidGlass';
import TerminalLogModal from '../components/modals/TerminalLogModal';
import { useStore } from '../store/useStore';
import { generateRandomTransactions, generateRandomWallets, deleteAllData } from '../database/queries';
import { Colors, FontSizes, Radii, Spacing } from '../common/theme';
import ComponentLibraryScreen from './ComponentLibraryScreen';

// ─── Component ────────────────────────────────────────────────────────────────

const DeveloperScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { wallets, refreshWallets } = useStore();

    const [txCountStr, setTxCountStr] = useState<string>('50');
    const [walletCountStr, setWalletCountStr] = useState<string>('5');
    const [isGenerating, setIsGenerating] = useState(false);

    // Terminal Log State
    const [showTerminal, setShowTerminal] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);

    // Component Library State
    const [showLibrary, setShowLibrary] = useState(false);

    // ─── Actions ────────────────────────────────────────────────────────────

    const handleGenerate = useCallback(async () => {
        Keyboard.dismiss();

        let count = parseInt(txCountStr, 10);
        if (isNaN(count) || count <= 0) {
            Alert.alert('Lỗi', 'Số lượng không hợp lệ');
            return;
        }
        if (count > 100) {
            count = 100;
            setTxCountStr('100');
        }

        if (wallets.length === 0) {
            Alert.alert('Không có ví', 'Vui lòng tạo ít nhất 1 ví trước khi sinh dữ liệu.');
            return;
        }

        setLogs([`> Target: ${wallets.length} wallets, ${count} txns/wallet`, '> Starting...']);
        setIsComplete(false);
        setShowTerminal(true);
        setIsGenerating(true);

        const appendLog = (msg: string) => {
            setLogs(prev => [...prev, msg]);
        };

        await new Promise(r => setTimeout(() => r(null), 400));

        for (const wallet of wallets) {
            appendLog(`\n> Processing Wallet: ${wallet.name} (ID: ${wallet.id.substring(0, 8)}...)`);
            await new Promise(r => setTimeout(() => r(null), 200));

            try {
                generateRandomTransactions(wallet.id, count, appendLog);
            } catch (err: any) {
                appendLog(`> [ERROR] Wallet ${wallet.name}: ${err.message}`);
            }
        }

        appendLog('\n> All wallets processed.');
        appendLog('> Refreshing global store...');
        refreshWallets();

        await new Promise(r => setTimeout(() => r(null), 300));
        appendLog('> [SUCCESS] Done!');

        setIsComplete(true);
        setIsGenerating(false);
    }, [txCountStr, wallets, refreshWallets]);
    const handleGenerateWallets = useCallback(async () => {
        Keyboard.dismiss();

        let count = parseInt(walletCountStr, 10);
        if (isNaN(count) || count <= 0) {
            Alert.alert('Lỗi', 'Số lượng không hợp lệ');
            return;
        }
        if (count > 5) {
            count = 5;
            setWalletCountStr('5');
        }

        setLogs([`> Target: Generate ${count} random wallets`, '> Starting...']);
        setIsComplete(false);
        setShowTerminal(true);
        setIsGenerating(true);

        const appendLog = (msg: string) => {
            setLogs(prev => [...prev, msg]);
        };

        await new Promise(r => setTimeout(() => r(null), 400));

        try {
            generateRandomWallets(count, appendLog);
        } catch (err: any) {
            appendLog(`> [ERROR] ${err.message}`);
        }

        appendLog('\n> Refreshing global store...');
        refreshWallets();

        await new Promise(r => setTimeout(() => r(null), 300));
        appendLog('> [SUCCESS] Done!');

        setIsComplete(true);
        setIsGenerating(false);
    }, [walletCountStr, refreshWallets]);

    const handleWipeData = useCallback(() => {
        Alert.alert(
            'Xóa toàn bộ dữ liệu',
            'Hành động này sẽ xóa vĩnh viễn tất cả Ví và Giao dịch. Bạn có chắc chắn không?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        setLogs(['> WARNING: Wiping all database records...', '> Starting...']);
                        setIsComplete(false);
                        setShowTerminal(true);
                        setIsGenerating(true);

                        const appendLog = (msg: string) => {
                            setLogs(prev => [...prev, msg]);
                        };

                        await new Promise(r => setTimeout(() => r(null), 400));

                        try {
                            deleteAllData();
                            appendLog('> [SUCCESS] All wallets and transactions deleted.');
                        } catch (err: any) {
                            appendLog(`> [ERROR] ${err.message}`);
                        }

                        appendLog('\n> Refreshing global store...');
                        refreshWallets();

                        await new Promise(r => setTimeout(() => r(null), 300));
                        appendLog('> [SUCCESS] Done!');

                        setIsComplete(true);
                        setIsGenerating(false);
                    }
                }
            ]
        );
    }, [refreshWallets]);

    const closeTerminal = useCallback(() => {
        setShowTerminal(false);
        setLogs([]);
    }, []);

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <>
            {!showLibrary && (
                <ScrollView
                    style={[styles.container, { paddingTop: insets.top + Spacing.md }]}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled">
                {/* Header */}
                <View style={styles.header}>
                    <Code size={22} color={Colors.warning} strokeWidth={2} />
                    <Text style={styles.title}>Developer Tools</Text>
                </View>

                {/* Mock Data Generator Card */}
                <BackgroundLiquidGlass
                    style={styles.card}

                    borderRadius={Radii.xl}>
                    <View style={styles.cardInner}>
                        <View style={styles.cardHeader}>
                            <Database size={20} color={Colors.income} strokeWidth={2} />
                            <Text style={styles.cardTitle}>Mock Data Generator</Text>
                        </View>
                        <Text style={styles.cardDesc}>
                            Tạo giao dịch ngẫu nhiên (thu/chi, số tiền, ngày trong 90 ngày qua) cho{' '}
                            <Text style={{ fontWeight: '700', color: Colors.text }}>tất cả các ví</Text>.
                        </Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Số lượng (tối đa 100):</Text>
                            <TextInput
                                style={styles.input}
                                value={txCountStr}
                                onChangeText={setTxCountStr}
                                keyboardType="number-pad"
                                placeholder="100"
                                placeholderTextColor={Colors.textMuted}
                                maxLength={3}
                            />
                        </View>

                        <Pressable
                            onPress={handleGenerate}
                            disabled={isGenerating}
                            style={({ pressed }) => [
                                styles.runBtn,
                                pressed && { opacity: 0.8 },
                                isGenerating && styles.runBtnDisabled,
                            ]}>
                            {isGenerating ? (
                                <ActivityIndicator size="small" color="#000" />
                            ) : (
                                <>
                                    <Play size={16} color="#064e3b" strokeWidth={3} />
                                    <Text style={styles.runBtnText}>Run Generation</Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                </BackgroundLiquidGlass>

                {/* Mock Wallet Generator Card */}
                <BackgroundLiquidGlass
                    style={styles.card}
                    borderRadius={Radii.xl}>
                    <View style={styles.cardInner}>
                        <View style={styles.cardHeader}>
                            <Database size={20} color={Colors.cyan} strokeWidth={2} />
                            <Text style={styles.cardTitle}>Mock Wallets Generator</Text>
                        </View>
                        <Text style={styles.cardDesc}>
                            Tạo ví ngẫu nhiên với số dư ban đầu từ 1 đến 50 triệu.
                        </Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Số lượng (tối đa 5):</Text>
                            <TextInput
                                style={styles.input}
                                value={walletCountStr}
                                onChangeText={setWalletCountStr}
                                keyboardType="number-pad"
                                placeholder="5"
                                placeholderTextColor={Colors.textMuted}
                                maxLength={1}
                            />
                        </View>

                        <Pressable
                            onPress={handleGenerateWallets}
                            disabled={isGenerating}
                            style={({ pressed }) => [
                                styles.runBtn,
                                { backgroundColor: Colors.cyan },
                                pressed && { opacity: 0.8 },
                                isGenerating && styles.runBtnDisabled,
                            ]}>
                            {isGenerating ? (
                                <ActivityIndicator size="small" color="#000" />
                            ) : (
                                <>
                                    <Play size={16} color="#083344" strokeWidth={3} />
                                    <Text style={[styles.runBtnText, { color: '#083344' }]}>Run Generation</Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                </BackgroundLiquidGlass>

                {/* Wipe Data Card */}
                <BackgroundLiquidGlass
                    style={styles.card}
                    borderRadius={Radii.xl}>
                    <View style={styles.cardInner}>
                        <View style={styles.cardHeader}>
                            <Bug size={20} color={Colors.expense} strokeWidth={2} />
                            <Text style={[styles.cardTitle, { color: Colors.expense }]}>Wipe All Data</Text>
                        </View>
                        <Text style={styles.cardDesc}>
                            Xóa toàn bộ Ví và Giao dịch khỏi cơ sở dữ liệu.
                        </Text>

                        <Pressable
                            onPress={handleWipeData}
                            disabled={isGenerating}
                            style={({ pressed }) => [
                                styles.runBtn,
                                { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
                                pressed && { opacity: 0.8 },
                                isGenerating && styles.runBtnDisabled,
                            ]}>
                            {isGenerating ? (
                                <ActivityIndicator size="small" color={Colors.expense} />
                            ) : (
                                <>
                                    <Text style={[styles.runBtnText, { color: Colors.expense }]}>Xóa toàn bộ dữ liệu</Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                </BackgroundLiquidGlass>

                {/* Component Library Card */}
                <BackgroundLiquidGlass
                    style={styles.card}
                    borderRadius={Radii.xl}>
                    <Pressable
                        style={styles.cardInner}
                        onPress={() => setShowLibrary(true)}>
                        <View style={[styles.placeholderRow, { paddingVertical: 4 }]}>
                            <Code size={20} color={Colors.cyan} strokeWidth={2} />
                            <Text style={[styles.placeholderText, { color: Colors.text }]}>
                                Component Library
                            </Text>
                            <View style={styles.badgeWrapper}>
                                <Text style={styles.badgeText}>Ready</Text>
                            </View>
                        </View>
                    </Pressable>
                </BackgroundLiquidGlass>

                {/* Placeholder Card */}
                <BackgroundLiquidGlass
                    style={styles.card}

                    borderRadius={Radii.xl}>
                    <View style={styles.cardInner}>
                        <View style={styles.placeholderRow}>
                            <TerminalSquare size={20} color={Colors.textMuted} strokeWidth={2} />
                            <Text style={styles.placeholderText}>Console & Logs</Text>
                            <Text style={styles.comingSoon}>Coming soon</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.placeholderRow}>
                            <Bug size={20} color={Colors.textMuted} strokeWidth={2} />
                            <Text style={styles.placeholderText}>Debug Inspector</Text>
                            <Text style={styles.comingSoon}>Coming soon</Text>
                        </View>
                    </View>
                </BackgroundLiquidGlass>

                <Text style={styles.infoText}>
                    Đây là màn hình dành cho nhà phát triển.{'\n'}
                    Thêm công cụ debug vào đây khi cần.
                </Text>
                </ScrollView>
            )}

            <TerminalLogModal
                visible={showTerminal}
                logs={logs}
                isComplete={isComplete}
                onClose={closeTerminal}
            />

            <ComponentLibraryScreen
                visible={showLibrary}
                onClose={() => setShowLibrary(false)}
            />
        </>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
    },
    content: {
        paddingBottom: 120,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: '800',
        color: Colors.text,
        letterSpacing: -0.5,
    },
    card: {
        marginBottom: Spacing.md,
    },
    cardInner: {
        padding: Spacing.lg,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: Spacing.sm,
    },
    cardTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.text,
    },
    cardDesc: {
        fontSize: FontSizes.md - 1,
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 20,
        marginBottom: Spacing.lg,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        marginBottom: Spacing.lg,
    },
    inputLabel: {
        fontSize: FontSizes.md,
        color: Colors.text,
        fontWeight: '500',
    },
    input: {
        color: Colors.income,
        fontSize: FontSizes.lg - 2,
        fontWeight: '700',
        padding: 0,
        textAlign: 'right',
        minWidth: 40,
    },
    runBtn: {
        backgroundColor: Colors.income,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: 14,
        borderRadius: Radii.md,
    },
    runBtnDisabled: {
        backgroundColor: '#94a3b8',
    },
    runBtnText: {
        color: '#064e3b',
        fontSize: FontSizes.lg - 2,
        fontWeight: '800',
    },
    placeholderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
    },
    placeholderText: {
        flex: 1,
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    comingSoon: {
        fontSize: FontSizes.xs + 1,
        fontWeight: '600',
        color: 'rgba(245,158,11,0.6)',
        backgroundColor: 'rgba(245,158,11,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: Spacing.sm,
        overflow: 'hidden',
    },
    badgeWrapper: {
        backgroundColor: 'rgba(34, 211, 238, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: Spacing.sm,
    },
    badgeText: {
        fontSize: FontSizes.xs + 1,
        fontWeight: '700',
        color: Colors.cyan,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.divider,
    },
    infoText: {
        fontSize: FontSizes.sm,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
        marginTop: Spacing.sm,
    },
});

export default DeveloperScreen;
