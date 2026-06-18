import React, { useEffect, useState } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS } from 'react-native-reanimated';
import { FontSizes, Radii, Shadows, Spacing } from '../../common/theme';

export interface MenuItem {
    id: string;
    label: string;
    color?: string;
    onPress: () => void;
}

export interface ApplePopupMenuProps {
    visible: boolean;
    onClose: () => void;
    items: MenuItem[];
    anchor?: { x: number; y: number }; // x from right, y from top
}

const ApplePopupMenu: React.FC<ApplePopupMenuProps> = ({
    visible,
    onClose,
    items,
    anchor = { x: 16, y: 50 },
}) => {
    // We use a local state to keep the modal rendered while the close animation plays
    const [isRendered, setIsRendered] = useState(false);
    
    // Animation values
    const scaleAnim = useSharedValue(0.9);
    const opacityAnim = useSharedValue(0);
    const translateYAnim = useSharedValue(-10);

    useEffect(() => {
        if (visible) {
            setIsRendered(true);
            
            // Reset before animating (start closer to 1 to avoid large leaps)
            scaleAnim.value = 0.85;
            opacityAnim.value = 0;
            translateYAnim.value = -15;
            
            // Wait for Modal to mount to prevent frame drops/stuttering
            requestAnimationFrame(() => {
                opacityAnim.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
                scaleAnim.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.2)) });
                translateYAnim.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.back(1.2)) });
            });
        } else if (isRendered) {
            // Smooth exit animation
            opacityAnim.value = withTiming(0, { duration: 400 });
            scaleAnim.value = withTiming(0.8, { duration: 400 });
            translateYAnim.value = withTiming(-10, { duration: 400 }, (finished) => {
                if (finished) runOnJS(setIsRendered)(false);
            });
        }
    }, [visible]);

    const animatedOverlayStyle = useAnimatedStyle(() => ({
        opacity: opacityAnim.value
    }));

    const animatedMenuStyle = useAnimatedStyle(() => ({
        opacity: opacityAnim.value,
        transform: [
            { translateY: translateYAnim.value },
            { scale: scaleAnim.value }
        ]
    }));

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
                <Animated.View style={[StyleSheet.absoluteFill, animatedOverlayStyle]}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                </Animated.View>
                
                {/* Khung menu */}
                <Animated.View 
                    style={[
                        styles.menuContainer, 
                        {
                            top: anchor.y + 8,
                            right: anchor.x,
                        },
                        animatedMenuStyle
                    ]}
                >
                    <View style={styles.card}>
                        <View style={styles.itemsContainer} collapsable={false}>
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
                                                { backgroundColor: pressed ? 'rgba(255,255,255,0.05)' : 'transparent' }
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
                    </View>
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
        backgroundColor: '#1C1C1E', // Apple Dark Mode Elevated Card
        borderRadius: Radii.xl,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.1)',
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
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255,255,255,0.1)',
        width: '100%',
    },
});

export default React.memo(ApplePopupMenu);
