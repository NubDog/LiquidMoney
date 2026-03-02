/**
 * PopupMenu.tsx — Animated popup context menu
 * Extracted from WalletDetailScreen.tsx (lines 282-382).
 * Supports open/close animations with scale and opacity.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import { Colors, FontSizes, Radii, Shadows } from '../common/theme';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PopupMenuProps {
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    anchorY: number;
    anchorX: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

const PopupMenu: React.FC<PopupMenuProps> = ({
    visible,
    onClose,
    onEdit,
    onDelete,
    anchorY,
    anchorX,
}) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.85)).current;
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    damping: 12,
                    stiffness: 120,
                    useNativeDriver: true,
                }),
            ]).start();
        } else if (shouldRender) {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 120,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 0.85,
                    duration: 120,
                    useNativeDriver: true,
                }),
            ]).start(({ finished }) => {
                if (finished) {
                    setShouldRender(false);
                }
            });
        }
    }, [visible, opacity, scale, shouldRender]);

    if (!shouldRender) { return null; }

    return (
        <Pressable style={styles.backdrop} onPress={onClose}>
            <Animated.View
                style={[
                    styles.container,
                    {
                        top: anchorY + 8,
                        right: anchorX,
                        opacity,
                        transform: [{ scale }],
                    },
                ]}>
                {/* Edit */}
                <Pressable
                    style={styles.item}
                    onPress={() => {
                        onClose();
                        setTimeout(onEdit, 150);
                    }}>
                    <Pencil size={18} color={Colors.text} strokeWidth={1.5} />
                    <Text style={styles.itemText}>Chỉnh sửa</Text>
                </Pressable>

                {/* Delete */}
                <Pressable
                    style={styles.item}
                    onPress={() => {
                        onClose();
                        setTimeout(onDelete, 150);
                    }}>
                    <Trash2 size={18} color={Colors.expense} strokeWidth={1.5} />
                    <Text style={[styles.itemText, { color: Colors.expense }]}>
                        Xóa ví
                    </Text>
                </Pressable>
            </Animated.View>
        </Pressable>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 100,
    },
    container: {
        position: 'absolute',
        minWidth: 180,
        backgroundColor: 'rgba(30, 30, 30, 0.95)',
        borderRadius: Radii.md,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        paddingVertical: 6,
        ...Shadows.menu,
        zIndex: 101,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    itemText: {
        fontSize: FontSizes.lg - 2,
        fontWeight: '500',
        color: Colors.text,
    },
});

export default React.memo(PopupMenu);
