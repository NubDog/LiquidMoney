/**
 * queries.ts — CRUD, Domino Balance Logic, Export/Import cho LiquidMoney
 * Sử dụng react-native-quick-sqlite
 */

import { getDatabase } from './db';

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

export interface Wallet {
    id: string;
    name: string;
    initial_balance: number;
    current_balance: number;
    image_uri: string | null;
    icon: string | null;
    created_at: string;
}

export interface Transaction {
    id: string;
    wallet_id: string;
    type: 'IN' | 'OUT';
    amount: number;
    reason: string | null;
    image_uri: string | null;
    created_at: string;
}

export interface ExportData {
    wallets: Wallet[];
    transactions: Transaction[];
}

// ─── UUID Generator ───────────────────────────────────────────────────────────

/**
 * Tạo UUID v4 đơn giản (không cần thư viện ngoài)
 */
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Lấy timestamp ISO hiện tại
 */
function nowISO(): string {
    return new Date().toISOString();
}

// ─── Helper: Đọc rows từ kết quả query ───────────────────────────────────────

/**
 * Chuyển đổi kết quả query thành mảng object
 */
function extractRows<T>(result: {
    rows?: { _array?: T[]; length?: number; item?: (index: number) => T };
}): T[] {
    if (!result.rows) {
        return [];
    }

    // react-native-quick-sqlite trả về rows._array
    if (result.rows._array) {
        return result.rows._array as T[];
    }

    // Fallback: duyệt qua rows.item()
    const arr: T[] = [];
    const len = result.rows.length ?? 0;
    for (let i = 0; i < len; i++) {
        if (result.rows.item) {
            arr.push(result.rows.item(i));
        }
    }
    return arr;
}

// ─── WALLET CRUD ──────────────────────────────────────────────────────────────

/**
 * Tạo ví mới
 * current_balance được set bằng initial_balance khi tạo
 */
