/**
 * SettingsScreen.tsx — Settings screen
 * Apple iOS 17/18 Inset Grouped UI redesign.
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
import { ChevronRight } from 'lucide-react-native';
import InfoDialog from '../components/InfoDialog';
import ConfirmImportDialog2 from '../components/ConfirmImportDialog2';
import BackgroundPickerModal from '../components/BackgroundPickerModal';
import { useStore } from '../store/useStore';
import { isDatabaseAvailable } from '../database/db';
import { Colors, Spacing } from '../common/theme';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isBackupAvailable(): boolean {
    return NativeModules.RNFSManager != null;
}

// ─── UI Components ────────────────────────────────────────────────────────────

const AppleListGroup: React.FC<{ children: React.ReactNode; title?: string; footer?: string }> = ({ children, title, footer }) => (
    <View style={styles.groupContainer}>
        {title && <Text style={styles.groupTitle}>{title.toUpperCase()}</Text>}
        <View style={styles.groupBody}>
            {children}
        </View>
        {footer && <Text style={styles.groupFooter}>{footer}</Text>}
    </View>
);

const AppleListRow: React.FC<{
    label: string;
    value?: string | React.ReactNode;
    isLast?: boolean;
    onPress?: () => void;
    showChevron?: boolean;
    valueColor?: string;
}> = ({ label, value, isLast, onPress, showChevron, valueColor }) => {
    const Component = onPress ? Pressable : View;
    return (
        <View style={styles.rowWrapper}>
            <Component
                style={({ pressed }) => [
                    styles.rowInner,
                    pressed && onPress ? styles.rowPressed : null
                ]}
                onPress={onPress}
            >
                <Text style={styles.rowLabel}>{label}</Text>
                <View style={styles.rowRight}>
                    {typeof value === 'string' ? (
                        <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
                    ) : (
                        value
                    )}
                    {showChevron && <ChevronRight size={16} color="#48484A" style={{ marginLeft: 6 }} />}
                </View>
            </Component>
            {!isLast && <View style={styles.rowSeparator} />}
        </View>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

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

    // Data
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
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}
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
                        colors={[Colors.cyan]}
                    />
                }>
                
                <Text style={styles.largeTitle}>Cài đặt</Text>

                {/* Giao diện */}
                <AppleListGroup title="Giao diện" footer="Tùy chỉnh hình nền hiển thị phía sau các màn hình của ứng dụng.">
                    <AppleListRow 
                        label="Chọn Hình Nền" 
                        showChevron 
                        onPress={() => setBackgroundPickerVisible(true)} 
                        isLast 
                    />
                </AppleListGroup>

                {/* Dữ liệu */}
                <AppleListGroup title="Dữ liệu & Sao lưu" footer="Xuất toàn bộ ví và giao dịch ra file JSON vào thư mục Downloads của máy. Nhập lại khi cần.">
                    <AppleListRow 
                        label="Xuất dữ liệu" 
                        value={exporting ? 'Đang xử lý...' : ''}
                        showChevron={!exporting && dbAvailable}
                        onPress={dbAvailable && !exporting ? handleExport : undefined}
                    />
                    <AppleListRow 
                        label="Nhập dữ liệu" 
                        value={importing ? 'Đang xử lý...' : ''}
                        showChevron={!importing && dbAvailable}
                        onPress={dbAvailable && !importing ? handleImportPress : undefined}
                        isLast 
                    />
                </AppleListGroup>

                {/* Developer */}
                <AppleListGroup title="Nhà phát triển" footer="Bật chế độ nhà phát triển để truy cập công cụ debug.">
                    <AppleListRow 
                        label="Chế độ Developer" 
                        value={
                            <Switch
                                value={isDeveloperMode}
                                onValueChange={toggleDeveloperMode}
                                trackColor={{ false: '#39393D', true: Colors.income }}
                                thumbColor="#FFFFFF"
                            />
                        }
                        isLast 
                    />
                </AppleListGroup>

                {/* Thông tin */}
                <AppleListGroup title="Thông tin ứng dụng">
                    <AppleListRow label="Phiên bản" value="20.02.2026.2" />
                    <AppleListRow label="Nền tảng" value="React Native" />
                    <AppleListRow label="Số ví" value={totalWallets.toString()} />
                    <AppleListRow label="Tổng số dư" value={`${totalBalance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} ₫`} />
                    <AppleListRow 
                        label="Database" 
                        value={dbAvailable ? 'Hoạt động' : 'Chưa sẵn sàng'} 
                        valueColor={dbAvailable ? Colors.income : Colors.expense}
                    />
                    <AppleListRow 
                        label="Backup Service" 
                        value={backupAvailable ? 'Sẵn sàng' : 'Cần rebuild'} 
                        valueColor={backupAvailable ? Colors.income : Colors.expense}
                        isLast 
                    />
                </AppleListGroup>

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
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: Spacing.md,
    },
    largeTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 24,
        marginTop: 10,
        paddingHorizontal: Spacing.sm,
    },
    // Group
    groupContainer: {
        marginBottom: 24,
    },
    groupTitle: {
        fontSize: 13,
        color: '#8E8E93',
        marginBottom: 6,
        paddingHorizontal: 16,
    },
    groupFooter: {
        fontSize: 13,
        color: '#8E8E93',
        marginTop: 6,
        paddingHorizontal: 16,
        lineHeight: 18,
    },
    groupBody: {
        backgroundColor: '#1C1C1E',
        borderRadius: 10,
        overflow: 'hidden',
    },
    // Row
    rowWrapper: {
        backgroundColor: '#1C1C1E',
    },
    rowInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        minHeight: 44,
    },
    rowPressed: {
        backgroundColor: '#2C2C2E',
    },
    rowLabel: {
        fontSize: 17,
        color: '#FFFFFF',
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowValue: {
        fontSize: 17,
        color: '#8E8E93',
    },
    rowSeparator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#38383A',
        marginLeft: 16,
    },
});

export default SettingsScreen;
