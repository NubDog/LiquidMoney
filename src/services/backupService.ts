/**
 * backupService.ts — Xử lý Export/Import JSON
 * Sử dụng react-native-fs và @react-native-documents/picker
 */

import RNFS from 'react-native-fs';
import { pick, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import {
    getExportData,
    importData,
    type Wallet,
    type Transaction,
} from '../database/queries';

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

/** Cấu trúc file JSON backup */
export interface BackupData {
    version: number;
    app: string;
    exported_at: string;
    wallets: Wallet[];
    transactions: Transaction[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Phiên bản backup format hiện tại */
const BACKUP_VERSION = 1;

// ─── EXPORT ───────────────────────────────────────────────────────────────────

/**
 * Export toàn bộ dữ liệu ra file JSON
 *
 * Luồng:
 * 1. Lấy dữ liệu từ DB (queries.getExportData)
 * 2. Ghi file JSON vào DocumentDirectory
 *
 * @returns Đường dẫn file JSON đã tạo
 */
export async function exportBackup(): Promise<string> {
    // 1. Lấy dữ liệu thô từ DB
    const rawData = getExportData();

    // 2. Tạo cấu trúc backup
    const backup: BackupData = {
        version: BACKUP_VERSION,
        app: 'LiquidMoney',
        exported_at: new Date().toISOString(),
        wallets: rawData.wallets,
        transactions: rawData.transactions,
    };

    // 3. Ghi file JSON
    const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, 19);
    const fileName = `liquidmoney_backup_${timestamp}.json`;
    const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

    const json = JSON.stringify(backup, null, 2);
    await RNFS.writeFile(filePath, json, 'utf8');

    return filePath;
}

// ─── IMPORT ───────────────────────────────────────────────────────────────────

/**
 * Import dữ liệu từ file JSON backup (GHI ĐÈ toàn bộ DB cũ)
 *
 * Luồng:
 * 1. Mở hộp thoại chọn file JSON (document picker)
 * 2. Đọc & parse JSON
 * 3. Validate cấu trúc
 * 4. Import vào DB (reset + insert)
 *
 * @returns true nếu import thành công, false nếu user huỷ
 * @throws Error nếu file không hợp lệ
 */
export async function importBackup(): Promise<boolean> {
    try {
        // 1. Mở hộp thoại chọn file
        const [pickedFile] = await pick({
            type: ['application/json'],
        });

        if (!pickedFile?.uri) {
            return false;
        }

        // 2. Đọc nội dung file
        const jsonContent = await RNFS.readFile(pickedFile.uri, 'utf8');
        const backup: BackupData = JSON.parse(jsonContent);

        // 3. Validate cấu trúc cơ bản
        if (!backup.wallets || !Array.isArray(backup.wallets)) {
            throw new Error('File backup không hợp lệ: thiếu danh sách ví.');
        }
        if (!backup.transactions || !Array.isArray(backup.transactions)) {
            throw new Error('File backup không hợp lệ: thiếu danh sách giao dịch.');
        }

        // 4. Ghi đè DB (reset + insert + recalculate)
        importData({ 
            wallets: backup.wallets, 
            transactions: backup.transactions 
        });

        return true;
    } catch (err: unknown) {
        // User nhấn huỷ → trả về false
        if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
            return false;
        }
        throw err;
    }
}
