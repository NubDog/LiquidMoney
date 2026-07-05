import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    View,
    Text,
    Pressable,
    ScrollView,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { X, ChevronDown, ChevronUp, Droplet, ArrowLeftRight, Maximize } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    Easing,
} from 'react-native-reanimated';

import { useStore } from '../../store/useStore';
import AppleIconButton from '../ui/AppleIconButton';
import { Colors, FontSizes, Radii, Spacing } from '../../common/theme';

interface SlowTimeAnimationModalProps {
    visible: boolean;
    onClose: () => void;
}

const ANIMATIONS = [
    {
        id: 'fade',
        title: 'Fade',
        subtitle: 'Smooth opacity transition',
        icon: Droplet,
    },
    {
        id: 'slide',
        title: 'Slide',
        subtitle: 'Horizontal translation',
        icon: ArrowLeftRight,
    },
    {
        id: 'zoom',
        title: 'Zoom',
        subtitle: 'Scale effect',
        icon: Maximize,
    },
] as const;

const AccordionItem: React.FC<{
    item: typeof ANIMATIONS[number];
    value: number;
    onChange: (val: number) => void;
}> = ({ item, value, onChange }) => {
    const [expanded, setExpanded] = useState(false);
    const heightAnim = useSharedValue(0);

    const toggleExpand = () => {
        const nextState = !expanded;
        setExpanded(nextState);
        heightAnim.value = withTiming(nextState ? 100 : 0, {
            duration: 300,
            easing: Easing.out(Easing.cubic),
        });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        height: heightAnim.value,
        opacity: heightAnim.value > 0 ? 1 : 0,
        overflow: 'hidden',
    }));

    const Icon = item.icon;

    return (
        <View style={styles.accordionContainer}>
            <Pressable
                style={({ pressed }) => [
                    styles.accordionHeader,
                    pressed && { opacity: 0.7 },
                    expanded && styles.accordionHeaderExpanded
                ]}
                onPress={toggleExpand}
            >
                <View style={styles.iconCircle}>
                    <Icon size={20} color={Colors.text} strokeWidth={2} />
                </View>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.titleText}>{item.title}</Text>
                    <Text style={styles.subtitleText}>{item.subtitle}</Text>
                </View>
                {expanded ? (
                    <ChevronUp size={20} color={Colors.textMuted} />
                ) : (
                    <ChevronDown size={20} color={Colors.textMuted} />
                )}
            </Pressable>

            <Animated.View style={animatedStyle}>
                <View style={styles.sliderContainer}>
                    <View style={styles.sliderHeader}>
                        <Text style={styles.sliderLabel}>Duration</Text>
                        <Text style={styles.sliderValue}>{value.toFixed(1)}s</Text>
                    </View>
                    
                    <Slider
                        style={{ width: '100%', height: 40 }}
                        minimumValue={0}
                        maximumValue={20}
                        step={0.1}
                        value={value}
                        onSlidingComplete={onChange}
                        minimumTrackTintColor={Colors.income}
                        maximumTrackTintColor="rgba(255, 255, 255, 0.1)"
                        thumbTintColor="#FFFFFF"
                    />
                    
                    <View style={styles.sliderFooter}>
                        <Text style={styles.sliderMinMax}>0s</Text>
                        <Text style={styles.sliderMinMax}>20s</Text>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
};

const SlowTimeAnimationModal: React.FC<SlowTimeAnimationModalProps> = ({
    visible,
    onClose,
}) => {
    const devAnimations = useStore((state) => state.devAnimations);
    const setDevAnimation = useStore((state) => state.setDevAnimation);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            hardwareAccelerated={true}
            animationType="slide"
            statusBarTranslucent={true}
            onRequestClose={onClose}>
            <View style={styles.overlay}>
                <BlurView
                    style={StyleSheet.absoluteFill}
                    blurType="dark"
                    blurAmount={20}
                    reducedTransparencyFallbackColor="rgba(0,0,0,0.9)"
                />

                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Slow time animation</Text>
                        <AppleIconButton
                            icon={<X size={24} color={Colors.text} strokeWidth={2.5} />}
                            onPress={onClose}
                            size={40}
                            backgroundColor="rgba(255, 255, 255, 0.1)"
                        />
                    </View>

                    {/* Content */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}>
                        
                        {ANIMATIONS.map((anim) => (
                            <AccordionItem
                                key={anim.id}
                                item={anim}
                                value={devAnimations[anim.id]}
                                onChange={(val) => setDevAnimation(anim.id, val)}
                            />
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    container: {
        height: '80%',
        backgroundColor: 'rgba(28, 28, 30, 0.8)', // Apple Elevated Card Dark
        borderTopLeftRadius: Radii.xl,
        borderTopRightRadius: Radii.xl,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerTitle: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.text,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: 100,
        gap: Spacing.md,
    },
    accordionContainer: {
        backgroundColor: '#1C1C1E', // standard dark mode element
        borderRadius: Radii.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    accordionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    accordionHeaderExpanded: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    headerTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    titleText: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 2,
    },
    subtitleText: {
        fontSize: FontSizes.sm,
        color: Colors.textMuted,
    },
    sliderContainer: {
        padding: Spacing.lg,
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    sliderLabel: {
        fontSize: FontSizes.md,
        color: Colors.text,
    },
    sliderValue: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.income, // Use app blue/green color
    },
    sliderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -4,
        paddingHorizontal: 12,
    },
    sliderMinMax: {
        fontSize: FontSizes.xs,
        color: Colors.textMuted,
    },
});

export default SlowTimeAnimationModal;
