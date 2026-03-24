/**
 * TransactionFilterBar.tsx
 * Uses Volumetric Liquid Glass UI container for filter options
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { FontSizes, Spacing, Radii } from '../common/theme';
import LiquidCard from './LiquidCard';

export interface FilterOption {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

interface TransactionFilterBarProps {
    options: FilterOption[];
    activeFilterId: string;
    onSelectFilter: (id: string) => void;
}

const TransactionFilterBar: React.FC<TransactionFilterBarProps> = ({
    options,
    activeFilterId,
    onSelectFilter,
}) => {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                {options.map((option) => {
                    const isActive = activeFilterId === option.id;

                    return (
                        <Pressable
                            key={option.id}
                            onPress={() => onSelectFilter(option.id)}
                            style={styles.pillWrapper}>
                                <LiquidCard
                                    style={[
                                        styles.pill,
                                        isActive && styles.pillActive,
                                    ]}
                                    intensity={isActive ? "heavy" : "light"}
                                    borderRadius={Radii.pill}
                                >
                                <View style={styles.pillContent}>
                                    {option.icon ? (
                                        <View style={[styles.iconContainer, isActive && styles.iconActive]}>
                                            {option.icon}
                                        </View>
                                    ) : null}
                                    <Text
                                        style={[
                                            styles.pillText,
                                            isActive && styles.activePillText,
                                        ]}>
                                        {option.label}
                                    </Text>
                                </View>
                            </LiquidCard>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
        gap: Spacing.sm,
    },
    pillWrapper: {
        // Shadow wrapper handled by LiquidCard
    },
    pill: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 8,
    },
    pillActive: {
        // Handled via props
    },
    pillContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    iconContainer: {
        opacity: 0.6,
    },
    iconActive: {
        opacity: 1,
    },
    pillText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.6)',
    },
    activePillText: {
        color: '#FFFFFF',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});

export default TransactionFilterBar;
