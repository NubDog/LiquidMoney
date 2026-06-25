import React from 'react';
import {
    Modal,
    StyleSheet,
    View,
    Text,
    Pressable,
    ScrollView,
    Image,
    Animated,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { X, CheckCircle2, Plus } from 'lucide-react-native';
import { BACKGROUNDS, BACKGROUND_KEYS } from '../../assets/img/backgrounds';
import { useStore } from '../../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { launchImageLibrary } from 'react-native-image-picker';
import AppleIconButton from '../ui/AppleIconButton';
import { Colors, FontSizes, Radii, Spacing } from '../../common/theme';

interface BackgroundPickerModalProps {
    visible: boolean;
    onClose: () => void;
}

const BackgroundPickerModal: React.FC<BackgroundPickerModalProps> = ({
    visible,
    onClose,
}) => {
    const { 
        selectedBackgroundId, 
        setSelectedBackground,
        customBackgrounds,
        addCustomBackground,
        validateCustomBackgrounds,
    } = useStore(useShallow(state => ({
        selectedBackgroundId: state.selectedBackgroundId,
        setSelectedBackground: state.setSelectedBackground,
        customBackgrounds: state.customBackgrounds,
        addCustomBackground: state.addCustomBackground,
        validateCustomBackgrounds: state.validateCustomBackgrounds,
    })));

    React.useEffect(() => {
        if (visible) {
            validateCustomBackgrounds();
        }
    }, [visible, validateCustomBackgrounds]);

    const handleAddCustomBackground = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
            if (response.didCancel || response.errorCode || !response.assets?.length) {
                return;
            }
            const uri = response.assets[0].uri;
            if (uri) {
                addCustomBackground(uri);
                setSelectedBackground(uri);
                onClose();
            }
        });
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            statusBarTranslucent={true}
            onRequestClose={onClose}>
            <View style={styles.modalRoot}>
                <View style={StyleSheet.absoluteFillObject}>
                    <BlurView
                        style={StyleSheet.absoluteFill}
                        blurType="light"
                        blurAmount={30}
                        overlayColor="transparent"
                        reducedTransparencyFallbackColor="transparent"
                    />
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]} />
                </View>

                <View style={styles.header}>
                    <Text style={styles.title}>Chọn Hình Nền</Text>
                    <AppleIconButton onPress={onClose} style={styles.closeBtn} size={42} icon={<X color="#FFF" size={24} />} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}>
                    <View style={styles.grid}>
                        {/* Add Custom Background Button */}
                        <Pressable
                            style={[styles.itemWrapper, styles.addButton]}
                            onPress={handleAddCustomBackground}>
                            <Plus color="#FFF" size={32} />
                        </Pressable>

                        {/* Custom Backgrounds */}
                        {customBackgrounds.map((uri) => {
                            const isSelected = selectedBackgroundId === uri;
                            return (
                                <Pressable
                                    key={uri}
                                    style={[
                                        styles.itemWrapper,
                                        isSelected && styles.selectedItem,
                                    ]}
                                    onPress={() => {
                                        setSelectedBackground(uri);
                                        onClose();
                                    }}>
                                    <Image
                                        source={{ uri }}
                                        style={styles.imageThumb}
                                        resizeMode="cover"
                                    />
                                    {isSelected && (
                                        <View style={styles.checkBadge}>
                                            <CheckCircle2 color={Colors.income} size={28} />
                                        </View>
                                    )}
                                </Pressable>
                            );
                        })}

                        {/* Default Option (No specific background -> use Fallback/Default) */}
                        <Pressable
                            style={[
                                styles.itemWrapper,
                                !selectedBackgroundId && styles.selectedItem,
                            ]}
                            onPress={() => {
                                setSelectedBackground(null);
                                onClose();
                            }}>
                            <Image
                                source={require('../../assets/img/Background.jpg')}
                                style={styles.imageThumb}
                                resizeMode="cover"
                            />
                            {!selectedBackgroundId && (
                                <View style={styles.checkBadge}>
                                    <CheckCircle2 color={Colors.income} size={28} />
                                </View>
                            )}
                        </Pressable>

                        {/* Available Backgrounds from dynamic generator */}
                        {BACKGROUND_KEYS.map((key) => {
                            const isSelected = selectedBackgroundId === key;
                            return (
                                <Pressable
                                    key={key}
                                    style={[
                                        styles.itemWrapper,
                                        isSelected && styles.selectedItem,
                                    ]}
                                    onPress={() => {
                                        setSelectedBackground(key);
                                        onClose();
                                    }}>
                                    <Image
                                        source={BACKGROUNDS[key]}
                                        style={styles.imageThumb}
                                        resizeMode="cover"
                                    />
                                    {isSelected && (
                                        <View style={styles.checkBadge}>
                                            <CheckCircle2 color={Colors.income} size={28} />
                                        </View>
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalRoot: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.md,
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: '#FFF',
    },
    closeBtn: {
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 100,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: Spacing.md,
    },
    itemWrapper: {
        width: '47%',
        aspectRatio: 0.6,
        marginBottom: Spacing.lg,
        borderRadius: Radii.xl,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedItem: {
        borderColor: Colors.income,
    },
    addButton: {
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        borderStyle: 'dashed',
    },
    imageThumb: {
        width: '100%',
        height: '100%',
    },
    checkBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: Radii.pill,
    },
});

export default BackgroundPickerModal;
