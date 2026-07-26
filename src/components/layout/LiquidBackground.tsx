import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useStore } from '../../store/useStore';
import { BACKGROUNDS } from '../../assets/img/backgrounds';

const LiquidBackground: React.FC = () => {
    const selectedBackgroundId = useStore(state => state.selectedBackgroundId);
    
    let source;
    if (selectedBackgroundId) {
        if (BACKGROUNDS[selectedBackgroundId]) {
            source = BACKGROUNDS[selectedBackgroundId];
        } else {
            source = { uri: selectedBackgroundId };
        }
    } else {
        source = require('../../assets/img/Background.jpg');
    }

    return (
        <View style={styles.container}>
            <Image 
                source={source} 
                style={styles.image} 
                resizeMode="cover" 
                fadeDuration={0}
                progressiveRenderingEnabled={true}
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
