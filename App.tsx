/**
 * App.tsx — Entry point LiquidMoney
 * Wrap toàn bộ app bằng StoreProvider + SafeAreaProvider
 */

import React from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from './src/store/useStore';
import AppNavigator from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <StatusBar
            barStyle="light-content"
            translucent
            backgroundColor="transparent"
          />
          <AppNavigator />
        </StoreProvider>
      </SafeAreaProvider>
    </View>
  );
}

export default App;
