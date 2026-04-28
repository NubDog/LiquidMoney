import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

interface AppleGlassBackgroundProps {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    /**
     * Blur material type. 
     * iOS hỗ trợ các material cực đẹp như: 'material', 'thinMaterial', 'thickMaterial', 'chromeMaterial'
     * Android fallback về 'light', 'dark', 'regular'
     */
    variant?: 'light' | 'dark' | 'chromeMaterial' | 'regular' | 'prominent' | 'thinMaterial' | 'material' | 'thickMaterial' | 'ultraThinMaterial';
    borderRadius?: number;
    /**
     * Tự động set flex: 1 để fill không gian nếu cần
     */
    fillContainer?: boolean;
}

/**
 * AppleGlassBackground
 * 
 * Nền chuẩn kính mờ (Frosted Glass / Vibrancy) của Apple.
 * Sử dụng blur native của OS kết hợp với hiệu ứng ánh sáng (Shine) và viền (Border Highlight).
 */
const AppleGlassBackground: React.FC<AppleGlassBackgroundProps> = ({
    children,
    style,
    contentContainerStyle,
    variant = 'chromeMaterial',
    borderRadius = 20,
    fillContainer = false,
}) => {
    const isDark = variant.toLowerCase().includes('dark');

    return (
        <View 
            style={[
                styles.container, 
                { borderRadius, overflow: 'hidden' }, 
                fillContainer && styles.fillContainer,
                style
            ]}
            collapsable={false}
        >
            {/* 
              Lớp Kính Mờ (Blur) 
              QUAN TRỌNG: Mọi nội dung hiển thị bên trên kính (SVG, Chữ, Icon) ĐỀU ĐƯỢC ĐẶT BÊN TRONG <BlurView>.
              Lý do: Trên Android, BlurView dùng ViewTreeObserver để chụp lại toàn bộ màn hình (DecorView) để làm mờ. 
              Nếu nội dung nằm bên ngoài BlurView (là sibling), nội dung đó cũng sẽ bị hệ thống vẽ vào bức ảnh nền chụp được, 
              dẫn đến việc chữ bị làm mờ và tạo ra một cái bóng (phát quang / halo effect) cực kỳ khó chịu.
              Nhưng khi nội dung nằm TRONG BlurView, native code của BlurView sẽ chủ động bỏ qua (exclude) các children của nó khi chụp ảnh nền!
              Đây là mấu chốt để fix lỗi phát quang chữ trên Android.
            */}
            <BlurView
                style={[styles.blurWrapper, fillContainer && styles.fillContainer]}
                blurType={Platform.OS === 'android' ? (isDark ? 'dark' : 'light') : variant}
                blurAmount={Platform.OS === 'ios' ? 25 : 15}
                reducedTransparencyFallbackColor={isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(250, 250, 250, 0.95)'}
            >
                {/* Hiệu ứng ánh sáng chéo (Diagonal Shine) chuẩn Apple Glass */}
                <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                    <Defs>
                        <LinearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={isDark ? "0.15" : "0.4"} />
                            <Stop offset="0.4" stopColor="#FFFFFF" stopOpacity="0" />
                            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={isDark ? "0.02" : "0.1"} />
                        </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#shine)" />
                </Svg>

                {/* Vệt Sáng Viền Kính (Apple Border Highlight) */}
                <View 
                    style={[
                        StyleSheet.absoluteFill, 
                        styles.borderOverlay, 
                        { borderRadius }
                    ]} 
                    pointerEvents="none"
                    collapsable={false}
                />

                {/* Nội Dung (Chữ, Icon, v.v...) - Sẽ định hình kích thước cho toàn bộ khung kính */}
                <View 
                    style={[styles.content, fillContainer && styles.fillContainer, contentContainerStyle]} 
                    collapsable={false}
                >
                    {children}
                </View>
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
    },
    blurWrapper: {
        // Flex 1 để nó giãn ra theo nội dung bên trong
        flexGrow: 1, 
    },
    fillContainer: {
        flex: 1,
    },
    borderOverlay: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.2)', // Phản chiếu ánh sáng chung quanh viền
        borderTopColor: 'rgba(255, 255, 255, 0.4)', // Cạnh trên bắt sáng mạnh nhất
        borderBottomColor: 'rgba(255, 255, 255, 0.05)', // Cạnh dưới khuất sáng
    },
    content: {
        zIndex: 1, 
    },
});

export default React.memo(AppleGlassBackground);
