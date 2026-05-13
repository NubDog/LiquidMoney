import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useStore } from '../../store/useStore';
import { BACKGROUNDS } from '../../assets/img/backgrounds';

const LiquidBackground: React.FC = () => {
    const selectedBackgroundId = useStore(state => state.selectedBackgroundId);
    
    // Fallback: nếu selectedBackgroundId không có (null), dùng Background_0.jpg mặc định
    const source = selectedBackgroundId && BACKGROUNDS[selectedBackgroundId] 
        ? BACKGROUNDS[selectedBackgroundId] 
        : require('../../assets/img/Background_0.jpg');

    return (
        <View style={styles.container}>
            <Image 
                source={source} 
                style={styles.image} 
                resizeMode="cover" 
                fadeDuration={0}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});

export default LiquidBackground;
