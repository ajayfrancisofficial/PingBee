import React, { useEffect, useMemo } from 'react';
import { createStaticNavigation } from '@react-navigation/native';
import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';
import { useAuthStore } from '../store/authStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { getNavigationTheme } from '../theme/navigationTheme';
import { StyleSheet, View } from 'react-native';
import { AppTheme } from '../theme';
import { runInitialLoad } from '../services/sync/InitialLoadService';
import { connect, disconnect } from '../services/websocket';

const AppNavigation = createStaticNavigation(AppStack);
const AuthNavigation = createStaticNavigation(AuthStack);

export const AuthSwitch = () => {
  const { isLoggedIn, isLoading, checkAuth } = useAuthStore();
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Initial Load + WebSocket connection logic
  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      // 1. Baseline sync (rest api)
      runInitialLoad();
      // 2. Real-time engine (websocket)
      connect();
    } else if (!isLoggedIn && !isLoading) {
      // Cleanup on logout
      disconnect();
    }
  }, [isLoggedIn, isLoading]);

  if (isLoading) {
    return null; // Awaiting Keychain extraction
  }

  const navTheme = getNavigationTheme(theme);
  return (
    <View style={styles.rootContainer}>
      {isLoggedIn ? (
        <AppNavigation theme={navTheme} />
      ) : (
        <AuthNavigation theme={navTheme} />
      )}
    </View>
  );
};

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    rootContainer: {
      flex: 1,
      backgroundColor: colors.backgrounds.default,
    },
  });
