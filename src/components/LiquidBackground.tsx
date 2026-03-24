import React from 'react';
import { StyleSheet, View, Image } from 'react-native';

const LiquidBackground: React.FC = () => {
    return (
        <View style={styles.container}>
            <Image 
                source={require('../assets/img/Background.jpg')} 
                style={StyleSheet.absoluteFill} 
                resizeMode="cover" 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
    },
});

export default LiquidBackground;
