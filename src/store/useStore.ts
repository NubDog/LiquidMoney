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

    /** Danh sách giao dịch của ví đang chọn */
    transactions: Transaction[];

    /** Trạng thái còn dữ liệu giao dịch hay không */
    hasMoreTransactions: boolean;

    /** Ví đang xem chi tiết */
    currentWallet: Wallet | null;

    /** Đang loading */
    loading: boolean;

    /** Chế độ Developer */
    isDeveloperMode: boolean;

    /** Bật/tắt hiển thị FPS */
    isFPSMonitorEnabled: boolean;

    /** Background ID đang chọn */
    selectedBackgroundId: string | null;

    /** Danh sách hình nền tùy chỉnh */
    customBackgrounds: string[];

    /** Dev tool: Slow time animation settings (duration in seconds) */
    devAnimations: {
        fade: number;
        slide: number;
        zoom: number;
    };
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
        imageUri?: string | null,
    ) => void;

    /** Xóa ví */
    removeWallet: (id: string) => void;

    /** Chọn ví để xem chi tiết */
    selectWallet: (id: string) => void;

    /** Refresh danh sách giao dịch (chỉ lấy 12 dòng đầu) */
    refreshTransactions: (walletId: string, filterType?: 'IN' | 'OUT') => void;

    /** Tải thêm 12 giao dịch tiếp theo */
    loadMoreTransactions: (walletId: string, filterType?: 'IN' | 'OUT') => void;

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

    /** Bật/tắt hiển thị FPS */
    toggleFPSMonitor: () => void;

    /** Cập nhật hình nền */
    setSelectedBackground: (id: string | null) => void;

    /** Thêm hình nền tùy chỉnh */
    addCustomBackground: (uri: string) => void;

    /** Xóa hình nền tùy chỉnh */
    removeCustomBackground: (uri: string) => void;

    validateCustomBackgrounds: () => Promise<void>;

    setDevAnimation: (key: 'fade' | 'slide' | 'zoom', durationSeconds: number) => void;
}

type Store = StoreState & StoreActions;

export const useStore = create<Store>((set, get) => ({
    isReady: false,
    wallets: [],
    transactions: [],
    hasMoreTransactions: true,
    currentWallet: null,
    loading: false,
    isDeveloperMode: true,
    isFPSMonitorEnabled: false,
    selectedBackgroundId: null,
    customBackgrounds: [],
    devAnimations: {
        fade: 0.4,
        slide: 0.4,
        zoom: 0.2, // fast spring default equivalent
    },

    initialize: () => {
        try {
            const success = initDatabase();
            if (success) {
                const allWallets = getAllWallets();
                const bgId = getSetting('app_background_id');
                const customBgsStr = getSetting('app_custom_backgrounds');
                let customBgs: string[] = [];
                if (customBgsStr) {
                    try { customBgs = JSON.parse(customBgsStr); } catch (e) {}
                }
                set({ isReady: true, wallets: allWallets, selectedBackgroundId: bgId, customBackgrounds: customBgs });
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

    adjustWalletBalance: (id, name, newBalance, currentBalance, initialBalance, icon, imageUri) => {
        if (!isDatabaseAvailable()) {
            Alert.alert('Database chưa sẵn sàng', 'Cần rebuild native app.');
            return;
        }
        try {
            dbUpdateWallet(id, name, initialBalance, imageUri, icon);
            
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
            const txns = wallet ? getTransactionsByWallet(id, undefined, 12, 0) : [];
            set({ currentWallet: wallet, transactions: txns, hasMoreTransactions: txns.length === 12 });
        } catch (err) {
            console.error('[Store] selectWallet error:', err);
        }
    },

    refreshTransactions: (walletId, filterType) => {
        if (!isDatabaseAvailable()) return;
        set({ loading: true });
        try {
            const txns = getTransactionsByWallet(walletId, filterType, 12, 0);
            const wallet = getWalletById(walletId);
            const allWallets = getAllWallets();
            set({ transactions: txns, currentWallet: wallet, wallets: allWallets, hasMoreTransactions: txns.length === 12 });
        } catch (err) {
            console.error('[Store] refreshTransactions error:', err);
        } finally {
            set({ loading: false });
        }
    },

    loadMoreTransactions: (walletId, filterType) => {
        if (!isDatabaseAvailable()) return;
        const currentTxns = get().transactions;
        const offset = currentTxns.length;
        
        try {
            const moreTxns = getTransactionsByWallet(walletId, filterType, 12, offset);
            if (moreTxns.length > 0) {
                set({ 
                    transactions: [...currentTxns, ...moreTxns],
                    hasMoreTransactions: moreTxns.length === 12
                });
            } else {
                set({ hasMoreTransactions: false });
            }
        } catch (err) {
            console.error('[Store] loadMoreTransactions error:', err);
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

    toggleFPSMonitor: () => {
        set((state) => ({ isFPSMonitorEnabled: !state.isFPSMonitorEnabled }));
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

    addCustomBackground: (uri) => {
        if (!isDatabaseAvailable()) return;
        const current = get().customBackgrounds;
        if (!current.includes(uri)) {
            const updated = [uri, ...current];
            setSetting('app_custom_backgrounds', JSON.stringify(updated));
            set({ customBackgrounds: updated });
        }
    },

    removeCustomBackground: (uri) => {
        if (!isDatabaseAvailable()) return;
        const current = get().customBackgrounds;
        if (current.includes(uri)) {
            const updated = current.filter((u) => u !== uri);
            setSetting('app_custom_backgrounds', JSON.stringify(updated));
            set({ customBackgrounds: updated });
            
            if (get().selectedBackgroundId === uri) {
                get().setSelectedBackground(null);
            }
        }
    },

    validateCustomBackgrounds: async () => {
        if (!isDatabaseAvailable()) return;
        const current = get().customBackgrounds;
        if (!current || current.length === 0) return;
        
        const { Image } = require('react-native');
        const validBgs: string[] = [];
        let changed = false;
        
        for (const uri of current) {
            try {
                await new Promise<void>((resolve, reject) => {
                    Image.getSize(uri, 
                        () => resolve(), 
                        () => reject(new Error('not found'))
                    );
                });
                validBgs.push(uri);
            } catch (err) {
                changed = true;
            }
        }
        
        if (changed) {
            setSetting('app_custom_backgrounds', JSON.stringify(validBgs));
            set({ customBackgrounds: validBgs });
            
            const currentSelected = get().selectedBackgroundId;
            // Xóa background đang chọn nếu nó không còn tồn tại
            if (currentSelected && !validBgs.includes(currentSelected)) {
                // Kiểm tra xem nó có phải là background mặc định/danh sách ko
                // Cần check tránh xóa selectedBackgroundId hợp lệ từ BACKGROUNDS
                const isPredefined = !currentSelected.startsWith('file://') && !currentSelected.startsWith('content://');
                if (!isPredefined) {
                    get().setSelectedBackground(null);
                }
            }
        }
    },

    setDevAnimation: (key, durationSeconds) => {
        set((state) => ({
            devAnimations: {
                ...state.devAnimations,
                [key]: durationSeconds,
            }
        }));
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
