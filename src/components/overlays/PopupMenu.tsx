import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
    Dimensions,
    Easing,
} from 'react-native';
import { Colors, FontSizes, Radii, Shadows, Spacing } from '../../common/theme';
import BackgroundLiquidGlass from '../layout/BackgroundLiquidGlass';

export interface MenuItem {
    id: string;
    label: string;
    color?: string;
    onPress: () => void;
}

export interface PopupMenuProps {
    visible: boolean;
    onClose: () => void;
    items: MenuItem[];
    anchor?: { x: number; y: number }; // x from right, y from top
}

const PopupMenu: React.FC<PopupMenuProps> = ({
    visible,
    onClose,
    items,
    anchor = { x: 16, y: 50 },
}) => {
    // We use a local state to keep the modal rendered while the close animation plays
    const [isRendered, setIsRendered] = useState(false);
    
    // Animation values
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(-10)).current;

    useEffect(() => {
        if (visible) {
            setIsRendered(true);
            
            // Reset before animating (start closer to 1 to avoid large leaps)
            scaleAnim.setValue(0.85);
            opacityAnim.setValue(0);
            translateYAnim.setValue(-15);
            
            // Wait for Modal to mount to prevent frame drops/stuttering
            requestAnimationFrame(() => {
                Animated.parallel([
                    Animated.timing(opacityAnim, {
                        toValue: 1,
                        duration: 150,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 250,
                        easing: Easing.out(Easing.back(1.2)),
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateYAnim, {
                        toValue: 0,
                        duration: 250,
                        easing: Easing.out(Easing.back(1.2)),
                        useNativeDriver: true,
                    }),
                ]).start();
            });
        } else if (isRendered) {
            // Smooth exit animation
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(translateYAnim, {
                    toValue: -10,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setIsRendered(false);
            });
        }
    }, [visible]);

    if (!visible && !isRendered) return null;

    return (
        <Modal
            visible={isRendered}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}>
            <View style={styles.root}>
                {/* Overlay để click ra ngoài là tắt */}
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: opacityAnim }]}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                </Animated.View>
                
                {/* Khung menu */}
                <Animated.View 
                    style={[
                        styles.menuContainer, 
                        {
                            top: anchor.y + 8,
                            right: anchor.x,
                            opacity: opacityAnim,
                            transform: [
                                { translateY: translateYAnim },
                                { scale: scaleAnim }
                            ],
                        }
                    ]}
                >
                    <BackgroundLiquidGlass 
                        style={styles.card}
                        variant="dense" // Nền đục nhất
                        borderRadius={Radii.xl}
                    >
                        <View style={styles.itemsContainer}>
                            {items.map((item, index) => {
                                const isLast = index === items.length - 1;
                                
                                return (
                                    <React.Fragment key={item.id}>
                                        <Pressable
                                            onPress={() => {
                                                // Đợi animation đóng xong mới gọi hàm
                                                onClose();
                                                setTimeout(() => item.onPress(), 200);
                                            }}
                                            style={({ pressed }) => [
                                                styles.item,
                                                { backgroundColor: pressed ? 'rgba(255,255,255,0.1)' : 'transparent' }
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.itemLabel,
                                                    { color: item.color || '#FFFFFF' },
                                                ]}>
                                                {item.label}
                                            </Text>
                                        </Pressable>
                                        
                                        {/* Dấu gạch ngang phân cách giữa các nút */}
                                        {!isLast && <View style={styles.separator} />}
                                    </React.Fragment>
                                );
                            })}
                        </View>
                    </BackgroundLiquidGlass>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    menuContainer: {
        position: 'absolute',
        width: 180,
        ...Shadows.card,
        elevation: 8,
    },
    card: {
        overflow: 'hidden',
    },
    itemsContainer: {
        flexDirection: 'column',
    },
    item: {
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemLabel: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        textAlign: 'center',
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
        width: '100%',
    },
});

export default PopupMenu;
