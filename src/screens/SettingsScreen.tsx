/**
 * SettingsScreen.tsx — Settings screen
 * Minimalist, Flat, No Liquid Glass
 */

import React, { useCallback, useState } from 'react';
import {
    NativeModules,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, XCircle } from 'lucide-react-native';
import InfoDialog from '../components/InfoDialog';
import ConfirmImportDialog2 from '../components/ConfirmImportDialog2';
import BackgroundPickerModal from '../components/BackgroundPickerModal';
import { useStore } from '../store/useStore';
import { isDatabaseAvailable } from '../database/db';
import { Colors, FontSizes, Radii, Spacing } from '../common/theme';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isBackupAvailable(): boolean {
    return NativeModules.RNFSManager != null;
}

// ─── Component ────────────────────────────────────────────────────────────────

const SettingsScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { wallets, refreshWallets, isDeveloperMode, toggleDeveloperMode } = useStore();
    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);

    // Dialog states
    const [infoDialog, setInfoDialog] = useState<{
        visible: boolean;
        title: string;
        message: string;
        type: 'success' | 'error';
    }>({ visible: false, title: '', message: '', type: 'success' });

    const [confirmImport, setConfirmImport] = useState(false);
    const [backgroundPickerVisible, setBackgroundPickerVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Thông tin tổng quan
    const totalWallets = wallets.length;
    const totalBalance = wallets.reduce((s, w) => s + w.current_balance, 0);
    const dbAvailable = isDatabaseAvailable();
    const backupAvailable = isBackupAvailable();

    // ─── Export ─────────────────────────────────────────────────────────────

    const handleExport = useCallback(async () => {
        if (!backupAvailable) {
            setInfoDialog({
                visible: true,
                title: 'Chưa sẵn sàng',
                message: 'react-native-fs chưa được link. Rebuild native app để sử dụng.',
                type: 'error',
            });
            return;
        }

        try {
            setExporting(true);
            const { exportBackup } = require('../services/backupService');
            const filePath = await exportBackup();
            setInfoDialog({
                visible: true,
                title: 'Xuất thành công',
                message: `File backup đã lưu tại:\n📂 ${filePath}`,
                type: 'success',
            });
        } catch (err: any) {
            setInfoDialog({
                visible: true,
                title: 'Lỗi xuất dữ liệu',
                message: err?.message || 'Lỗi không xác định',
                type: 'error',
            });
        } finally {
            setExporting(false);
        }
    }, [backupAvailable]);

    // ─── Import ─────────────────────────────────────────────────────────────

    const handleImportPress = useCallback(() => {
        if (!backupAvailable) {
            setInfoDialog({
                visible: true,
                title: 'Chưa sẵn sàng',
                message: 'react-native-fs chưa được link. Rebuild native app để sử dụng.',
                type: 'error',
            });
            return;
        }
        setConfirmImport(true);
    }, [backupAvailable]);

    const handleImportConfirm = useCallback(async () => {
        setConfirmImport(false);
        try {
            setImporting(true);
            const { importBackup } = require('../services/backupService');
            const success = await importBackup();
            if (success) {
                refreshWallets();
                setInfoDialog({
                    visible: true,
                    title: 'Nhập thành công',
                    message: 'Dữ liệu đã được nhập và cập nhật thành công!',
                    type: 'success',
                });
            }
        } catch (err: any) {
            setInfoDialog({
                visible: true,
                title: 'Lỗi nhập dữ liệu',
                message: err?.message || 'File không hợp lệ',
                type: 'error',
            });
        } finally {
            setImporting(false);
        }
    }, [refreshWallets]);

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <>
            <ScrollView
                style={[styles.container, { paddingTop: insets.top + 16 }]}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            refreshWallets();
                            setTimeout(() => setRefreshing(false), 300);
                        }}
                        tintColor="rgba(255,255,255,0.3)"
                        colors={['#22d3ee']}
                    />
                }>
                
                <Text style={styles.pageTitle}>Cài đặt</Text>

                {/* ── App Info Card ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Tổng quan</Text>

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
                        <View style={styles.statusRow}>
                            {dbAvailable ? (
                                <>
                                    <CheckCircle2 size={16} color={Colors.income} />
                                    <Text style={[styles.statusText, { color: Colors.income }]}>Hoạt động</Text>
                                </>
                            ) : (
                                <>
                                    <XCircle size={16} color={Colors.expense} />
                                    <Text style={[styles.statusText, { color: Colors.expense }]}>Chưa sẵn sàng</Text>
                                </>
                            )}
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Backup</Text>
                        <View style={styles.statusRow}>
                            {backupAvailable ? (
                                <>
                                    <CheckCircle2 size={16} color={Colors.income} />
                                    <Text style={[styles.statusText, { color: Colors.income }]}>Sẵn sàng</Text>
                                </>
                            ) : (
                                <>
                                    <XCircle size={16} color={Colors.expense} />
                                    <Text style={[styles.statusText, { color: Colors.expense }]}>Cần rebuild</Text>
                                </>
                            )}
                        </View>
                    </View>
                </View>

                {/* ── Appearance Card ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Giao diện</Text>
                    <Text style={styles.cardDesc}>
                        Tùy chỉnh hình nền hiển thị trong ứng dụng.
                    </Text>
                    <Pressable 
                        style={styles.actionBtn}
                        onPress={() => setBackgroundPickerVisible(true)}>
                        <Text style={styles.actionBtnText}>Chọn hình nền</Text>
                    </Pressable>
                </View>

                {/* ── Backup / Restore Card ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Dữ liệu</Text>
                    <Text style={styles.cardDesc}>
                        Xuất dữ liệu an toàn hoặc phục hồi từ bản sao lưu.
                    </Text>

                    <View style={styles.buttonGroup}>
                        <Pressable
                            style={[styles.actionBtn, (exporting || !dbAvailable) && styles.disabledBtn]}
                            onPress={handleExport}
                            disabled={exporting || !dbAvailable}>
                            <Text style={styles.actionBtnText}>{exporting ? 'Đang xuất...' : 'Xuất dữ liệu'}</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.actionBtn, (importing || !dbAvailable) && styles.disabledBtn]}
                            onPress={handleImportPress}
                            disabled={importing || !dbAvailable}>
                            <Text style={styles.actionBtnText}>{importing ? 'Đang nhập...' : 'Nhập dữ liệu'}</Text>
                        </Pressable>
                    </View>
                </View>

                {/* ── Developer Mode Card ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Nhà phát triển</Text>
                    <Text style={styles.cardDesc}>
                        Bật để sử dụng các công cụ gỡ lỗi nội bộ.
                    </Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Chế độ Developer</Text>
                        <Switch
                            value={isDeveloperMode}
                            onValueChange={toggleDeveloperMode}
                            trackColor={{
                                false: 'rgba(255,255,255,0.1)',
                                true: 'rgba(34,211,238,0.3)',
                            }}
                            thumbColor={isDeveloperMode ? Colors.cyan : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* ── About Card ── */}
                <View style={[styles.card, { marginBottom: Spacing.xl }]}>
                    <Text style={styles.cardTitle}>Về ứng dụng</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Phiên bản</Text>
                        <Text style={styles.infoValue}>20.02.2026.3</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Nền tảng</Text>
                        <Text style={styles.infoValue}>React Native</Text>
                    </View>
                </View>

                <View style={{ height: insets.bottom + 40 }} />
            </ScrollView>

            {/* Dialogs */}
            <InfoDialog
                visible={infoDialog.visible}
                onClose={() => setInfoDialog(prev => ({ ...prev, visible: false }))}
                title={infoDialog.title}
                message={infoDialog.message}
                type={infoDialog.type}
            />

            <ConfirmImportDialog2
                visible={confirmImport}
                onCancel={() => setConfirmImport(false)}
                onConfirm={handleImportConfirm}
            />

            <BackgroundPickerModal
                visible={backgroundPickerVisible}
                onClose={() => setBackgroundPickerVisible(false)}
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
    pageTitle: {
        fontSize: FontSizes.xxl,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: Spacing.xl,
        marginTop: Spacing.sm,
        letterSpacing: -0.5,
    },

    // ── Card ──
    card: {
        backgroundColor: '#1C1C1E',
        borderRadius: 20,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    cardTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    cardDesc: {
        fontSize: FontSizes.md,
        color: 'rgba(255, 255, 255, 0.5)',
        lineHeight: 22,
        marginBottom: Spacing.lg,
    },

    // ── Info rows ──
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoLabel: {
        fontSize: FontSizes.md,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: FontSizes.md,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    infoValueAccent: {
        fontSize: FontSizes.md,
        color: Colors.cyan,
        fontWeight: '700',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        marginVertical: 4,
    },

    // ── Action Buttons ──
    buttonGroup: {
        gap: 12,
    },
    actionBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    disabledBtn: {
        opacity: 0.4,
    },
});

export default SettingsScreen;
