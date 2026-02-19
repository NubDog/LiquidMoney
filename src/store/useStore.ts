/**
 * useStore.ts — Global State Management (React Context)
 * Kết nối Database queries ↔ UI
 */

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { initDatabase } from '../database/db';
import {
    getAllWallets,
    getWalletById,
    createWallet as dbCreateWallet,
    updateWallet as dbUpdateWallet,
    deleteWallet as dbDeleteWallet,
    getTransactionsByWallet,
    createTransaction as dbCreateTransaction,
    updateTransaction as dbUpdateTransaction,
    deleteTransaction as dbDeleteTransaction,
    type Wallet,
    type Transaction,
} from '../database/queries';

// ─── Store State Interface ────────────────────────────────────────────────────

interface StoreState {
    /** Trạng thái khởi tạo DB */
    isReady: boolean;

    /** Danh sách ví */
    wallets: Wallet[];

    /** Giao dịch của ví đang xem */
    transactions: Transaction[];

    /** Ví đang xem chi tiết */
    currentWallet: Wallet | null;

    /** Đang loading */
    loading: boolean;
}

interface StoreActions {
    /** Load lại danh sách ví từ DB */
    refreshWallets: () => void;

    /** Tạo ví mới */
    addWallet: (
        name: string,
        initialBalance: number,
        imageUri?: string | null,
    ) => void;

    /** Cập nhật ví */
    editWallet: (
        id: string,
        name: string,
        initialBalance: number,
        imageUri?: string | null,
    ) => void;

    /** Xóa ví */
    removeWallet: (id: string) => void;

    /** Chọn ví để xem chi tiết */
    selectWallet: (id: string) => void;

    /** Load giao dịch của ví hiện tại */
    refreshTransactions: (walletId: string, filterType?: 'IN' | 'OUT') => void;

    /** Tạo giao dịch mới */
    addTransaction: (
        walletId: string,
        type: 'IN' | 'OUT',
        amount: number,
        reason?: string | null,
        imageUri?: string | null,
    ) => void;

    /** Cập nhật giao dịch */
    editTransaction: (
        id: string,
        walletId: string,
        type: 'IN' | 'OUT',
        amount: number,
        reason?: string | null,
        imageUri?: string | null,
    ) => void;

    /** Xóa giao dịch */
    removeTransaction: (id: string, walletId: string) => void;
}

type Store = StoreState & StoreActions;

// ─── Context ──────────────────────────────────────────────────────────────────

const StoreContext = createContext<Store | null>(null);

