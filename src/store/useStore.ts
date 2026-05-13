/**
 * useStore.ts — Global State Management (Zustand v5)
 * Kết nối Database queries ↔ UI
 */

import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { create } from 'zustand';
import { initDatabase, isDatabaseAvailable } from '../database/db';
import {
    getAllWallets,
    getWalletById,
    createWallet as dbCreateWallet,
    updateWallet as dbUpdateWallet,
    updateWalletDirect as dbUpdateWalletDirect,
    deleteWallet as dbDeleteWallet,
    getTransactionsByWallet,
    createTransaction as dbCreateTransaction,
    updateTransaction as dbUpdateTransaction,
    deleteTransaction as dbDeleteTransaction,
    getSetting,
    setSetting,
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

    /** Chế độ Developer */
    isDeveloperMode: boolean;

    /** Background ID đang chọn */
    selectedBackgroundId: string | null;
}

interface StoreActions {
    /** Khởi tạo database */
    initialize: () => void;

    /** Load lại danh sách ví từ DB */
    refreshWallets: () => void;

    /** Tạo ví mới */
    addWallet: (
        name: string,
        initialBalance: number,
        imageUri?: string | null,
        icon?: string | null,
    ) => void;

    /** Cập nhật ví */
    editWallet: (
        id: string,
        name: string,
        initialBalance: number,
        imageUri?: string | null,
        icon?: string | null,
    ) => void;

