/**
 * MeshBackground.tsx — Nền ứng dụng
 * Đã chuyển thành màu đen tuyền (#000000) theo yêu cầu người dùng
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

const MeshBackground: React.FC = () => {
    return <View style={styles.container} />;
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000', // Solid black
        zIndex: -1,
    },
});

export default MeshBackground;
