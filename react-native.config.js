/**
 * react-native.config.js
 *
 * Cấu hình autolinking cho các native module.
 * react-native-quick-sqlite không có react-native.config.js nên cần khai báo thủ công.
 */
module.exports = {
    dependencies: {
        'react-native-quick-sqlite': {
            platforms: {
                android: {
                    sourceDir: '../node_modules/react-native-quick-sqlite/android',
                    packageImportPath: 'import com.margelo.rnquicksqlite.SequelPackage;',
                    packageInstance: 'new SequelPackage()',
                },
            },
        },
    },
};
