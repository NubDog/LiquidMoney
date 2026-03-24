/**
 * PopupMenu.tsx — Context menu / Popup
 * Refactored to Volumetric Liquid Glass using LiquidCard
 */

import React, { useRef } from 'react';
import {
    Animated,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { animateDialogOpen, animateDialogClose } from '../common/animations';
import { Colors, FontSizes, Radii, Shadows, Spacing } from '../common/theme';
import LiquidCard from './LiquidCard';

interface MenuItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    color?: string;
    onPress: () => void;
}

interface PopupMenuProps {
    visible: boolean;
    onClose: () => void;
    items: MenuItem[];
    title?: string;
    selectedId?: string;
}

const PopupMenu: React.FC<PopupMenuProps> = ({
    visible,
    onClose,
    items,
    title,
    selectedId,
}) => {
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const menuScale = useRef(new Animated.Value(0.9)).current;

    React.useEffect(() => {
        if (visible) {
            animateDialogOpen(overlayOpacity, menuScale);
        }
    }, [visible, overlayOpacity, menuScale]);

    const handleItemPress = (onPress: () => void) => {
        animateDialogClose(overlayOpacity, menuScale, () => {
            onPress();
            onClose();
        });
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}>
            <View style={styles.root}>
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        styles.overlay,
                        { opacity: overlayOpacity },
                    ]}
                />
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => animateDialogClose(overlayOpacity, menuScale, onClose)}
                />
                
                <Animated.View style={[styles.menuContainer, { transform: [{ scale: menuScale }] }]}>
                    <LiquidCard 
                        style={styles.card}
                        intensity="heavy"
                        
                        borderRadius={Radii.xl}
                    >
                        {title && (
                            <View style={styles.header}>
                                <Text style={styles.title}>{title}</Text>
                            </View>
                        )}
                        
                        <View style={styles.itemsContainer}>
                            {items.map((item, index) => {
                                const isSelected = item.id === selectedId;
                                const isLast = index === items.length - 1;
                                
                                return (
                                    <View key={item.id}>
                                        <Pressable
                                            onPress={() => handleItemPress(item.onPress)}
                                            style={({ pressed }) => [
                                                styles.item,
                                                pressed && styles.itemPressed,
                                            ]}>
                                            <View style={styles.itemContent}>
                                                {item.icon && (
                                                    <View style={styles.itemIcon}>
                                                        {item.icon}
                                                    </View>
                                                )}
                                                <Text
                                                    style={[
                                                        styles.itemLabel,
                                                        { color: item.color || '#FFFFFF' },
                                                        isSelected && styles.itemLabelSelected,
                                                    ]}>
                                                    {item.label}
                                                </Text>
                                            </View>
                                            
                                            {isSelected && (
                                                <Check size={20} color={Colors.accent} strokeWidth={3} />
                                            )}
                                        </Pressable>
                                        {!isLast && <View style={styles.divider} />}
                                    </View>
                                );
                            })}
                        </View>
                    </LiquidCard>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        backgroundColor: Colors.overlayHeavy,
    },
    menuContainer: {
        width: '80%',
        maxWidth: 320,
        ...Shadows.card,
    },
    card: {
        overflow: 'hidden',
    },
    header: {
        padding: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    title: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
    },
    itemsContainer: {
        paddingVertical: 4,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: Spacing.lg,
    },
    itemPressed: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemIcon: {
        marginRight: Spacing.md,
    },
    itemLabel: {
        fontSize: FontSizes.lg - 1,
        fontWeight: '500',
    },
    itemLabelSelected: {
        fontWeight: '700',
        color: Colors.accent,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginLeft: Spacing.lg + 36, // Align with text
    },
});

export default PopupMenu;