    /** Thay đổi tên ví và tự động sinh giao dịch điều chỉnh nếu số dư thay đổi */
    adjustWalletBalance: (
        id: string,
        name: string,
        newBalance: number,
        currentBalance: number,
        initialBalance: number,
        icon?: string | null,
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
        date?: string,
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

    /** Bật/tắt Developer Mode */
    toggleDeveloperMode: () => void;

    /** Cập nhật hình nền */
    setSelectedBackground: (id: string | null) => void;
}

type Store = StoreState & StoreActions;

export const useStore = create<Store>((set, get) => ({
    isReady: false,
    wallets: [],
    transactions: [],
    currentWallet: null,
    loading: false,
    isDeveloperMode: true,
    selectedBackgroundId: null,

    initialize: () => {
        try {
            const success = initDatabase();
            if (success) {
                const allWallets = getAllWallets();
                const bgId = getSetting('app_background_id');
                set({ isReady: true, wallets: allWallets, selectedBackgroundId: bgId });
            } else {
                console.warn('[Store] DB chưa sẵn sàng — cần rebuild native app.');
                set({ isReady: true });
            }
        } catch (err) {
            console.error('[Store] Lỗi khởi tạo DB:', err);
            set({ isReady: true });
        }
    },

    refreshWallets: () => {
        if (!isDatabaseAvailable()) return;
        set({ loading: true });
        try {
            const allWallets = getAllWallets();
            set({ wallets: allWallets });
        } catch (err) {
            console.error('[Store] refreshWallets error:', err);
        } finally {
            set({ loading: false });
        }
    },

    addWallet: (name, initialBalance, imageUri, icon) => {
        if (!isDatabaseAvailable()) {
            Alert.alert(
                'Database chưa sẵn sàng',
                'Cần rebuild native app để sử dụng tính năng này.\nnpx react-native run-android',
            );
            return;
        }
        try {
            dbCreateWallet(name, initialBalance, imageUri, icon);
            get().refreshWallets();
        } catch (err) {
            console.error('[Store] addWallet error:', err);
        }
    },

    editWallet: (id, name, initialBalance, imageUri, icon) => {
        if (!isDatabaseAvailable()) {
            Alert.alert('Database chưa sẵn sàng', 'Cần rebuild native app.');
            return;
        }
        try {
            dbUpdateWallet(id, name, initialBalance, imageUri, icon);
            get().refreshWallets();
            if (get().currentWallet?.id === id) {
                const updated = getWalletById(id);
                set({ currentWallet: updated });
            }
        } catch (err) {
            console.error('[Store] editWallet error:', err);
        }
    },

    adjustWalletBalance: (id, name, newBalance, currentBalance, initialBalance, icon) => {
        if (!isDatabaseAvailable()) {
            Alert.alert('Database chưa sẵn sàng', 'Cần rebuild native app.');
            return;
        }
        try {
            dbUpdateWallet(id, name, initialBalance, null, icon);
            
            const diff = newBalance - currentBalance;
            if (diff !== 0) {
                const type = diff > 0 ? 'IN' : 'OUT';
                const amount = Math.abs(diff);
                dbCreateTransaction(id, type, amount, 'Điều chỉnh số dư', null);
            }

            get().refreshWallets();
            if (get().currentWallet?.id === id) {
                const updated = getWalletById(id);
                const txs = getTransactionsByWallet(id);
                set({ currentWallet: updated, transactions: txs });
            }
        } catch (err) {
            console.error('[Store] adjustWalletBalance error:', err);
        }
    },

    removeWallet: (id) => {
        if (!isDatabaseAvailable()) {
            Alert.alert('Database chưa sẵn sàng', 'Cần rebuild native app.');
            return;
        }
        try {
            dbDeleteWallet(id);
            get().refreshWallets();
            if (get().currentWallet?.id === id) {
                set({ currentWallet: null, transactions: [] });
            }
        } catch (err) {
            console.error('[Store] removeWallet error:', err);
        }
    },

    selectWallet: (id) => {
        try {
            const wallet = getWalletById(id);
            const txns = wallet ? getTransactionsByWallet(id) : [];
            set({ currentWallet: wallet, transactions: txns });
        } catch (err) {
            console.error('[Store] selectWallet error:', err);
        }
    },

    refreshTransactions: (walletId, filterType) => {
        if (!isDatabaseAvailable()) return;
        set({ loading: true });
        try {
            const txns = getTransactionsByWallet(walletId, filterType);
            const wallet = getWalletById(walletId);
            const allWallets = getAllWallets();
            set({ transactions: txns, currentWallet: wallet, wallets: allWallets });
        } catch (err) {
            console.error('[Store] refreshTransactions error:', err);
        } finally {
            set({ loading: false });
        }
    },

    addTransaction: (walletId, type, amount, reason, imageUri, date) => {
        if (!isDatabaseAvailable()) {
            Alert.alert('Database chưa sẵn sàng', 'Cần rebuild native app.');
            return;
        }
        try {
            dbCreateTransaction(walletId, type, amount, reason, imageUri, date);
            get().refreshTransactions(walletId);
        } catch (err) {
            console.error('[Store] addTransaction error:', err);
        }
    },

    editTransaction: (id, walletId, type, amount, reason, imageUri) => {
        if (!isDatabaseAvailable()) {
            Alert.alert('Database chưa sẵn sàng', 'Cần rebuild native app.');
            return;
        }
        try {
            dbUpdateTransaction(id, walletId, type, amount, reason, imageUri);
            get().refreshTransactions(walletId);
        } catch (err) {
            console.error('[Store] editTransaction error:', err);
        }
    },

    removeTransaction: (id, walletId) => {
        if (!isDatabaseAvailable()) {
            Alert.alert('Database chưa sẵn sàng', 'Cần rebuild native app.');
            return;
        }
        try {
            dbDeleteTransaction(id);
            get().refreshTransactions(walletId);
        } catch (err) {
            console.error('[Store] removeTransaction error:', err);
        }
    },

    toggleDeveloperMode: () => {
        set((state) => ({ isDeveloperMode: !state.isDeveloperMode }));
    },

    setSelectedBackground: (id) => {
        if (!isDatabaseAvailable()) return;
        try {
            if (id) {
                setSetting('app_background_id', id);
            } else {
                setSetting('app_background_id', '');
            }
            set({ selectedBackgroundId: id });
        } catch (err) {
            console.error('[Store] setSelectedBackground error:', err);
        }
    },
}));

// ─── Provider Component ───────────────────────────────────────────────────────

/**
 * Empty Provider for backwards compatibility in App.tsx.
 * It just runs initialization on mount.
 */
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    useEffect(() => {
        useStore.getState().initialize();
    }, []);

    return React.createElement(React.Fragment, null, children);
};
