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
    anchor?: { x: number; y: number };
}

const PopupMenu: React.FC<PopupMenuProps> = ({
    visible,
    onClose,
    items,
    title,
    selectedId,
    anchor,
}) => {
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const menuScale = useRef(new Animated.Value(0.9)).current;

    React.useEffect(() => {
        if (visible) {
            // Reset to starting values before animating to prevent flicker
            overlayOpacity.setValue(0);
            menuScale.setValue(0.9);
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
                
                <Animated.View style={[
                    styles.menuContainer, 
                    { transform: [{ scale: menuScale }] },
                    anchor ? {
                        position: 'absolute',
                        top: anchor.y + 8,
                        right: anchor.x,
                    } : null
                ]}>
                    <LiquidCard 
                        style={styles.card}
                        intensity="light"
                        
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
                                    <View key={item.id} style={{ marginBottom: isLast ? 0 : Spacing.md }}>
                                        <Pressable
                                            onPress={() => handleItemPress(item.onPress)}
                                            style={({ pressed }) => [
                                                styles.item,
                                                { opacity: pressed ? 0.6 : 1 }
                                            ]}
                                        >
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
                                                {isSelected && (
                                                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                                        <Check size={20} color={Colors.accent} strokeWidth={3} />
                                                    </View>
                                                )}
                                            </View>
                                        </Pressable>
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
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
    },
    item: {
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: Spacing.sm,
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
});

export default PopupMenu;
