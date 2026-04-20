const fs = require('fs');
const path = require('path');

const dir = '/run/media/Shark/Shark/Project/LiquidMoney/src/components';
const files = [
    'AnimatedOverlay.tsx', 'BackgroundPickerModal.tsx', 'ConfirmDialog.tsx',
    'ConfirmImportDialog.tsx', 'EditWalletModal.tsx', 'InfoDialog.tsx',
    'LiquidContext.tsx', 'LiquidFAB.tsx', 'LiquidModal.tsx', 'PopupMenu.tsx',
    'TerminalLogModal.tsx', 'TransactionDetailOverlay.tsx', 'TransactionFilterBar.tsx',
    'TransactionModal.tsx', 'WalletDetailSkeleton.tsx', 'WalletModal.tsx'
];

files.forEach(file => {
    try {
        const content = fs.readFileSync(path.join(dir, file), 'utf-8');
        const interfaceMatch = content.match(/interface \w+Props[^\{]*\{([^}]+)\}/);
        const typeMatch = content.match(/type \w+Props[^=]*=([^;]+);/);
        
        console.log(`\n--- ${file} ---`);
        if (interfaceMatch) {
            console.log(interfaceMatch[1].trim());
        } else if (typeMatch) {
            console.log(typeMatch[1].trim());
        } else {
            console.log("No Props interface found");
        }
    } catch (e) {
        console.log(`Could not read ${file}`);
    }
});
