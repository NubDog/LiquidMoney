// TẬP TIN NÀY ĐƯỢC TẠO TỰ ĐỘNG BỞI SCRIPTS/GENERATEBACKGROUNDS.JS
// KHÔNG CHỈNH SỬA THỦ CÔNG - CHẠY `npm run generate` HOẶC `npm start` ĐỂ CẬP NHẬT

export const BACKGROUNDS: Record<string, any> = {
    'Background_0': require('./Background_0.jpg'),
    'Background_1': require('./Background_1.jpg'),
    'Background_2': require('./Background_2.jpg'),
    'Background_3': require('./Background_3.jpg'),
    'Background': require('./Background.jpg'),
};

export const BACKGROUND_KEYS = Object.keys(BACKGROUNDS);