export function createWallet(
    name: string,
    initialBalance: number,
    imageUri?: string | null,
    icon?: string | null,
): Wallet {
    const db = getDatabase();
    const id = generateUUID();
    const createdAt = nowISO();
    const walletIcon = icon ?? 'Wallet';

    db.execute(
        `INSERT INTO wallets (id, name, initial_balance, current_balance, image_uri, icon, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [id, name, initialBalance, initialBalance, imageUri ?? null, walletIcon, createdAt],
    );

    return {
        id,
        name,
        initial_balance: initialBalance,
        current_balance: initialBalance,
        image_uri: imageUri ?? null,
        icon: walletIcon,
        created_at: createdAt,
    };
}

/**
 * Lấy danh sách tất cả ví, sắp xếp theo ngày tạo mới nhất
 */
export function getAllWallets(): Wallet[] {
    const db = getDatabase();
    const result = db.execute(
        'SELECT * FROM wallets ORDER BY created_at DESC;',
    );
    return extractRows<Wallet>(result);
}

/**
 * Lấy thông tin một ví theo ID
 */
export function getWalletById(id: string): Wallet | null {
    const db = getDatabase();
    const result = db.execute('SELECT * FROM wallets WHERE id = ?;', [id]);
    const rows = extractRows<Wallet>(result);
    return rows.length > 0 ? rows[0] : null;
}

/**
 * Cập nhật thông tin ví (tên, số dư ban đầu, ảnh)
 * Sau khi cập nhật initial_balance, tự động tính lại current_balance
 */
export function updateWallet(
    id: string,
    name: string,
    initialBalance: number,
    imageUri?: string | null,
    icon?: string | null,
): void {
    const db = getDatabase();

    db.execute(
        `UPDATE wallets
     SET name = ?, initial_balance = ?, image_uri = ?, icon = ?
     WHERE id = ?;`,
        [name, initialBalance, imageUri ?? null, icon ?? 'Wallet', id],
    );

    // Tính lại current_balance vì initial_balance có thể thay đổi
    recalculateBalance(id);
}

/**
 * Xóa ví — cascade delete sẽ tự xóa toàn bộ giao dịch liên quan
 */
export function deleteWallet(id: string): void {
    const db = getDatabase();
    db.execute('DELETE FROM wallets WHERE id = ?;', [id]);
}

/**
 * Cập nhật tên và số dư hiện tại trực tiếp
 * Tự điều chỉnh initial_balance để giữ công thức domino nhất quán
 * initial_balance = newCurrentBalance - SUM(IN) + SUM(OUT)
 */
export function updateWalletDirect(
    id: string,
    name: string,
    newCurrentBalance: number,
    icon?: string | null,
): void {
    const db = getDatabase();

    // Tính tổng IN
    const inResult = db.execute(
        `SELECT COALESCE(SUM(amount), 0) as total
     FROM transactions
     WHERE wallet_id = ? AND type = 'IN';`,
        [id],
    );
    const inRows = extractRows<{ total: number }>(inResult);
    const totalIn = inRows.length > 0 ? inRows[0].total : 0;

    // Tính tổng OUT
    const outResult = db.execute(
        `SELECT COALESCE(SUM(amount), 0) as total
     FROM transactions
     WHERE wallet_id = ? AND type = 'OUT';`,
        [id],
    );
    const outRows = extractRows<{ total: number }>(outResult);
    const totalOut = outRows.length > 0 ? outRows[0].total : 0;

    // Điều chỉnh initial_balance
    const newInitialBalance = newCurrentBalance - totalIn + totalOut;

    db.execute(
        `UPDATE wallets
     SET name = ?, initial_balance = ?, current_balance = ?, icon = ?
     WHERE id = ?;`,
        [name, newInitialBalance, newCurrentBalance, icon ?? 'Wallet', id],
    );
}

// ─── TRANSACTION CRUD ─────────────────────────────────────────────────────────

/**
 * Tạo giao dịch mới và cập nhật số dư ví (Domino Effect)
 */
export function createTransaction(
    walletId: string,
    type: 'IN' | 'OUT',
    amount: number,
    reason?: string | null,
    imageUri?: string | null,
): Transaction {
    const db = getDatabase();
    const id = generateUUID();
    const createdAt = nowISO();

    db.execute(
        `INSERT INTO transactions (id, wallet_id, type, amount, reason, image_uri, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [id, walletId, type, amount, reason ?? null, imageUri ?? null, createdAt],
    );

    // Domino: cập nhật số dư ví
    recalculateBalance(walletId);

    return {
        id,
        wallet_id: walletId,
        type,
        amount,
        reason: reason ?? null,
        image_uri: imageUri ?? null,
        created_at: createdAt,
    };
}

/**
 * Developer Tool: Tạo giao dịch ngẫu nhiên hàng loạt cho một ví
 * Cho phép random date (1-90 ngày trước)
 */
export function generateRandomTransactions(
    walletId: string,
    count: number,
    progressCallback: (msg: string) => void
): void {
    const db = getDatabase();

    // Categories/reasons random
    const reasonsIn = ['Lương', 'Thưởng', 'Bán đồ', 'Cashback', 'Được cho'];
    const reasonsOut = ['Ăn cơm', 'Cà phê', 'Tiền nhà', 'Điện nước', 'Bảo dưỡng', 'Đi chơi', 'Mua sắm', 'Đổ xăng', 'Siêu thị'];

    const nowMs = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // Dùng executeBatch để insert cực nhanh
    const commands: [string, any[]][] = [];

    for (let i = 0; i < count; i++) {
        // Random Type (60% OUT, 40% IN)
        const isOut = Math.random() > 0.4;
        const type = isOut ? 'OUT' : 'IN';

        // Random Amount: 10k đến 5tr, làm tròn ngàn
        const baseAmount = Math.floor(Math.random() * 4990000) + 10000;
        const amount = Math.floor(baseAmount / 1000) * 1000;

        // Random reason
        const rArr = isOut ? reasonsOut : reasonsIn;
        const reason = rArr[Math.floor(Math.random() * rArr.length)];

        // Random date: quá khứ từ 0 đến 90 ngày
        const randomDays = Math.floor(Math.random() * 91);
        const dateMs = nowMs - (randomDays * dayMs);
        const dateObj = new Date(dateMs);
        const createdAt = dateObj.toISOString();

        const id = generateUUID();

        commands.push([
            `INSERT INTO transactions (id, wallet_id, type, amount, reason, image_uri, created_at) VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [id, walletId, type, amount, reason, null, createdAt]
        ]);
    }

    try {
        progressCallback(`> Generating ${count} transactions using executeBatch...`);
        db.executeBatch(commands);
        progressCallback(`> [SUCCESS] Batch inserted ${count} records!`);

        // Domino: Cập nhật biến thiên số dư ví 1 lần sau khi insert tất cả
        recalculateBalance(walletId);
    } catch (e: any) {
        progressCallback(`> [ERROR] ${e.message}`);
    }
}

/**
 * Cập nhật giao dịch và tính lại số dư ví
 * Hỗ trợ trường hợp chuyển giao dịch sang ví khác
 */
export function updateTransaction(
    id: string,
    walletId: string,
    type: 'IN' | 'OUT',
    amount: number,
    reason?: string | null,
    imageUri?: string | null,
): void {
    const db = getDatabase();

    // Lấy wallet_id cũ để biết cần recalculate ví nào
    const oldResult = db.execute(
        'SELECT wallet_id FROM transactions WHERE id = ?;',
        [id],
    );
    const oldRows = extractRows<{ wallet_id: string }>(oldResult);
    const oldWalletId = oldRows.length > 0 ? oldRows[0].wallet_id : null;

    db.execute(
        `UPDATE transactions
     SET wallet_id = ?, type = ?, amount = ?, reason = ?, image_uri = ?
     WHERE id = ?;`,
        [walletId, type, amount, reason ?? null, imageUri ?? null, id],
    );

    // Domino: tính lại số dư cho ví mới
    recalculateBalance(walletId);

    // Nếu chuyển sang ví khác, tính lại cả ví cũ
    if (oldWalletId && oldWalletId !== walletId) {
        recalculateBalance(oldWalletId);
    }
}

/**
 * Xóa giao dịch và tính lại số dư ví
 */
export function deleteTransaction(id: string): void {
    const db = getDatabase();

    // Lấy wallet_id trước khi xóa
    const result = db.execute(
        'SELECT wallet_id FROM transactions WHERE id = ?;',
        [id],
    );
    const rows = extractRows<{ wallet_id: string }>(result);
    const walletId = rows.length > 0 ? rows[0].wallet_id : null;

    db.execute('DELETE FROM transactions WHERE id = ?;', [id]);

    // Domino: tính lại số dư
    if (walletId) {
        recalculateBalance(walletId);
    }
}

/**
 * Lấy danh sách giao dịch của một ví
 * @param filterType - Lọc theo 'IN', 'OUT', hoặc undefined (tất cả)
 */
export function getTransactionsByWallet(
    walletId: string,
    filterType?: 'IN' | 'OUT',
): Transaction[] {
    const db = getDatabase();

    if (filterType) {
        const result = db.execute(
            `SELECT * FROM transactions
       WHERE wallet_id = ? AND type = ?
       ORDER BY created_at DESC;`,
            [walletId, filterType],
        );
        return extractRows<Transaction>(result);
    }

    const result = db.execute(
        `SELECT * FROM transactions
     WHERE wallet_id = ?
     ORDER BY created_at DESC;`,
        [walletId],
    );
    return extractRows<Transaction>(result);
}

// ─── DOMINO BALANCE LOGIC ─────────────────────────────────────────────────────

/**
 * Tính lại current_balance cho một ví
 * Công thức: current_balance = initial_balance + SUM(IN) - SUM(OUT)
 */
export function recalculateBalance(walletId: string): void {
    const db = getDatabase();

    // Lấy initial_balance
    const walletResult = db.execute(
        'SELECT initial_balance FROM wallets WHERE id = ?;',
        [walletId],
    );
    const walletRows = extractRows<{ initial_balance: number }>(walletResult);

    if (walletRows.length === 0) {
        return; // Ví không tồn tại (đã bị xóa)
    }

    const initialBalance = walletRows[0].initial_balance;

    // Tính tổng tiền vào (IN)
    const inResult = db.execute(
        `SELECT COALESCE(SUM(amount), 0) as total
     FROM transactions
     WHERE wallet_id = ? AND type = 'IN';`,
        [walletId],
    );
    const inRows = extractRows<{ total: number }>(inResult);
    const totalIn = inRows.length > 0 ? inRows[0].total : 0;

    // Tính tổng tiền ra (OUT)
    const outResult = db.execute(
        `SELECT COALESCE(SUM(amount), 0) as total
     FROM transactions
     WHERE wallet_id = ? AND type = 'OUT';`,
        [walletId],
    );
    const outRows = extractRows<{ total: number }>(outResult);
    const totalOut = outRows.length > 0 ? outRows[0].total : 0;

    // Cập nhật current_balance
    const newBalance = initialBalance + totalIn - totalOut;

    db.execute('UPDATE wallets SET current_balance = ? WHERE id = ?;', [
        newBalance,
        walletId,
    ]);
}

// ─── STATISTICS ───────────────────────────────────────────────────────────────

export interface MonthlyStat {
    /** Tháng dạng 'YYYY-MM' */
    month: string;
    /** Tổng thu trong tháng */
    totalIn: number;
    /** Tổng chi trong tháng */
    totalOut: number;
}

export interface OverallStat {
    totalIn: number;
    totalOut: number;
    txCount: number;
}

export interface DailyStat {
    /** Ngày dạng 'YYYY-MM-DD' */
    date: string;
    /** Tổng thu trong ngày */
    totalIn: number;
    /** Tổng chi trong ngày */
    totalOut: number;
}

export interface WeeklyStat {
    /** Nhãn tuần hiển thị, vd: '24/02 - 02/03' */
    weekLabel: string;
    /** Ngày bắt đầu tuần (ISO) */
    startDate: string;
    /** Tổng thu trong tuần */
    totalIn: number;
    /** Tổng chi trong tuần */
    totalOut: number;
}

/**
 * Lấy thống kê thu/chi theo tháng
 * @param walletId - ID ví cụ thể, hoặc undefined = tất cả ví
 * @param months - Số tháng gần nhất (default: 6)
 */
export function getMonthlyStats(walletId?: string, months: number = 6): MonthlyStat[] {
    const db = getDatabase();

    // Tạo danh sách N tháng gần nhất
    const monthList: string[] = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const m = String(d.getMonth() + 1).padStart(2, '0');
        monthList.push(`${d.getFullYear()}-${m}`);
    }

    const stats: MonthlyStat[] = monthList.map(month => {
        const startDate = `${month}-01T00:00:00.000Z`;
        const [y, m] = month.split('-').map(Number);
        const nextMonth = new Date(y, m, 1);
        const endDate = nextMonth.toISOString();

        let query: string;
        let params: any[];

        if (walletId) {
            query = `SELECT type, COALESCE(SUM(amount), 0) as total
                     FROM transactions
                     WHERE wallet_id = ? AND created_at >= ? AND created_at < ?
                     GROUP BY type;`;
            params = [walletId, startDate, endDate];
        } else {
            query = `SELECT type, COALESCE(SUM(amount), 0) as total
                     FROM transactions
                     WHERE created_at >= ? AND created_at < ?
                     GROUP BY type;`;
            params = [startDate, endDate];
        }

        const result = db.execute(query, params);
        const rows = extractRows<{ type: 'IN' | 'OUT'; total: number }>(result);

        let totalIn = 0;
        let totalOut = 0;
        for (const row of rows) {
            if (row.type === 'IN') { totalIn = row.total; }
            if (row.type === 'OUT') { totalOut = row.total; }
        }

        return { month, totalIn, totalOut };
    });

    return stats;
}

/**
 * Lấy thống kê thu/chi theo ngày
 * @param walletId - ID ví cụ thể, hoặc undefined = tất cả ví
 * @param days - Số ngày gần nhất (default: 14)
 */
export function getDailyStats(walletId?: string, days: number = 14): DailyStat[] {
    const db = getDatabase();

    // Tạo danh sách N ngày gần nhất
    const dayList: string[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        dayList.push(`${yyyy}-${mm}-${dd}`);
    }

    const stats: DailyStat[] = dayList.map(date => {
        const startDate = `${date}T00:00:00.000Z`;
        const [y, m, d] = date.split('-').map(Number);
        const nextDay = new Date(y, m - 1, d + 1);
        const endDate = nextDay.toISOString();

        let query: string;
        let params: any[];

        if (walletId) {
            query = `SELECT type, COALESCE(SUM(amount), 0) as total
                     FROM transactions
                     WHERE wallet_id = ? AND created_at >= ? AND created_at < ?
                     GROUP BY type;`;
            params = [walletId, startDate, endDate];
        } else {
            query = `SELECT type, COALESCE(SUM(amount), 0) as total
                     FROM transactions
                     WHERE created_at >= ? AND created_at < ?
                     GROUP BY type;`;
            params = [startDate, endDate];
        }

        const result = db.execute(query, params);
        const rows = extractRows<{ type: 'IN' | 'OUT'; total: number }>(result);

        let totalIn = 0;
        let totalOut = 0;
        for (const row of rows) {
            if (row.type === 'IN') { totalIn = row.total; }
            if (row.type === 'OUT') { totalOut = row.total; }
        }

        return { date, totalIn, totalOut };
    });

    return stats;
}

/**
 * Lấy thống kê thu/chi theo tuần
 * @param walletId - ID ví cụ thể, hoặc undefined = tất cả ví
 * @param weeks - Số tuần gần nhất (default: 8)
 */
export function getWeeklyStats(walletId?: string, weeks: number = 8): WeeklyStat[] {
    const db = getDatabase();

    // Tìm ngày đầu tuần hiện tại (Thứ 2)
    const now = new Date();
    const todayDay = now.getDay(); // 0=CN, 1=T2...
    const diffToMonday = todayDay === 0 ? 6 : todayDay - 1;
    const currentMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);

    const stats: WeeklyStat[] = [];

    for (let i = weeks - 1; i >= 0; i--) {
        const weekStart = new Date(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() - (i * 7));
        const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7);

        const startDate = weekStart.toISOString();
        const endDate = weekEnd.toISOString();

        // Nhãn tuần: 'dd/MM - dd/MM'
        const startDD = String(weekStart.getDate()).padStart(2, '0');
        const startMM = String(weekStart.getMonth() + 1).padStart(2, '0');
        const endSun = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
        const endDD = String(endSun.getDate()).padStart(2, '0');
        const endMM = String(endSun.getMonth() + 1).padStart(2, '0');
        const weekLabel = `${startDD}/${startMM} - ${endDD}/${endMM}`;

        let query: string;
        let params: any[];

        if (walletId) {
            query = `SELECT type, COALESCE(SUM(amount), 0) as total
                     FROM transactions
                     WHERE wallet_id = ? AND created_at >= ? AND created_at < ?
                     GROUP BY type;`;
            params = [walletId, startDate, endDate];
        } else {
            query = `SELECT type, COALESCE(SUM(amount), 0) as total
                     FROM transactions
                     WHERE created_at >= ? AND created_at < ?
                     GROUP BY type;`;
            params = [startDate, endDate];
        }

        const result = db.execute(query, params);
        const rows = extractRows<{ type: 'IN' | 'OUT'; total: number }>(result);

        let totalIn = 0;
        let totalOut = 0;
        for (const row of rows) {
            if (row.type === 'IN') { totalIn = row.total; }
            if (row.type === 'OUT') { totalOut = row.total; }
        }

        stats.push({ weekLabel, startDate, totalIn, totalOut });
    }

    return stats;
}

/**
 * Lấy tổng quan thu/chi toàn bộ
 * @param walletId - ID ví cụ thể, hoặc undefined = tất cả ví
 */
export function getOverallStats(walletId?: string): OverallStat {
    const db = getDatabase();

    let query: string;
    let countQuery: string;
    let params: any[] = [];

    if (walletId) {
        query = `SELECT type, COALESCE(SUM(amount), 0) as total
                 FROM transactions
                 WHERE wallet_id = ?
                 GROUP BY type;`;
        countQuery = `SELECT COUNT(*) as cnt FROM transactions WHERE wallet_id = ?;`;
        params = [walletId];
    } else {
        query = `SELECT type, COALESCE(SUM(amount), 0) as total
                 FROM transactions
                 GROUP BY type;`;
        countQuery = `SELECT COUNT(*) as cnt FROM transactions;`;
    }

    const result = db.execute(query, params);
    const rows = extractRows<{ type: 'IN' | 'OUT'; total: number }>(result);

    let totalIn = 0;
    let totalOut = 0;
    for (const row of rows) {
        if (row.type === 'IN') { totalIn = row.total; }
        if (row.type === 'OUT') { totalOut = row.total; }
    }

    const countResult = db.execute(countQuery, params);
    const countRows = extractRows<{ cnt: number }>(countResult);
    const txCount = countRows.length > 0 ? countRows[0].cnt : 0;

    return { totalIn, totalOut, txCount };
}

/**
 * Lấy N giao dịch gần nhất
 * @param limit - Số giao dịch cần lấy
 * @param walletId - Lọc theo ví (optional)
 */
export function getRecentTransactions(limit: number = 12, offset: number = 0, walletId?: string): Transaction[] {
    const db = getDatabase();
    if (walletId) {
        const result = db.execute(
            `SELECT * FROM transactions WHERE wallet_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?;`,
            [walletId, limit, offset],
        );
        return extractRows<Transaction>(result);
    }
    const result = db.execute(
        `SELECT * FROM transactions ORDER BY created_at DESC LIMIT ? OFFSET ?;`,
        [limit, offset],
    );
    return extractRows<Transaction>(result);
}

// ─── EXPORT / IMPORT ──────────────────────────────────────────────────────────

/**
 * Gom toàn bộ dữ liệu để Export ra JSON
 * Bao gồm tất cả wallets và transactions
 */
export function getExportData(): ExportData {
    const db = getDatabase();

    const walletsResult = db.execute(
        'SELECT * FROM wallets ORDER BY created_at ASC;',
    );
    const wallets = extractRows<Wallet>(walletsResult);

    const transactionsResult = db.execute(
        'SELECT * FROM transactions ORDER BY created_at ASC;',
    );
    const transactions = extractRows<Transaction>(transactionsResult);

    return { wallets, transactions };
}

/**
 * Import dữ liệu: Xóa toàn bộ DB cũ, ghi đè bằng dữ liệu mới
 * @param data - Dữ liệu ExportData đã parse từ JSON
 */
export function importData(data: ExportData): void {
    const db = getDatabase();

    // Xóa toàn bộ dữ liệu cũ (transactions trước vì FK constraint)
    db.execute('DELETE FROM transactions;');
    db.execute('DELETE FROM wallets;');

    // Insert wallets
    for (const wallet of data.wallets) {
        db.execute(
            `INSERT INTO wallets (id, name, initial_balance, current_balance, image_uri, icon, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [
                wallet.id,
                wallet.name,
                wallet.initial_balance,
                wallet.current_balance,
                wallet.image_uri,
                wallet.icon ?? 'Wallet',
                wallet.created_at,
            ],
        );
    }

    // Insert transactions
    for (const txn of data.transactions) {
        db.execute(
            `INSERT INTO transactions (id, wallet_id, type, amount, reason, image_uri, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [
                txn.id,
                txn.wallet_id,
                txn.type,
                txn.amount,
                txn.reason,
                txn.image_uri,
                txn.created_at,
            ],
        );
    }

    // Đảm bảo current_balance chính xác sau import
    // (Trường hợp file export bị sửa tay hoặc dữ liệu không khớp)
    const walletsResult = db.execute('SELECT id FROM wallets;');
    const walletIds = extractRows<{ id: string }>(walletsResult);
    for (const w of walletIds) {
        recalculateBalance(w.id);
    }
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

export function getSetting(key: string): string | null {
    const db = getDatabase();
    const result = db.execute('SELECT value FROM settings WHERE key = ?;', [key]);
    const rows = extractRows<{ value: string }>(result);
    return rows.length > 0 ? rows[0].value : null;
}

export function setSetting(key: string, value: string): void {
    const db = getDatabase();
    db.execute(
        `INSERT INTO settings (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = ?;`,
        [key, value, value],
    );
}
