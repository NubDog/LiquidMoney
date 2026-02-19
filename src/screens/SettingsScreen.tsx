/**
 * SettingsScreen.tsx — Màn hình cài đặt
 * Backup / Restore + Thông tin ứng dụng
 * Safe-require pattern cho native modules (react-native-fs, document-picker)
 */

import React, { useCallback, useState } from 'react';
import {
    Alert,
    NativeModules,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ChartPie,
    Database,
    HardDrive,
    Info,
    Upload,
    Download,
    CheckCircle2,
    XCircle,
} from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import { useStore } from '../store/useStore';
import { isDatabaseAvailable } from '../database/db';

// ─── Safe-require kiểm tra native modules ────────────────────────────────────

/**
 * Kiểm tra xem backup service có sẵn sàng không
 * react-native-fs đăng ký native module là 'RNFSManager'
 */
function isBackupAvailable(): boolean {
    return NativeModules.RNFSManager != null;
}

// ─── Component ────────────────────────────────────────────────────────────────

const SettingsScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { wallets, transactions } = useStore();
    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);

    // Thông tin tổng quan
    const totalWallets = wallets.length;
    const totalBalance = wallets.reduce((s, w) => s + w.current_balance, 0);
    const dbAvailable = isDatabaseAvailable();
    const backupAvailable = isBackupAvailable();

    // ─── Export ─────────────────────────────────────────────────────────────

    const handleExport = useCallback(async () => {
        if (!backupAvailable) {
            Alert.alert(
                'Chưa sẵn sàng',
                'react-native-fs chưa được link. Rebuild native app để sử dụng.',
            );
            return;
        }

        try {
            setExporting(true);
            const { exportBackup } = require('../services/backupService');
            const filePath = await exportBackup();
            Alert.alert(
                'Xuất thành công ✅',
                `File backup đã lưu tại:\n${filePath}`,
            );
        } catch (err: any) {
            Alert.alert('Lỗi xuất dữ liệu', err?.message || 'Lỗi không xác định');
        } finally {
            setExporting(false);
        }
    }, [backupAvailable]);

    // ─── Import ─────────────────────────────────────────────────────────────

    const handleImport = useCallback(async () => {
        if (!backupAvailable) {
            Alert.alert(
                'Chưa sẵn sàng',
                'react-native-fs chưa được link. Rebuild native app để sử dụng.',
            );
            return;
        }

        Alert.alert(
            'Nhập dữ liệu',
            'Dữ liệu hiện tại sẽ bị GHI ĐÈ. Bạn có chắc?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Nhập',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setImporting(true);
                            const { importBackup } =
                                require('../services/backupService');
                            const success = await importBackup();
                            if (success) {
                                Alert.alert(
                                    'Nhập thành công ✅',
                                    'Vui lòng khởi động lại app để thấy dữ liệu mới.',
                                );
                            }
                        } catch (err: any) {
                            Alert.alert(
                                'Lỗi nhập dữ liệu',
                                err?.message || 'File không hợp lệ',
                            );
                        } finally {
                            setImporting(false);
                        }
                    },
                },
            ],
        );
    }, [backupAvailable]);

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <ScrollView
            style={[styles.container, { paddingTop: insets.top + 16 }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
            {/* ── App Info Card ── */}
            <GlassCard
                style={styles.card}
                backgroundOpacity={0.12}
                borderOpacity={0.18}
                borderRadius={20}>
                <View style={styles.cardInner}>
                    <View style={styles.cardHeader}>
                        <ChartPie size={20} color="#C084FC" strokeWidth={2} />
                        <Text style={styles.cardTitle}>Tổng quan</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Số ví</Text>
                        <Text style={styles.infoValue}>{totalWallets}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Tổng số dư</Text>
                        <Text style={styles.infoValueAccent}>
                            {totalBalance
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, '.')}{' '}
                            ₫
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Database</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            {dbAvailable ? (
                                <>
                                    <CheckCircle2 size={16} color="#4ade80" />
                                    <Text style={{ color: '#4ade80', fontWeight: '600' }}>Hoạt động</Text>
                                </>
                            ) : (
                                <>
                                    <XCircle size={16} color="#f87171" />
                                    <Text style={{ color: '#f87171', fontWeight: '600' }}>Chưa sẵn sàng</Text>
                                </>
                            )}
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Backup</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            {backupAvailable ? (
                                <>
                                    <CheckCircle2 size={16} color="#4ade80" />
                                    <Text style={{ color: '#4ade80', fontWeight: '600' }}>Sẵn sàng</Text>
                                </>
                            ) : (
                                <>
                                    <XCircle size={16} color="#f87171" />
                                    <Text style={{ color: '#f87171', fontWeight: '600' }}>Cần rebuild</Text>
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </GlassCard>

            {/* ── Backup / Restore Card ── */}
            <GlassCard
                style={styles.card}
                backgroundOpacity={0.12}
                borderOpacity={0.18}
                borderRadius={20}>
                <View style={styles.cardInner}>
                    <View style={styles.cardHeader}>
                        <HardDrive size={20} color="#C084FC" strokeWidth={2} />
                        <Text style={styles.cardTitle}>Sao lưu & Phục hồi</Text>
                    </View>
                    <Text style={styles.cardDesc}>
                        Xuất toàn bộ ví + giao dịch ra file JSON. Nhập lại khi
                        cần.
                    </Text>

                    {/* Button Group (Closing cardInner from line 209) */}
                    <View style={styles.buttonGroup}>
                        <GlassButton
                            onPress={handleExport}
                            disabled={exporting || !dbAvailable}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Upload size={18} color="#FFF" />
                                <Text style={styles.btnText}>{exporting ? 'Đang xuất...' : 'Xuất dữ liệu'}</Text>
                            </View>
                        </GlassButton>

                        <GlassButton
                            onPress={handleImport}
                            variant="outline"
                            disabled={importing || !dbAvailable}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Download size={18} color="#FFF" />
                                <Text style={styles.btnText}>{importing ? 'Đang nhập...' : 'Nhập dữ liệu'}</Text>
                            </View>
                        </GlassButton>
                    </View>
                </View>
            </GlassCard>

            {/* ── About Card ── */}
            <GlassCard
                style={styles.card}
                backgroundOpacity={0.08}
                borderOpacity={0.12}
                borderRadius={20}>
                <View style={styles.cardInner}>
                    <View style={styles.cardHeader}>
                        <Info size={20} color="#C084FC" strokeWidth={2} />
                        <Text style={styles.cardTitle}>Về ứng dụng</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Phiên bản</Text>
                        <Text style={styles.infoValue}>1.0.0</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Nền tảng</Text>
                        <Text style={styles.infoValue}>React Native</Text>
                    </View>
                </View>
            </GlassCard>

            {/* Bottom spacer */}
            <View style={{ height: insets.bottom + 40 }} />
        </ScrollView>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    content: {
        paddingBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
        marginBottom: 24,
    },

    // ── Card ──
    card: {
        marginBottom: 16,
    },
    cardInner: {
        padding: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    cardDesc: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
        lineHeight: 20,
        marginBottom: 16,
    },

    // ── Info rows ──
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    infoLabel: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.55)',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.85)',
        fontWeight: '600',
    },
    infoValueAccent: {
        fontSize: 15,
        color: '#c084fc',
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },

    // ── Buttons ──
    buttonGroup: {
        gap: 12,
    },
    btnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SettingsScreen;
