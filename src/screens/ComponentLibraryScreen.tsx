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
import LiquidCard from '../components/LiquidCard';
import LiquidButton2 from '../components/LiquidButton2';
import LiquidIconButton from '../components/LiquidIconButton';
import LiquidInput from '../components/LiquidInput';
import LiquidSegmentedControl2 from '../components/LiquidSegmentedControl2';
import IconButton from '../components/IconButton';
import AmountInput from '../components/AmountInput';
import EmptyState from '../components/EmptyState';
import TransactionRow from '../components/TransactionRow';
import WalletCard from '../components/WalletCard';

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

                {/* APPLE LIQUID GLASS BUTTON */}
                <Section title="LiquidButton2 (Apple Glass)">
                    <LiquidButton2 title="Main Button" onPress={() => {}} />
                    <View style={{ height: Spacing.md }} />
                    <LiquidButton2 title="Disabled Button" disabled onPress={() => {}} />
                </Section>

                {/* ICON BUTTON */}
                <Section title="IconButton">
                    <View style={styles.row}>
                        <IconButton icon={<Plus strokeWidth={1.5} color="#FFF" size={32} />} size={60} onPress={() => { }} />
                    </View>
                </Section>

                {/* SEGMENTED CONTROL */}
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

                {/* LIQUID INPUT */}
                <Section title="LiquidInput & AmountInput">
                    <LiquidInput
                        value={inputValue}
                        onChangeText={setInputValue}
                        placeholder="Nhập nội dung tĩnh..."
                    />
                    <View style={{ height: Spacing.md }} />
                    <AmountInput
                        value={inputValue}
                        onChangeText={setInputValue}
                    />
                </Section>

                {/* LIQUID CARD */}
                <Section title="LiquidCard (Intensities)">
                    <LiquidCard intensity="light" style={styles.cardItem}>
                        <Text style={styles.cardText}>Light Intensity</Text>
                    </LiquidCard>
                    <LiquidCard intensity="medium" style={styles.cardItem}>
                        <Text style={styles.cardText}>Medium Intensity</Text>
                    </LiquidCard>
                    <LiquidCard intensity="light" style={styles.cardItem}>
                        <Text style={styles.cardText}>Heavy Intensity</Text>
                    </LiquidCard>
                </Section>

                {/* WALLET CARD */}
                <Section title="WalletCard">
                    <WalletCard
                        name={dummyWallet.name}
                        currentBalance={dummyWallet.balance}
                        onPress={() => { }}
                    />
                </Section>

                {/* TRANSACTION ROW */}
                <Section title="TransactionRow (Card Variant)">
                    <TransactionRow item={dummyTransaction} variant="card" onPress={() => { }} />
                    <TransactionRow item={{ ...dummyTransaction, type: 'IN', amount: 1000000, reason: 'Lương' }} variant="card" onPress={() => { }} />
                </Section>

                <Section title="TransactionRow (Grouped Flat / Medium Card)">
                    <LiquidCard intensity="medium" style={{ paddingVertical: Spacing.sm, borderRadius: Radii.xl }}>
                        <TransactionRow item={dummyTransaction} variant="flat" onPress={() => { }} />
                        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                        <TransactionRow item={{ ...dummyTransaction, type: 'IN', amount: 1000000, reason: 'Lương' }} variant="flat" onPress={() => { }} />
                    </LiquidCard>
                </Section>

                {/* EMPTY STATE */}
                <Section title="EmptyState">
                    <LiquidCard intensity="light" style={{ paddingVertical: Spacing.xl }}>
                        <EmptyState
                            animation="nodata"
                            title="Data Not Found"
                            subtitle="This is an empty state component."
                        />
                    </LiquidCard>
                </Section>

            </ScrollView>
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
