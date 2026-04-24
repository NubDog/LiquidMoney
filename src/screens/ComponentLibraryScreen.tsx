/**
 * ComponentLibraryScreen.tsx — Design System Showcase
 * Displays all components used in the application.
 */

import React, { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Figma, Plus } from 'lucide-react-native';

import LiquidBackground from '../components/LiquidBackground';

import LiquidButton2 from '../components/LiquidButton2';
import LiquidInput from '../components/LiquidInput';
import LiquidSegmentedControl2 from '../components/LiquidSegmentedControl2';
import IconButton from '../components/IconButton';
import AmountInput2 from '../components/AmountInput2';
import EmptyState2 from '../components/EmptyState2';
import BackgroundLiquidGlass from '../components/BackgroundLiquidGlass';
import TransactionRow2 from '../components/TransactionRow2';
import WalletCard2 from '../components/WalletCard2';

// --- newly imported components ---
import AnimatedOverlay from '../components/AnimatedOverlay';
import BackgroundPickerModal from '../components/BackgroundPickerModal';
import ConfirmDialog2 from '../components/ConfirmDialog2';
import ConfirmImportDialog2 from '../components/ConfirmImportDialog2';
import EditWalletModal from '../components/EditWalletModal';
import InfoDialog from '../components/InfoDialog';
import LiquidModal from '../components/LiquidModal';
import PopupMenu from '../components/PopupMenu';
import TerminalLogModal from '../components/TerminalLogModal';
import TransactionDetailOverlay from '../components/TransactionDetailOverlay';
import TransactionFilterBar from '../components/TransactionFilterBar';
import TransactionModal from '../components/TransactionModal';
import { WalletDetailSkeleton } from '../components/WalletDetailSkeleton';
import WalletModal from '../components/WalletModal';

import { Colors, FontSizes, Radii, Spacing } from '../common/theme';

interface ComponentLibraryScreenProps {
    visible: boolean;
    onClose: () => void;
}

