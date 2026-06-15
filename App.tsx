import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthSwitch } from './src/navigation/AuthSwitch';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Snackbar } from './src/components/foundations/Snackbar';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { startNetworkListener } from './src/store/networkStore';

// Start the global network listener once at app boot.
// Add future app-wide network reactions to networkStore instead of new listeners.
startNetworkListener();

const queryClient = new QueryClient();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider navigationBarTranslucent>
        <BottomSheetModalProvider>
          <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
              <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                translucent={true}
              />
              <AuthSwitch />
              <Snackbar />
            </QueryClientProvider>
          </SafeAreaProvider>
        </BottomSheetModalProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

export default App;
