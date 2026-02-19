/**
 * db.ts — Khởi tạo SQLite database cho LiquidMoney
 * Sử dụng react-native-quick-sqlite
 *
 * Kiểm tra native module tồn tại trước khi load,
 * tránh crash app khi native chưa được link đúng.
 */

import { NativeModules, Platform } from 'react-native';

// Lazy reference — sẽ được gán khi initDatabase() chạy thành công
let db: any = null;
let dbAvailable = false;

const DB_NAME = 'liquidmoney.db';

/**
 * Kiểm tra native module QuickSQLite có tồn tại trong binary không
 */
function isNativeModuleAvailable(): boolean {
    // react-native-quick-sqlite đăng ký module tên "QuickSQLite"
    const moduleName = Platform.OS === 'ios' ? 'QuickSQLite' : 'QuickSQLite';
    return NativeModules[moduleName] != null;
}

/**
 * Khởi tạo database: mở file, bật Foreign Keys, tạo bảng
 * Trả về true nếu thành công, false nếu native module chưa sẵn sàng
 */
export function initDatabase(): boolean {
    if (db) {
        return true;
    }

    // Kiểm tra native module trước khi require — tránh crash
    if (!isNativeModuleAvailable()) {
        console.warn(
            '[LiquidMoney] QuickSQLite native module chưa có trong binary.',
            'Hãy rebuild native app: npx react-native run-android',
        );
        dbAvailable = false;
        return false;
    }

    try {
        const { open } = require('react-native-quick-sqlite');
        db = open({ name: DB_NAME });
        dbAvailable = true;
    } catch (err) {
        console.warn('[LiquidMoney] Không thể mở database:', err);
        dbAvailable = false;
        return false;
    }

    // Bật Foreign Key constraints
    db.execute('PRAGMA foreign_keys = ON;');

    // Tạo bảng wallets
    db.execute(`
    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      initial_balance INTEGER NOT NULL DEFAULT 0,
      current_balance INTEGER NOT NULL DEFAULT 0,
      image_uri TEXT,
      icon TEXT DEFAULT 'Wallet',
      created_at TEXT NOT NULL
    );
  `);

    // Migration: thêm cột icon cho DB cũ (idempotent)
    try {
        db.execute("ALTER TABLE wallets ADD COLUMN icon TEXT DEFAULT 'Wallet';");
    } catch (_e) {
        // Cột đã tồn tại — bỏ qua
    }

    // Tạo bảng transactions với FK cascade delete
    db.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      wallet_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('IN', 'OUT')),
      amount INTEGER NOT NULL DEFAULT 0,
      reason TEXT,
      image_uri TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
    );
  `);

    return true;
}

/**
 * Kiểm tra database có sẵn sàng không
 */
export function isDatabaseAvailable(): boolean {
    return dbAvailable;
}

/**
 * Lấy instance database hiện tại
 * @throws Error nếu chưa gọi initDatabase() hoặc native module chưa sẵn sàng
 */
export function getDatabase(): any {
    if (!db) {
        throw new Error(
            '[LiquidMoney] Database chưa được khởi tạo. Gọi initDatabase() trước.',
        );
    }
    return db;
}

/**
 * Đóng database (dùng khi cleanup)
 */
export function closeDatabase(): void {
    if (db) {
        db.close();
        db = null;
        dbAvailable = false;
    }
}
