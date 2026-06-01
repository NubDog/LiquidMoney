import RNFS from 'react-native-fs';

/**
 * Service xử lý hình ảnh cục bộ (Local Image Service)
 * Đảm bảo hình ảnh được lưu trữ an toàn trong DocumentDirectoryPath của app
 * thay vì CacheDirectory (tránh bị hệ điều hành xóa đi theo thời gian).
 */

export const imageService = {
    /**
     * Copy ảnh từ thư mục Cache (của image-picker) sang Document (Lưu trữ vĩnh viễn)
     * @param tempUri URI của file ảnh gốc
     * @returns URI của file ảnh đích (đã được lưu vĩnh viễn)
     */
    saveImageToLocal: async (tempUri: string): Promise<string> => {
        try {
            if (!tempUri) return tempUri;
            
            // Bỏ tiền tố "file://" nếu có ở môi trường RNFS (tùy thuộc HĐH)
            const cleanPath = tempUri.replace('file://', '');
            
            // Lấy tên file gốc (phần tử cuối sau dấu /)
            const fileName = tempUri.split('/').pop() || `bg_${Date.now()}.jpg`;
            
            // Tạo tên file độc nhất để tránh trùng lặp nếu người dùng chọn cùng một ảnh nhiều lần
            const uniqueFileName = `${Date.now()}_${fileName}`;
            const destPath = `${RNFS.DocumentDirectoryPath}/${uniqueFileName}`;

            // Tiến hành copy
            await RNFS.copyFile(cleanPath, destPath);

            // Trả về URI chuẩn có tiền tố file:// để RN `<Image />` render được
            return `file://${destPath}`;
        } catch (error) {
            console.error('[imageService] Failed to save image:', error);
            // Nếu có lỗi thì đành phải dùng tạm uri cũ (chấp nhận rủi ro mất ảnh)
            return tempUri;
        }
    },

    /**
     * Xóa một file ảnh nếu không còn dùng đến
     * @param uri URI của ảnh cần xóa
     */
    deleteLocalImage: async (uri: string) => {
        try {
            if (!uri || !uri.startsWith('file://' + RNFS.DocumentDirectoryPath)) return;
            const path = uri.replace('file://', '');
            
            const exists = await RNFS.exists(path);
            if (exists) {
                await RNFS.unlink(path);
            }
        } catch (error) {
            console.error('[imageService] Failed to delete image:', error);
        }
    }
};