// ─── Provider Component ───────────────────────────────────────────────────────

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isReady, setIsReady] = useState(false);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
    const [loading, setLoading] = useState(false);

    // ─── Khởi tạo Database khi app start ─────────────────────────────────────

    useEffect(() => {
        try {
            const success = initDatabase();
            if (success) {
                const allWallets = getAllWallets();
                setWallets(allWallets);
            } else {
                console.warn('[Store] DB chưa sẵn sàng — cần rebuild native app.');
            }
        } catch (err) {
            console.error('[Store] Lỗi khởi tạo DB:', err);
        }
        // Luôn set ready để UI vẫn render được
        setIsReady(true);
    }, []);

    // ─── Wallet Actions ───────────────────────────────────────────────────────

    const refreshWallets = useCallback(() => {
        try {
            setLoading(true);
            const allWallets = getAllWallets();
            setWallets(allWallets);
        } catch (err) {
            console.error('[Store] refreshWallets error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const addWallet = useCallback(
        (name: string, initialBalance: number, imageUri?: string | null) => {
            try {
                dbCreateWallet(name, initialBalance, imageUri);
                refreshWallets();
            } catch (err) {
                console.error('[Store] addWallet error:', err);
            }
        },
        [refreshWallets],
    );

    const editWallet = useCallback(
        (
            id: string,
            name: string,
            initialBalance: number,
            imageUri?: string | null,
        ) => {
            try {
                dbUpdateWallet(id, name, initialBalance, imageUri);
                refreshWallets();
                // Cập nhật currentWallet nếu đang xem ví này
                if (currentWallet?.id === id) {
                    const updated = getWalletById(id);
                    setCurrentWallet(updated);
                }
            } catch (err) {
                console.error('[Store] editWallet error:', err);
            }
        },
        [refreshWallets, currentWallet],
    );

    const removeWallet = useCallback(
        (id: string) => {
            try {
                dbDeleteWallet(id);
                refreshWallets();
                if (currentWallet?.id === id) {
                    setCurrentWallet(null);
                    setTransactions([]);
                }
            } catch (err) {
                console.error('[Store] removeWallet error:', err);
            }
        },
        [refreshWallets, currentWallet],
    );

    const selectWallet = useCallback((id: string) => {
        try {
            const wallet = getWalletById(id);
            setCurrentWallet(wallet);
            if (wallet) {
                const txns = getTransactionsByWallet(id);
                setTransactions(txns);
            }
        } catch (err) {
            console.error('[Store] selectWallet error:', err);
        }
    }, []);

    // ─── Transaction Actions ──────────────────────────────────────────────────

    const refreshTransactions = useCallback(
        (walletId: string, filterType?: 'IN' | 'OUT') => {
            try {
                setLoading(true);
                const txns = getTransactionsByWallet(walletId, filterType);
                setTransactions(txns);
                // Cập nhật currentWallet (số dư có thể đã thay đổi)
                const wallet = getWalletById(walletId);
                setCurrentWallet(wallet);
                // Cập nhật danh sách wallets (số dư hiển thị ở HomeScreen)
                const allWallets = getAllWallets();
                setWallets(allWallets);
            } catch (err) {
                console.error('[Store] refreshTransactions error:', err);
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const addTransaction = useCallback(
        (
            walletId: string,
            type: 'IN' | 'OUT',
            amount: number,
            reason?: string | null,
            imageUri?: string | null,
        ) => {
            try {
                dbCreateTransaction(walletId, type, amount, reason, imageUri);
                refreshTransactions(walletId);
            } catch (err) {
                console.error('[Store] addTransaction error:', err);
            }
        },
        [refreshTransactions],
    );

    const editTransaction = useCallback(
        (
            id: string,
            walletId: string,
            type: 'IN' | 'OUT',
            amount: number,
            reason?: string | null,
            imageUri?: string | null,
        ) => {
            try {
                dbUpdateTransaction(id, walletId, type, amount, reason, imageUri);
                refreshTransactions(walletId);
            } catch (err) {
                console.error('[Store] editTransaction error:', err);
            }
        },
        [refreshTransactions],
    );

    const removeTransaction = useCallback(
        (id: string, walletId: string) => {
            try {
                dbDeleteTransaction(id);
                refreshTransactions(walletId);
            } catch (err) {
                console.error('[Store] removeTransaction error:', err);
            }
        },
        [refreshTransactions],
    );

    // ─── Memoized store value ─────────────────────────────────────────────────

    const store = useMemo<Store>(
        () => ({
            isReady,
            wallets,
            transactions,
            currentWallet,
            loading,
            refreshWallets,
            addWallet,
            editWallet,
            removeWallet,
            selectWallet,
            refreshTransactions,
            addTransaction,
            editTransaction,
            removeTransaction,
        }),
        [
            isReady,
            wallets,
            transactions,
            currentWallet,
            loading,
            refreshWallets,
            addWallet,
            editWallet,
            removeWallet,
            selectWallet,
            refreshTransactions,
            addTransaction,
            editTransaction,
            removeTransaction,
        ],
    );

    return React.createElement(StoreContext.Provider, { value: store }, children);
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook truy cập global store
 * @throws Error nếu dùng ngoài StoreProvider
 */
export function useStore(): Store {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('[LiquidMoney] useStore phải được dùng bên trong StoreProvider.');
    }
    return context;
}