const ComponentLibraryScreen: React.FC<ComponentLibraryScreenProps> = ({
    visible,
    onClose,
}) => {
    const insets = useSafeAreaInsets();
    const [segment, setSegment] = useState<'a' | 'b'>('a');
    const [inputValue, setInputValue] = useState('');
    
    // --- Modals State ---
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [filterId, setFilterId] = useState('all');

    if (!visible) return null;

    // Dummy data
    const dummyTransaction = {
        id: '1',
        wallet_id: 'w1',
        amount: 500000,
        type: 'OUT' as const,
        category: 'Food',
        reason: 'Ăn tối',
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        image_uri: null,
    };

    const dummyWallet = {
        id: 'w1',
        name: 'Tiền mặt',
        balance: 15400000,
        color: '#3b82f6',
        icon: '💵',
        created_at: Date.now(),
    };

    const dummyFilterOptions = [
        { id: 'all', label: 'Tất cả' },
        { id: 'in', label: 'Thu nhập' },
        { id: 'out', label: 'Chi tiêu' }
    ];

    return (
        <View style={[StyleSheet.absoluteFill, styles.container]}>
            <LiquidBackground />

            {/* Header Navbar */}
            <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
                <Text style={styles.headerTitle}>Component Library</Text>
                <Pressable onPress={onClose} style={styles.closeBtn}>
                    <X size={24} color="#FFF" />
                </Pressable>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}>

                {/* --- EXISTING SECTIONS --- */}
                <Section title="BackgroundLiquidGlass (VIP Pro Max)">
                    <BackgroundLiquidGlass>
                        <Text style={{ color: '#fff', textAlign: 'center', padding: 16 }}>
                            Default Background Wrapper
                        </Text>
                    </BackgroundLiquidGlass>
                    <View style={{ height: 16 }} />
                    <BackgroundLiquidGlass onPress={() => {}}>
                        <Text style={{ color: '#fff', textAlign: 'center', padding: 16, fontWeight: 'bold' }}>
                            Interactive Wrapper (Press Me)
                        </Text>
                    </BackgroundLiquidGlass>
                    <View style={{ height: 16 }} />
                    <BackgroundLiquidGlass disabled onPress={() => {}}>
                        <Text style={{ color: '#fff', textAlign: 'center', padding: 16, opacity: 0.6 }}>
                            Disabled Background Wrapper
                        </Text>
                    </BackgroundLiquidGlass>
                </Section>

                <Section title="LiquidButton2 (Apple Glass)">
                    <LiquidButton2 title="Main Button" onPress={() => {}} />
                    <View style={{ height: Spacing.md }} />
                    <LiquidButton2 title="Disabled Button" disabled onPress={() => {}} />
                </Section>

                <Section title="IconButton">
                    <View style={styles.row}>
                        <IconButton icon={<Plus strokeWidth={1.5} color="#FFF" size={32} />} size={60} onPress={() => { }} />
                    </View>
                </Section>

                <Section title="LiquidSegmentedControl2">
                    <LiquidSegmentedControl2
                        options={[
                            { key: 'a', label: 'Lựa chọn A' },
                            { key: 'b', label: 'B' },
                        ]}
                        selected={segment}
                        onChange={(val) => setSegment(val as 'a' | 'b')}
                    />
                </Section>

                <Section title="LiquidInput & AmountInput">
                    <LiquidInput
                        value={inputValue}
                        onChangeText={setInputValue}
                        placeholder="Nhập nội dung tĩnh..."
                    />
                    <View style={{ height: Spacing.md }} />
                    <AmountInput2
                        value={inputValue}
                        onChangeText={setInputValue}
                    />
                </Section>

                <Section title="LiquidCard (Intensities)">
                    <BackgroundLiquidGlass style={styles.cardItem}>
                        <Text style={styles.cardText}>Light Intensity</Text>
                    </BackgroundLiquidGlass>
                    <BackgroundLiquidGlass style={styles.cardItem}>
                        <Text style={styles.cardText}>Medium Intensity</Text>
                    </BackgroundLiquidGlass>
                    <BackgroundLiquidGlass style={styles.cardItem}>
                        <Text style={styles.cardText}>Heavy Intensity</Text>
                    </BackgroundLiquidGlass>
                </Section>

                <Section title="WalletCard2">
                    <WalletCard2
                        name={dummyWallet.name}
                        balance={dummyWallet.balance}
                        onPress={() => { }}
                    />
                </Section>

                <Section title="TransactionRow">
                    <TransactionRow2 item={dummyTransaction} onPress={() => { }} />
                    <TransactionRow2 item={{ ...dummyTransaction, type: 'IN', amount: 1000000, reason: 'Lương' }} onPress={() => { }} />
                </Section>

                <Section title="EmptyState2">
                    <EmptyState2
                        animation="nodata"
                        title="Data Not Found"
                        subtitle="This is an empty state component."
                    />
                </Section>



                <Section title="TransactionFilterBar">
                    <TransactionFilterBar 
                        options={dummyFilterOptions}
                        activeFilterId={filterId}
                        onSelectFilter={setFilterId}
                    />
                </Section>

                <Section title="WalletDetailSkeleton">
                    <WalletDetailSkeleton />
                </Section>

                {/* Modals Triggers */}
                <Section title="Modals & Dialogs">
                    <View style={{ gap: Spacing.md }}>
                        <LiquidButton2 title="Open BackgroundPickerModal" onPress={() => setActiveModal('BackgroundPickerModal')} />
                        <LiquidButton2 title="Open ConfirmDialog2" onPress={() => setActiveModal('ConfirmDialog2')} />
                        <LiquidButton2 title="Open ConfirmImportDialog2" onPress={() => setActiveModal('ConfirmImportDialog2')} />
                        <LiquidButton2 title="Open EditWalletModal" onPress={() => setActiveModal('EditWalletModal')} />
                        <LiquidButton2 title="Open InfoDialog" onPress={() => setActiveModal('InfoDialog')} />
                        <LiquidButton2 title="Open LiquidModal" onPress={() => setActiveModal('LiquidModal')} />
                        <LiquidButton2 title="Open PopupMenu" onPress={() => setActiveModal('PopupMenu')} />
                        <LiquidButton2 title="Open TerminalLogModal" onPress={() => setActiveModal('TerminalLogModal')} />
                        <LiquidButton2 title="Open TransactionDetailOverlay" onPress={() => setActiveModal('TransactionDetailOverlay')} />
                        <LiquidButton2 title="Open TransactionModal" onPress={() => setActiveModal('TransactionModal')} />
                        <LiquidButton2 title="Open WalletModal" onPress={() => setActiveModal('WalletModal')} />
                    </View>
                </Section>

            </ScrollView>

            {/* --- MODAL DECLARATIONS --- */}
            
            <BackgroundPickerModal
                visible={activeModal === 'BackgroundPickerModal'}
                onClose={() => setActiveModal(null)}
            />

            <ConfirmDialog2
                visible={activeModal === 'ConfirmDialog2'}
                title="Xác nhận"
                message="Bạn có chắc chắn muốn thực hiện hành động này?"
                onCancel={() => setActiveModal(null)}
                onConfirm={() => setActiveModal(null)}
            />

            <ConfirmImportDialog2
                visible={activeModal === 'ConfirmImportDialog2'}
                onCancel={() => setActiveModal(null)}
                onConfirm={() => setActiveModal(null)}
            />

            <EditWalletModal
                visible={activeModal === 'EditWalletModal'}
                onClose={() => setActiveModal(null)}
                onSave={(n, b) => setActiveModal(null)}
                walletName="Ví Cá Nhân"
                walletBalance={5000000}
            />

            <InfoDialog
                visible={activeModal === 'InfoDialog'}
                onClose={() => setActiveModal(null)}
                title="Thông báo"
                message="Dữ liệu đã được lưu thành công."
                type="success"
            />

            <LiquidModal
                visible={activeModal === 'LiquidModal'}
                onClose={() => setActiveModal(null)}
            >
                <View style={{ padding: 20 }}>
                    <Text style={{ color: '#fff', textAlign: 'center' }}>Nội dung Liquid Modal Tùy Chỉnh</Text>
                </View>
            </LiquidModal>

            <PopupMenu
                visible={activeModal === 'PopupMenu'}
                onClose={() => setActiveModal(null)}
                items={[{ id: '1', label: 'Option 1', icon: <Plus size={20} color="#fff" />, onPress: () => setActiveModal(null) }]}
                anchor={{ x: 100, y: 100 }}
            />

            <TerminalLogModal
                visible={activeModal === 'TerminalLogModal'}
                onClose={() => setActiveModal(null)}
                logs={['System initializing...', 'Connecting to database...', 'Done.']}
            />

            <TransactionDetailOverlay
                visible={activeModal === 'TransactionDetailOverlay'}
                onClose={() => setActiveModal(null)}
                transaction={dummyTransaction}
            />

            <TransactionModal
                visible={activeModal === 'TransactionModal'}
                onClose={() => setActiveModal(null)}
                onSave={() => {}}
            />

            <WalletModal
                visible={activeModal === 'WalletModal'}
                onClose={() => setActiveModal(null)}
                onSave={() => {}}
            />

            <AnimatedOverlay 
                visible={false} 
                onPress={() => {}}
            />

        </View>
    );
};

// Local component for sections
const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionContent}>
            {children}
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        zIndex: 10,
    },
    headerTitle: {
        fontSize: FontSizes.xl,
        fontWeight: '800',
        color: '#FFF',
    },
    closeBtn: {
        padding: Spacing.xs,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: Radii.pill,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.md,
    },
    section: {
        marginBottom: Spacing.xxl,
    },
    sectionTitle: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: Spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionContent: {
        gap: Spacing.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    flexItem: {
        flex: 1,
    },
    cardItem: {
        padding: Spacing.md,
    },
    cardText: {
        color: '#FFF',
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
});

export default ComponentLibraryScreen;
