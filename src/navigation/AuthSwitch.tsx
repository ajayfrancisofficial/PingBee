import React, { useEffect, useMemo } from 'react';
import { createStaticNavigation } from '@react-navigation/native';
import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';
import { useAuthStore } from '../store/authStore';
import { navigationRef } from './navigationRef';
import { useAppTheme } from '../hooks/useAppTheme';
import { getNavigationTheme } from '../theme/navigationTheme';
import { StyleSheet, View } from 'react-native';
import { AppTheme } from '../theme';
import { useWebsocket } from '../hooks/useWebsocket';
import { usePushNotifications } from '../hooks/usePushNotifications';

const AppNavigation = createStaticNavigation(AppStack);
const AuthNavigation = createStaticNavigation(AuthStack);

export const AuthSwitch = () => {
  const { isLoggedIn, isLoading, checkAuth } = useAuthStore();
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  // Handle WebSocket lifecycle
  useWebsocket();

  // Handle Push Notification setup and lifecycle
  usePushNotifications(isLoggedIn);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return null; // Awaiting Keychain extraction
  }

  const navTheme = getNavigationTheme(theme);
  return (
    <View style={styles.rootContainer}>
      {isLoggedIn ? (
        <AppNavigation ref={navigationRef} theme={navTheme} />
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
