/**
 * SettingsScreen.tsx — Màn hình cài đặt
 * Backup / Restore + Thông tin ứng dụng
 * Dùng custom styled buttons thay vì GlassButton outline
 */

import React, { useCallback, useState } from 'react';
import {
    Animated,
    Modal,
    NativeModules,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ChartPie,
    HardDrive,
    Info,
    Upload,
    Download,
    CheckCircle2,
    XCircle,
    CheckCircle,
    AlertTriangle,
    FolderOpen,
} from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import { useStore } from '../store/useStore';
import { isDatabaseAvailable } from '../database/db';

// ─── Safe-require kiểm tra native modules ────────────────────────────────────

function isBackupAvailable(): boolean {
    return NativeModules.RNFSManager != null;
}

// ─── Info Dialog Component ────────────────────────────────────────────────────

interface InfoDialogProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type: 'success' | 'error';
}

const InfoDialog: React.FC<InfoDialogProps> = ({
    visible,
    onClose,
    title,
    message,
    type,
}) => {
    const overlayOpacity = React.useRef(new Animated.Value(0)).current;
    const cardScale = React.useRef(new Animated.Value(0.85)).current;

    React.useEffect(() => {
        if (visible) {
            overlayOpacity.setValue(0);
            cardScale.setValue(0.85);
            Animated.parallel([
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(cardScale, {
                    toValue: 1,
                    friction: 8,
                    tension: 80,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, overlayOpacity, cardScale]);

    const handleClose = useCallback(() => {
        Animated.parallel([
            Animated.timing(overlayOpacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(cardScale, {
                toValue: 0.85,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => onClose());
    }, [overlayOpacity, cardScale, onClose]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}>
            <View style={dialogStyles.root}>
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        dialogStyles.overlay,
                        { opacity: overlayOpacity },
                    ]}
                />
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={handleClose}
                />
                <Animated.View
                    style={[
                        dialogStyles.card,
                        { transform: [{ scale: cardScale }] },
                    ]}>
                    {/* Icon */}
                    <View style={dialogStyles.iconContainer}>
                        {type === 'success' ? (
                            <CheckCircle size={40} color="#4ade80" strokeWidth={2} />
                        ) : (
                            <AlertTriangle size={40} color="#f87171" strokeWidth={2} />
                        )}
                    </View>

                    <Text style={dialogStyles.title}>{title}</Text>
                    <Text style={dialogStyles.message}>{message}</Text>

                    {/* OK Button */}
                    <Pressable
                        onPress={handleClose}
                        style={({ pressed }) => [
                            dialogStyles.okBtn,
                            pressed && { opacity: 0.7 },
                        ]}>
                        <Text style={dialogStyles.okBtnText}>OK</Text>
                    </Pressable>
                </Animated.View>
            </View>
        </Modal>
    );
};

const dialogStyles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    card: {
        width: '82%',
        maxWidth: 340,
        backgroundColor: 'rgba(25, 25, 35, 0.97)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        padding: 28,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 16,
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.55)',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    okBtn: {
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 14,
        backgroundColor: 'rgba(34, 211, 238, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.35)',
    },
    okBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#22d3ee',
    },
});

// ─── Confirm Dialog Component ─────────────────────────────────────────────────

interface ConfirmImportDialogProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

const ConfirmImportDialog: React.FC<ConfirmImportDialogProps> = ({
    visible,
    onCancel,
    onConfirm,
}) => {
    const overlayOpacity = React.useRef(new Animated.Value(0)).current;
    const cardScale = React.useRef(new Animated.Value(0.85)).current;

    React.useEffect(() => {
        if (visible) {
            overlayOpacity.setValue(0);
            cardScale.setValue(0.85);
            Animated.parallel([
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(cardScale, {
                    toValue: 1,
                    friction: 8,
                    tension: 80,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, overlayOpacity, cardScale]);

    const animateClose = useCallback(
        (callback: () => void) => {
            Animated.parallel([
                Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(cardScale, {
                    toValue: 0.85,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start(() => callback());
        },
        [overlayOpacity, cardScale],
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onCancel}>
            <View style={dialogStyles.root}>
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        dialogStyles.overlay,
                        { opacity: overlayOpacity },
                    ]}
                />
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={onCancel}
                />
                <Animated.View
                    style={[
                        dialogStyles.card,
                        { transform: [{ scale: cardScale }] },
                    ]}>
                    <View style={dialogStyles.iconContainer}>
                        <AlertTriangle size={40} color="#f59e0b" strokeWidth={2} />
                    </View>

                    <Text style={dialogStyles.title}>Nhập dữ liệu</Text>
                    <Text style={dialogStyles.message}>
                        Dữ liệu hiện tại sẽ bị GHI ĐÈ bởi dữ liệu trong file backup. Bạn có chắc chắn muốn tiếp tục?
                    </Text>

                    <View style={confirmStyles.actions}>
                        <Pressable
                            onPress={() => animateClose(onCancel)}
                            style={({ pressed }) => [
                                confirmStyles.cancelBtn,
                                pressed && { opacity: 0.7 },
                            ]}>
                            <Text style={confirmStyles.cancelText}>Hủy</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => animateClose(onConfirm)}
                            style={({ pressed }) => [
                                confirmStyles.confirmBtn,
                                pressed && { opacity: 0.7 },
                            ]}>
                            <Text style={confirmStyles.confirmText}>Nhập</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const confirmStyles = StyleSheet.create({
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.6)',
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.35)',
    },
    confirmText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#f87171',
    },
});

// ─── Component ────────────────────────────────────────────────────────────────

const SettingsScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { wallets, refreshWallets } = useStore();
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
                // Auto-reload dữ liệu
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
    }, []);

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
                            Xuất toàn bộ ví + giao dịch ra file JSON vào thư mục Downloads. Nhập lại khi cần.
                        </Text>

                        {/* Custom Buttons */}
                        <View style={styles.buttonGroup}>
                            {/* Export Button */}
                            <Pressable
                                onPress={handleExport}
                                disabled={exporting || !dbAvailable}
                                style={({ pressed }) => [
                                    styles.actionBtn,
                                    styles.exportBtn,
                                    pressed && { opacity: 0.7 },
                                    (exporting || !dbAvailable) && styles.disabledBtn,
                                ]}>
                                <Upload size={18} color="#22d3ee" strokeWidth={2} />
                                <Text style={styles.exportBtnText}>
                                    {exporting ? 'Đang xuất...' : 'Xuất dữ liệu'}
                                </Text>
                            </Pressable>

                            {/* Import Button */}
                            <Pressable
                                onPress={handleImportPress}
                                disabled={importing || !dbAvailable}
                                style={({ pressed }) => [
                                    styles.actionBtn,
                                    styles.importBtn,
                                    pressed && { opacity: 0.7 },
                                    (importing || !dbAvailable) && styles.disabledBtn,
                                ]}>
                                <Download size={18} color="#c084fc" strokeWidth={2} />
                                <Text style={styles.importBtnText}>
                                    {importing ? 'Đang nhập...' : 'Nhập dữ liệu'}
                                </Text>
                            </Pressable>
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
                            <Text style={styles.infoValue}>20.02.2026.1</Text>
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
        paddingHorizontal: 20,
    },
    content: {
        paddingBottom: 40,
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
        borderRadius: 16,
        borderWidth: 1,
    },
    exportBtn: {
        backgroundColor: 'rgba(34, 211, 238, 0.12)',
        borderColor: 'rgba(34, 211, 238, 0.3)',
    },
    exportBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#22d3ee',
    },
    importBtn: {
        backgroundColor: 'rgba(192, 132, 252, 0.12)',
        borderColor: 'rgba(192, 132, 252, 0.3)',
    },
    importBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#c084fc',
    },
    disabledBtn: {
        opacity: 0.3,
    },
});

export default SettingsScreen;
