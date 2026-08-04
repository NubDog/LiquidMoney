jest.mock('react-native-worklets', () => ({
  createSerializable: jest.fn(() => ({})),
  serializableMappingCache: new Map(),
  makeMutable: jest.fn(v => ({ value: v })),
  runOnJS: jest.fn(fn => fn),
  runOnUI: jest.fn(fn => fn),
  scheduleOnUI: jest.fn(fn => fn),
  executeOnUIRuntimeSync: jest.fn(fn => fn),
}), { virtual: true });
jest.mock('react-native-worklets-core', () => ({}), { virtual: true });

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('@react-native-community/blur', () => ({
  BlurView: 'BlurView',
}));

jest.mock('react-native-quick-sqlite', () => ({
  open: jest.fn(() => ({
    execute: jest.fn(() => ({ rows: { _array: [] } })),
  })),
}));

jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
  getString: jest.fn(() => Promise.resolve('')),
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
}));

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/path',
  exists: jest.fn(() => Promise.resolve(true)),
  mkdir: jest.fn(() => Promise.resolve()),
  copyFile: jest.fn(() => Promise.resolve()),
  unlink: jest.fn(() => Promise.resolve()),
}));
