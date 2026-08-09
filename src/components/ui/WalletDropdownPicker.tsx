/**
 * WalletDropdownPicker.tsx
 * Component chọn Ví dạng Pill Bar với animation xoay mũi tên 180° và menu trượt mượt mà.
 */

import React, { useEffect, useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
    Platform,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { ChevronDown, Wallet as WalletIcon } from 'lucide-react-native';
import { Wallet } from '../../common/types';

interface WalletDropdownPickerProps {
    wallets: Wallet[];
    selectedWalletId: string;
    onSelectWallet: (walletId: string) => void;
}

const WalletDropdownPicker: React.FC<WalletDropdownPickerProps> = ({
    wallets,
    selectedWalletId,
    onSelectWallet,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Animation values
    const arrowRotation = useSharedValue(0); // 0 -> 1 (0deg -> 180deg)
    const dropdownProgress = useSharedValue(0); // 0 -> 1

    const selectedWallet = wallets.find(w => w.id === selectedWalletId) || wallets[0];

    // Handle open/close animations
    useEffect(() => {
        if (isOpen) {
            setIsMounted(true);

            // Rotate arrow to 180deg smoothly
            arrowRotation.value = withTiming(1, {
                duration: 280,
                easing: Easing.out(Easing.cubic),
            });

            // Slide down & fade in dropdown popup
            dropdownProgress.value = withTiming(1, {
                duration: 320,
                easing: Easing.out(Easing.back(1.1)),
            });
        } else {
            // Rotate arrow back to 0deg
            arrowRotation.value = withTiming(0, {
                duration: 250,
                easing: Easing.out(Easing.cubic),
            });

            // Slide up & fade out dropdown popup
            dropdownProgress.value = withTiming(
                0,
                {
                    duration: 220,
                    easing: Easing.inOut(Easing.quad),
                },
                (finished) => {
                    if (finished) {
                        runOnJS(setIsMounted)(false);
                    }
                }
            );
        }
    }, [isOpen]);

    const animatedArrowStyle = useAnimatedStyle(() => ({
        transform: [
            {
                rotate: `${arrowRotation.value * 180}deg`,
            },
        ],
    }));

    const animatedDropdownStyle = useAnimatedStyle(() => ({
        opacity: dropdownProgress.value,
        transform: [
            { translateY: (1 - dropdownProgress.value) * -14 },
            { scale: 0.94 + dropdownProgress.value * 0.06 },
        ],
    }));

    const toggleOpen = () => {
        setIsOpen(prev => !prev);
    };

    return (
        <View style={styles.wrapper}>
            {/* Pill Button */}
            <Pressable
                onPress={toggleOpen}
                style={({ pressed }) => [
                    styles.walletPillBtn,
                    pressed && styles.walletPillBtnPressed,
                ]}
            >
                <WalletIcon size={16} color="#8E8E93" style={{ marginRight: 8 }} />
                <Text style={styles.walletPillText} numberOfLines={1}>
                    {selectedWallet ? selectedWallet.name : 'Chọn ví'}
                </Text>
                <Animated.View style={[{ marginLeft: 6 }, animatedArrowStyle]}>
                    <ChevronDown size={16} color="#8E8E93" />
                </Animated.View>
            </Pressable>

            {/* Animated Dropdown Menu */}
            {isMounted && (
                <Animated.View style={[styles.dropdownPopup, animatedDropdownStyle]}>
                    {wallets.map(w => {
                        const isSelected = w.id === selectedWalletId;
                        return (
                            <Pressable
                                key={w.id}
                                onPress={() => {
                                    onSelectWallet(w.id);
                                    setIsOpen(false);
                                }}
                                style={({ pressed }) => [
                                    styles.dropdownItem,
                                    isSelected && styles.dropdownItemActive,
                                    pressed && styles.dropdownItemPressed,
                                ]}
                            >
                                <WalletIcon
                                    size={16}
                                    color={isSelected ? '#FFFFFF' : '#8E8E93'}
                                    style={{ marginRight: 10 }}
                                />
                                <Text
                                    style={[
                                        styles.dropdownItemText,
                                        isSelected && styles.dropdownItemTextActive,
                                    ]}
                                >
                                    {w.name}
                                </Text>
                            </Pressable>
                        );
                    })}
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        marginBottom: 20,
        zIndex: 999,
    },
    walletPillBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    walletPillBtnPressed: {
        opacity: 0.8,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
    walletPillText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        maxWidth: 160,
    },
    dropdownPopup: {
        position: 'absolute',
        top: 48,
        backgroundColor: '#2C2C2E',
        borderRadius: 16,
        width: 220,
        alignSelf: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
            },
            android: {
                elevation: 10,
            },
        }),
        zIndex: 9999,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 13,
    },
    dropdownItemActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
    dropdownItemPressed: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },
    dropdownItemText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        fontWeight: '500',
    },
    dropdownItemTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
});

export default React.memo(WalletDropdownPicker);
