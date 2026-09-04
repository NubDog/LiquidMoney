
/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';

// Lazy evaluation prevents evaluating App.tsx and all screens/assets when launching QuickWidgetOverlay
AppRegistry.registerComponent(appName, () => require('./App').default);
AppRegistry.registerComponent('QuickWidgetOverlay', () => require('./src/screens/QuickWidgetScreen').default);

