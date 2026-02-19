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
            {/* Title */}
            <Text style={styles.title}>⚙️ Cài đặt</Text>

            {/* ── App Info Card ── */}
            <GlassCard
                style={styles.card}
                backgroundOpacity={0.12}
                borderOpacity={0.18}
                borderRadius={20}>
                <View style={styles.cardInner}>
                    <Text style={styles.cardTitle}>📊 Tổng quan</Text>

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
                        <Text
                            style={[
                                styles.infoValue,
                                {
                                    color: dbAvailable
                                        ? '#4ade80'
                                        : '#f87171',
                                },
                            ]}>
                            {dbAvailable ? '✅ Hoạt động' : '❌ Chưa sẵn sàng'}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Backup</Text>
                        <Text
                            style={[
                                styles.infoValue,
                                {
                                    color: backupAvailable
                                        ? '#4ade80'
                                        : '#f87171',
                                },
                            ]}>
                            {backupAvailable
                                ? '✅ Sẵn sàng'
                                : '❌ Cần rebuild'}
                        </Text>
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
                    <Text style={styles.cardTitle}>💾 Sao lưu & Phục hồi</Text>
                    <Text style={styles.cardDesc}>
                        Xuất toàn bộ ví + giao dịch ra file JSON. Nhập lại khi
                        cần.
                    </Text>

                    <View style={styles.buttonGroup}>
                        <GlassButton
                            title={exporting ? 'Đang xuất...' : '📤 Xuất dữ liệu'}
                            onPress={handleExport}
                            disabled={exporting || !dbAvailable}
                        />

                        <GlassButton
                            title={importing ? 'Đang nhập...' : '📥 Nhập dữ liệu'}
                            onPress={handleImport}
                            variant="outline"
                            disabled={importing || !dbAvailable}
                        />
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
                    <Text style={styles.cardTitle}>ℹ️ Về ứng dụng</Text>

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
});

export default SettingsScreen;
