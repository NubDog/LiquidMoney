/**
 * SettingsScreen.tsx — Settings screen
 * Backup / Restore + App info + Developer Mode
 * Refactored: Extracted InfoDialog and ConfirmImportDialog into standalone components.
 */

import React, { useCallback, useState } from 'react';
import {
    NativeModules,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ChartPie,
    Code,
    HardDrive,
    Info,
    Upload,
    Download,
    CheckCircle2,
    XCircle,
    FolderOpen,
} from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import InfoDialog from '../components/InfoDialog';
import ConfirmImportDialog from '../components/ConfirmImportDialog';
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
                showsVerticalScrollIndicator={false}>
                {/* ── App Info Card ── */}
                <GlassCard
                    style={styles.card}
                    backgroundOpacity={0.12}
                    borderOpacity={0.18}
                    borderRadius={Radii.xl}>
                    <View style={styles.cardInner}>
                        <View style={styles.cardHeader}>
                            <ChartPie size={20} color={Colors.accentLight} strokeWidth={2} />
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
                </GlassCard>

                {/* ── Backup / Restore Card ── */}
                <GlassCard
                    style={styles.card}
                    backgroundOpacity={0.12}
                    borderOpacity={0.18}
                    borderRadius={Radii.xl}>
                    <View style={styles.cardInner}>
                        <View style={styles.cardHeader}>
                            <HardDrive size={20} color={Colors.accentLight} strokeWidth={2} />
                            <Text style={styles.cardTitle}>Sao lưu & Phục hồi</Text>
                        </View>
                        <Text style={styles.cardDesc}>
                            Xuất toàn bộ ví + giao dịch ra file JSON vào thư mục Downloads. Nhập lại khi cần.
                        </Text>

                        <View style={styles.buttonGroup}>
                            <Pressable
                                onPress={handleExport}
                                disabled={exporting || !dbAvailable}
                                style={({ pressed }) => [
                                    styles.actionBtn,
                                    styles.exportBtn,
                                    pressed && { opacity: 0.7 },
                                    (exporting || !dbAvailable) && styles.disabledBtn,
                                ]}>
                                <Upload size={18} color={Colors.cyan} strokeWidth={2} />
                                <Text style={styles.exportBtnText}>
                                    {exporting ? 'Đang xuất...' : 'Xuất dữ liệu'}
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={handleImportPress}
                                disabled={importing || !dbAvailable}
                                style={({ pressed }) => [
                                    styles.actionBtn,
                                    styles.importBtn,
                                    pressed && { opacity: 0.7 },
                                    (importing || !dbAvailable) && styles.disabledBtn,
                                ]}>
                                <Download size={18} color={Colors.accentLight} strokeWidth={2} />
                                <Text style={styles.importBtnText}>
                                    {importing ? 'Đang nhập...' : 'Nhập dữ liệu'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </GlassCard>

                {/* ── Developer Mode Card ── */}
                <GlassCard
                    style={styles.card}
                    backgroundOpacity={0.10}
                    borderOpacity={0.15}
                    borderRadius={Radii.xl}>
                    <View style={styles.cardInner}>
                        <View style={styles.cardHeader}>
                            <Code size={20} color={Colors.warning} strokeWidth={2} />
                            <Text style={styles.cardTitle}>Developer Mode</Text>
                        </View>
                        <Text style={styles.cardDesc}>
                            Bật chế độ nhà phát triển để truy cập công cụ debug.
                        </Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Chế độ Developer</Text>
                            <Switch
                                value={isDeveloperMode}
                                onValueChange={toggleDeveloperMode}
                                trackColor={{
                                    false: 'rgba(255,255,255,0.12)',
                                    true: 'rgba(245,158,11,0.4)',
                                }}
                                thumbColor={isDeveloperMode ? Colors.warning : 'rgba(255,255,255,0.5)'}
                            />
                        </View>
                    </View>
                </GlassCard>

                {/* ── About Card ── */}
                <GlassCard
                    style={styles.card}
                    backgroundOpacity={0.08}
                    borderOpacity={0.12}
                    borderRadius={Radii.xl}>
                    <View style={styles.cardInner}>
                        <View style={styles.cardHeader}>
                            <Info size={20} color={Colors.accentLight} strokeWidth={2} />
                            <Text style={styles.cardTitle}>Về ứng dụng</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phiên bản</Text>
                            <Text style={styles.infoValue}>20.02.2026.1</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Nền tảng</Text>
                            <Text style={styles.infoValue}>React Native</Text>
                        </View>
                    </View>
                </GlassCard>

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

            <ConfirmImportDialog
                visible={confirmImport}
                onCancel={() => setConfirmImport(false)}
                onConfirm={handleImportConfirm}
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
        paddingBottom: 40,
    },

    // ── Card ──
    card: {
        marginBottom: Spacing.md,
    },
    cardInner: {
        padding: Spacing.lg,
    },
    cardTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.text,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    cardDesc: {
        fontSize: FontSizes.md - 1,
        color: Colors.textSecondary,
        lineHeight: 20,
        marginBottom: Spacing.md,
    },

    // ── Info rows ──
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    infoLabel: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: FontSizes.md,
        color: 'rgba(255, 255, 255, 0.85)',
        fontWeight: '600',
    },
    infoValueAccent: {
        fontSize: FontSizes.md,
        color: Colors.accentLight,
        fontWeight: '700',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusText: {
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.divider,
    },

    // ── Action Buttons ──
    buttonGroup: {
        gap: 12,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 15,
        borderRadius: Radii.lg,
        borderWidth: 1,
    },
    exportBtn: {
        backgroundColor: 'rgba(34, 211, 238, 0.12)',
        borderColor: 'rgba(34, 211, 238, 0.3)',
    },
    exportBtnText: {
        fontSize: FontSizes.lg - 2,
        fontWeight: '700',
        color: Colors.cyan,
    },
    importBtn: {
        backgroundColor: 'rgba(192, 132, 252, 0.12)',
        borderColor: 'rgba(192, 132, 252, 0.3)',
    },
    importBtnText: {
        fontSize: FontSizes.lg - 2,
        fontWeight: '700',
        color: Colors.accentLight,
    },
    disabledBtn: {
        opacity: Colors.disabledOpacity,
    },
});

export default SettingsScreen;
