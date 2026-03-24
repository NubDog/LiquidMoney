const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '../src/assets/img');
const outputFile = path.join(imgDir, 'backgrounds.ts');

const files = fs.readdirSync(imgDir);

const backgroundFiles = files.filter(f => f.startsWith('Background') && (f.endsWith('.jpg') || f.endsWith('.png')));

// Sort naturally so Background_2 comes before Background_10
backgroundFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

let fileContent = `// TẬP TIN NÀY ĐƯỢC TẠO TỰ ĐỘNG BỞI SCRIPTS/GENERATEBACKGROUNDS.JS
// KHÔNG CHỈNH SỬA THỦ CÔNG - CHẠY \`npm run generate\` HOẶC \`npm start\` ĐỂ CẬP NHẬT

export const BACKGROUNDS: Record<string, any> = {
`;

backgroundFiles.forEach(file => {
    const id = file.replace(/\.[^/.]+$/, ''); // Remove extension
    fileContent += `    '${id}': require('./${file}'),\n`;
});

fileContent += `};\n\n`;
fileContent += `export const BACKGROUND_KEYS = Object.keys(BACKGROUNDS);\n`;

fs.writeFileSync(outputFile, fileContent);
console.log(`[LiquidMoney] ✅ Đã cập nhật ${backgroundFiles.length} hình nền vào backgrounds.ts`);
