import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createStaticNavigation } from '@react-navigation/native';
import { AppStack } from './src/navigation/AppStack';
import { BottomTabNavigator } from './src/navigation/BottomTabNavigator';

const AppNavigation = createStaticNavigation(AppStack);

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppNavigation />
    </SafeAreaProvider>
  );
}

export default App;
