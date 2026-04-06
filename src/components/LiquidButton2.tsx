import React, { useRef, useState } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
    type ViewStyle,
    type StyleProp,
    Platform,
    LayoutChangeEvent,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

interface LiquidButton2Props {
    onPress: () => void;
    title: string;
    icon?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = {
    useNativeDriver: true,
    friction: 7,
    tension: 100,
};

const LiquidButton2: React.FC<LiquidButton2Props> = ({
    onPress,
    title,
    icon,
    style,
}) => {
    const scale = useRef(new Animated.Value(1)).current;
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const handlePressIn = () => {
        Animated.spring(scale, { ...SPRING_CONFIG, toValue: 0.94 }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, { ...SPRING_CONFIG, toValue: 1 }).start();
    };

    const onLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setDimensions({ width, height });
    };

    const isAndroid = Platform.OS === 'android';
    const hasDimensions = dimensions.width > 0 && dimensions.height > 0;
    const pillRadius = hasDimensions ? dimensions.height / 2 : 100;

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onLayout={onLayout}
            style={[
                styles.container,
                { transform: [{ scale }] },
                style,
            ]}
        >
            {/* Bao bọc BlurView bằng thẻ View chuẩn để ép Android Cắt (Clip) viền hình chữ nhật thừa */}
            <View style={styles.glassWrapper}>
                {/* @ts-ignore */}
                <BlurView
                    blurType="light"
                    blurAmount={8}
                    overlayColor="transparent"
                    reducedTransparencyFallbackColor="transparent"
                >
                {/* SVG nằm dưới cùng dùng để tạo viền và ánh sáng mờ */}
                {hasDimensions && (
                    <Svg width={dimensions.width} height={dimensions.height} style={StyleSheet.absoluteFill}>
                        <Defs>
                            <RadialGradient id="scatterTL" cx="0%" cy="0%" rx="100%" ry="100%">
                                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.15" />
                                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                            </RadialGradient>
                            
                            <RadialGradient id="scatterBR" cx="100%" cy="100%" rx="100%" ry="100%">
                                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.08" />
                                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
                            </RadialGradient>

                            <LinearGradient id="borderGradient" x1="0" y1="0" x2="1" y2="1">
                                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.3" />
                                <Stop offset="0.3" stopColor="#FFFFFF" stopOpacity="0.05" />
                                <Stop offset="0.7" stopColor="#FFFFFF" stopOpacity="0.0" />
                                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.05" />
                            </LinearGradient>
                        </Defs>
                        
                        <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="url(#scatterTL)" rx={pillRadius} />
                        <Rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="url(#scatterBR)" rx={pillRadius} />
                        
                        <Rect x="0.5" y="0.5" width={dimensions.width - 1} height={dimensions.height - 1} fill="none" stroke="url(#borderGradient)" strokeWidth="0.5" rx={pillRadius - 0.5} />
                    </Svg>
                )}

                {/* Content bọc trong BlurView để lõi Android BlurView ẩn nó đi trước khi chụp màn hình nền */}
                <View style={styles.content} collapsable={false}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text key="text-clean" style={styles.text}>{title}</Text>
                </View>
            </BlurView>
            </View>
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    container: {
        alignSelf: 'flex-start',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 9999,
    },
    glassWrapper: {
        borderRadius: 9999,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 28,
    },
    iconContainer: {
        marginRight: 8,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
        backgroundColor: 'transparent',
    },
});

export default LiquidButton2;
