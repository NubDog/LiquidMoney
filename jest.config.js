module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-reanimated|@react-native-community|lucide-react-native|react-native-worklets|react-native-image-picker|react-native-fs)/)',
  ],
  setupFiles: ['./jest.setup.js'],
};
