/**
 * backupService.ts — Xử lý Export/Import JSON + Base64 ảnh
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

/** Wallet mở rộng chứa Base64 ảnh (dùng trong file JSON backup) */
interface BackupWallet extends Wallet {
    image_base64: string | null;
}

/** Transaction mở rộng chứa Base64 ảnh */
interface BackupTransaction extends Transaction {
    image_base64: string | null;
}

/** Cấu trúc file JSON backup */
export interface BackupData {
    version: number;
    app: string;
    exported_at: string;
    wallets: BackupWallet[];
    transactions: BackupTransaction[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Thư mục lưu ảnh vĩnh viễn của app */
const IMAGE_DIR = `${RNFS.DocumentDirectoryPath}/liquidmoney_images`;

/** Phiên bản backup format hiện tại */
const BACKUP_VERSION = 1;

// ─── Helper: Quản lý thư mục ─────────────────────────────────────────────────

/**
 * Tạo thư mục nếu chưa tồn tại
 */
async function ensureDirectory(dirPath: string): Promise<void> {
    const exists = await RNFS.exists(dirPath);
    if (!exists) {
        await RNFS.mkdir(dirPath);
    }
}

// ─── Helper: Chuyển đổi ảnh ↔ Base64 ─────────────────────────────────────────

/**
 * Đọc file ảnh từ đường dẫn → Base64 string
 * @returns Base64 string hoặc null nếu file không tồn tại
 */
async function fileToBase64(filePath: string): Promise<string | null> {
    try {
        const exists = await RNFS.exists(filePath);
        if (!exists) {
            return null;
        }
        return await RNFS.readFile(filePath, 'base64');
    } catch {
        console.warn('[Backup] Không đọc được ảnh:', filePath);
        return null;
    }
}

/**
 * Ghi Base64 string → file ảnh trên đĩa
 * @returns Đường dẫn file mới
 */
async function base64ToFile(
    base64Data: string,
    fileName: string,
): Promise<string> {
    await ensureDirectory(IMAGE_DIR);
    const filePath = `${IMAGE_DIR}/${fileName}`;
    await RNFS.writeFile(filePath, base64Data, 'base64');
    return filePath;
}

// ─── Helper: Lưu ảnh từ Image Picker ─────────────────────────────────────────

/**
 * Copy ảnh từ URI tạm (image-picker) sang thư mục app vĩnh viễn
 * Dùng khi người dùng chọn ảnh cho Ví hoặc Giao dịch
 *
 * @param tempUri - URI tạm từ image picker
 * @param prefix - Tiền tố tên file (vd: 'wallet', 'txn')
 * @returns Đường dẫn vĩnh viễn mới
 */
export async function saveImageToLocal(
    tempUri: string,
    prefix: string,
): Promise<string> {
    await ensureDirectory(IMAGE_DIR);

    // Tạo tên file unique: prefix_timestamp_random.ext
    const ext = tempUri.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const fileName = `${prefix}_${uniqueId}.${ext}`;
    const destPath = `${IMAGE_DIR}/${fileName}`;

    await RNFS.copyFile(tempUri, destPath);
    return destPath;
}

/**
 * Xóa file ảnh khỏi đĩa (dùng khi xóa ví/giao dịch có ảnh)
 */
export async function deleteImageFile(filePath: string): Promise<void> {
    try {
        const exists = await RNFS.exists(filePath);
        if (exists) {
            await RNFS.unlink(filePath);
        }
    } catch {
        console.warn('[Backup] Không xóa được ảnh:', filePath);
    }
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────

/**
 * Export toàn bộ dữ liệu + ảnh (Base64) ra file JSON
 *
 * Luồng:
 * 1. Lấy dữ liệu từ DB (queries.getExportData)
 * 2. Đọc từng ảnh → chuyển Base64
 * 3. Ghi file JSON vào DocumentDirectory
 *
 * @returns Đường dẫn file JSON đã tạo
 */
export async function exportBackup(): Promise<string> {
    // 1. Lấy dữ liệu thô từ DB
    const rawData = getExportData();

    // 2. Chuyển ảnh Wallet → Base64
    const wallets: BackupWallet[] = [];
    for (const wallet of rawData.wallets) {
        let imageBase64: string | null = null;
        if (wallet.image_uri) {
            imageBase64 = await fileToBase64(wallet.image_uri);
        }
        wallets.push({ ...wallet, image_base64: imageBase64 });
    }

    // 3. Chuyển ảnh Transaction → Base64
    const transactions: BackupTransaction[] = [];
    for (const txn of rawData.transactions) {
        let imageBase64: string | null = null;
        if (txn.image_uri) {
            imageBase64 = await fileToBase64(txn.image_uri);
        }
        transactions.push({ ...txn, image_base64: imageBase64 });
    }

    // 4. Tạo cấu trúc backup
    const backup: BackupData = {
        version: BACKUP_VERSION,
        app: 'LiquidMoney',
        exported_at: new Date().toISOString(),
        wallets,
        transactions,
    };

    // 5. Ghi file JSON
    const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, 19);
    const fileName = `liquidmoney_backup_${timestamp}.json`;
    const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

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
 * 4. Xóa ảnh cũ → Ghi ảnh mới từ Base64
 * 5. Import vào DB (reset + insert)
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

        // 4. Xóa thư mục ảnh cũ → tạo mới
        await clearImageDirectory();

        // 5. Ghi ảnh Wallet từ Base64
        const wallets: Wallet[] = [];
        for (const bw of backup.wallets) {
            let newImageUri: string | null = null;

            if (bw.image_base64) {
                const fileName = `wallet_${bw.id}.jpg`;
                newImageUri = await base64ToFile(bw.image_base64, fileName);
            }

            // Tách image_base64, giữ lại các field chuẩn + ghi đè image_uri
            const { image_base64: _unusedB64, ...walletFields } = bw;
            wallets.push({ ...walletFields, image_uri: newImageUri });
        }

        // 6. Ghi ảnh Transaction từ Base64
        const transactions: Transaction[] = [];
        for (const bt of backup.transactions) {
            let newImageUri: string | null = null;

            if (bt.image_base64) {
                const fileName = `txn_${bt.id}.jpg`;
                newImageUri = await base64ToFile(bt.image_base64, fileName);
            }

            const { image_base64: _unusedB64, ...txnFields } = bt;
            transactions.push({ ...txnFields, image_uri: newImageUri });
        }

        // 7. Ghi đè DB (reset + insert + recalculate)
        importData({ wallets, transactions });

        return true;
    } catch (err: unknown) {
        // User nhấn huỷ → trả về false
        if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
            return false;
        }
        throw err;
    }
}

// ─── CLEAR IMAGE DIRECTORY ───────────────────────────────────────────────────

/**
 * Xóa toàn bộ thư mục ảnh cũ và tạo lại (dùng trước khi import)
 */
async function clearImageDirectory(): Promise<void> {
    try {
        const exists = await RNFS.exists(IMAGE_DIR);
        if (exists) {
            await RNFS.unlink(IMAGE_DIR);
        }
    } catch {
        // Bỏ qua lỗi nếu thư mục không tồn tại
    }
    await RNFS.mkdir(IMAGE_DIR);
}
