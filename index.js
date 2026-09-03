
/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import QuickWidgetScreen from './src/screens/QuickWidgetScreen';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent('QuickWidgetOverlay', () => QuickWidgetScreen);
