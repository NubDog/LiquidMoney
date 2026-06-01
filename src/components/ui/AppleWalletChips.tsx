import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FontSizes, Spacing } from '../../common/theme';
import type { Wallet } from '../../database/queries';

interface AppleWalletChipsProps {
    wallets: Wallet[];
    selectedId?: string;
    onSelect: (id?: string) => void;
}

const AppleWalletChips: React.FC<AppleWalletChipsProps> = React.memo(({ wallets, selectedId, onSelect }) => {
    const activeId = selectedId || 'ALL';
    const items = useMemo(() => {
        return [{ id: 'ALL', name: 'Tất cả' }, ...wallets];
    }, [wallets]);

    if (wallets.length <= 1) { return null; }

    return (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.scrollWrapper} 
            contentContainerStyle={styles.container}
        >
            <View style={{ flexDirection: 'row', gap: 8 }}>
                {items.map(w => {
                    const isSelected = activeId === w.id;
                    return (
                        <Pressable 
                            key={w.id} 
                            onPress={() => onSelect(w.id === 'ALL' ? undefined : w.id)}
                            style={[
                                styles.chip,
                                { backgroundColor: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)' }
                            ]}
                        >
                            <Text style={[
                                styles.chipText,
                                { color: isSelected ? '#FFFFFF' : 'rgba(235,235,245,0.6)' }
                            ]}>
                                {w.name}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </ScrollView>
    );
});

const styles = StyleSheet.create({
    scrollWrapper: { flexGrow: 0, marginBottom: Spacing.lg },
    container: { },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    chipText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
});

export default AppleWalletChips;
