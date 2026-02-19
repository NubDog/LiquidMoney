/**
 * walletIcons.ts — Danh sách icon lucide dành cho ví
 * Chỉ export raw icon component, không style mặc định
 */

import {
    Wallet,
    Landmark,
    Banknote,
    CreditCard,
    PiggyBank,
    Coins,
    CircleDollarSign,
    HandCoins,
    Receipt,
    BadgeDollarSign,
    Building2,
    Vault,
    DollarSign,
    Bitcoin,
    TrendingUp,
    ShoppingBag,
    Gift,
    Briefcase,
    Car,
    Home,
    type LucideIcon,
} from 'lucide-react-native';

// ─── Kiểu dữ liệu ───────────────────────────────────────────────────────────

export interface WalletIconItem {
    /** Key lưu trong DB, trùng tên lucide icon */
    key: string;
    /** React component của icon */
    icon: LucideIcon;
    /** Nhãn hiển thị */
    label: string;
}

// ─── Danh sách icon ───────────────────────────────────────────────────────────

export const WALLET_ICONS: WalletIconItem[] = [
    { key: 'Wallet', icon: Wallet, label: 'Ví tiền' },
    { key: 'Landmark', icon: Landmark, label: 'Ngân hàng' },
    { key: 'Banknote', icon: Banknote, label: 'Tiền mặt' },
    { key: 'CreditCard', icon: CreditCard, label: 'Thẻ' },
    { key: 'PiggyBank', icon: PiggyBank, label: 'Tiết kiệm' },
    { key: 'Coins', icon: Coins, label: 'Đồng xu' },
    { key: 'CircleDollarSign', icon: CircleDollarSign, label: 'Dollar' },
    { key: 'HandCoins', icon: HandCoins, label: 'Thu nhập' },
    { key: 'Receipt', icon: Receipt, label: 'Hóa đơn' },
    { key: 'BadgeDollarSign', icon: BadgeDollarSign, label: 'Huy hiệu' },
    { key: 'Building2', icon: Building2, label: 'Tòa nhà' },
    { key: 'Vault', icon: Vault, label: 'Kho bạc' },
    { key: 'DollarSign', icon: DollarSign, label: 'Ký hiệu $' },
    { key: 'Bitcoin', icon: Bitcoin, label: 'Crypto' },
    { key: 'TrendingUp', icon: TrendingUp, label: 'Đầu tư' },
    { key: 'ShoppingBag', icon: ShoppingBag, label: 'Mua sắm' },
    { key: 'Gift', icon: Gift, label: 'Quà tặng' },
    { key: 'Briefcase', icon: Briefcase, label: 'Công việc' },
    { key: 'Car', icon: Car, label: 'Xe cộ' },
    { key: 'Home', icon: Home, label: 'Nhà' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Tìm icon component theo key, fallback về Wallet */
export function getWalletIcon(key: string | null | undefined): LucideIcon {
    if (!key) { return Wallet; }
    const found = WALLET_ICONS.find(item => item.key === key);
    return found ? found.icon : Wallet;
}

/** Icon mặc định */
export const DEFAULT_WALLET_ICON = 'Wallet';
