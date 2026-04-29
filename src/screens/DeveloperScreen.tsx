/**
 * DeveloperScreen.tsx — Developer Tools screen
 * Mock data generation + debug tools
 *
 * Refactored: Uses flat Apple UI design pattern.
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
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Code, Database, Bug, TerminalSquare, ChevronRight } from 'lucide-react-native';
import TerminalLogModal from '../components/modals/TerminalLogModal';
import { useStore } from '../store/useStore';
import { generateRandomTransactions, generateRandomWallets, deleteAllData } from '../database/queries';
import { Colors, FontSizes, Radii, Spacing } from '../common/theme';
import ComponentLibraryScreen from './ComponentLibraryScreen';
import AppleButton from '../components/ui/AppleButton';
import AppleTextInput from '../components/ui/AppleTextInput';

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
                    style={styles.container}
                    contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.xl }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled">
                    
                    {/* Header */}
                    <View style={styles.header}>
                        <Code size={32} color={Colors.text} strokeWidth={2.5} />
                        <Text style={styles.title}>Developer</Text>
                    </View>

                    {/* Mock Data Generator Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Database size={20} color={Colors.textMuted} strokeWidth={2} />
                            <Text style={styles.cardTitle}>Mock Data</Text>
                        </View>
                        <Text style={styles.cardDesc}>
                            Tạo giao dịch ngẫu nhiên trong 90 ngày qua cho tất cả các ví.
                        </Text>

                        <View style={styles.formRow}>
                            <AppleTextInput
                                label="Số lượng giao dịch (tối đa 100)"
                                value={txCountStr}
                                onChangeText={setTxCountStr}
                                keyboardType="number-pad"
                                placeholder="50"
                                maxLength={3}
                            />
                        </View>

                        <AppleButton 
                            title="Chạy tạo dữ liệu" 
                            onPress={handleGenerate} 
                            loading={isGenerating && logs.length > 0 && !logs.join('').includes('Wiping')} 
                            disabled={isGenerating} 
                            variant="primary" 
                            style={styles.actionButton}
                        />
                    </View>

                    {/* Mock Wallet Generator Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Database size={20} color={Colors.textMuted} strokeWidth={2} />
                            <Text style={styles.cardTitle}>Mock Wallets</Text>
                        </View>
                        <Text style={styles.cardDesc}>
                            Tạo ví ngẫu nhiên với số dư ban đầu từ 1 đến 50 triệu.
                        </Text>

                        <View style={styles.formRow}>
                            <AppleTextInput
                                label="Số lượng ví (tối đa 5)"
                                value={walletCountStr}
                                onChangeText={setWalletCountStr}
                                keyboardType="number-pad"
                                placeholder="5"
                                maxLength={1}
                            />
                        </View>

                        <AppleButton 
                            title="Tạo ví ảo" 
                            onPress={handleGenerateWallets} 
                            loading={isGenerating && logs.length > 0 && !logs.join('').includes('Wiping')} 
                            disabled={isGenerating} 
                            variant="primary" 
                            style={styles.actionButton}
                        />
                    </View>

                    {/* Component Library Card */}
                    <Pressable
                        style={({ pressed }) => [styles.card, styles.rowCard, pressed && styles.cardPressed]}
                        onPress={() => setShowLibrary(true)}>
                        <View style={styles.rowCardInner}>
                            <View style={styles.iconWrapper}>
                                <Code size={20} color={Colors.textMuted} strokeWidth={2} />
                            </View>
                            <Text style={styles.rowCardTitle}>Component Library</Text>
                            <ChevronRight size={20} color={Colors.textMuted} />
                        </View>
                    </Pressable>

                    {/* Wipe Data Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Bug size={20} color={Colors.textMuted} strokeWidth={2} />
                            <Text style={styles.cardTitle}>Nguy hiểm</Text>
                        </View>
                        <Text style={styles.cardDesc}>
                            Xóa vĩnh viễn toàn bộ Ví và Giao dịch khỏi thiết bị này. Hành động không thể hoàn tác.
                        </Text>

                        <AppleButton 
                            title="Xóa toàn bộ dữ liệu" 
                            onPress={handleWipeData} 
                            loading={isGenerating && logs.length > 0 && logs.join('').includes('Wiping')} 
                            disabled={isGenerating} 
                            variant="danger" 
                            style={styles.actionButton}
                        />
                    </View>

                    {/* Placeholders */}
                    <View style={styles.card}>
                        <View style={styles.rowCardInner}>
                            <TerminalSquare size={20} color={Colors.textMuted} strokeWidth={2} />
                            <Text style={[styles.rowCardTitle, { color: Colors.textMuted }]}>Console & Logs</Text>
                            <Text style={styles.comingSoon}>Sắp ra mắt</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={[styles.rowCardInner, { marginTop: Spacing.md }]}>
                            <Bug size={20} color={Colors.textMuted} strokeWidth={2} />
                            <Text style={[styles.rowCardTitle, { color: Colors.textMuted }]}>Debug Inspector</Text>
                            <Text style={styles.comingSoon}>Sắp ra mắt</Text>
                        </View>
                    </View>

                    <Text style={styles.infoText}>
                        Chỉ sử dụng cho môi trường phát triển.{'\n'}
                        Dữ liệu tạo ra chỉ mang tính chất minh họa.
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
        backgroundColor: '#000000', // Solid black background for flat iOS dark mode
    },
    content: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 120,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: Spacing.xl,
        paddingHorizontal: Spacing.xs,
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        color: Colors.text,
        letterSpacing: -1,
    },
    card: {
        backgroundColor: '#1C1C1E', // Standard Apple Dark Mode Card Color
        borderRadius: 16,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    cardPressed: {
        opacity: 0.7,
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
        letterSpacing: -0.5,
    },
    cardDesc: {
        fontSize: FontSizes.md,
        color: Colors.textMuted,
        lineHeight: 22,
        marginBottom: Spacing.lg,
    },
    formRow: {
        marginBottom: Spacing.lg,
    },
    actionButton: {
        marginTop: Spacing.xs,
    },
    rowCard: {
        padding: Spacing.md,
    },
    rowCardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowCardTitle: {
        flex: 1,
        fontSize: FontSizes.md + 1,
        fontWeight: '600',
        color: Colors.text,
    },
    comingSoon: {
        fontSize: FontSizes.xs,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.4)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        overflow: 'hidden',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginTop: Spacing.md,
    },
    infoText: {
        fontSize: FontSizes.sm,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
        marginTop: Spacing.md,
    },
});

export default DeveloperScreen;
